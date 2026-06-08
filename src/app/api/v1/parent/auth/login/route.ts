import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helpers";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return apiError("VALIDATION_ERROR", "Email is required", 400);
    }

    // Normalized email
    const normEmail = email.toLowerCase().trim();

    // Check if the user already exists in DB
    let user = await prisma.user.findFirst({
      where: { email: normEmail },
      include: {
        role: true,
        branch: true,
        parent: {
          include: {
            children: {
              include: {
                student: {
                  include: {
                    enrollments: {
                      orderBy: { enrolledAt: "desc" },
                      take: 1,
                      include: {
                        section: {
                          include: {
                            class: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // If user does not exist, check if there are any students with this fatherEmail or motherEmail
    if (!user) {
      const matchingStudents = await prisma.student.findMany({
        where: {
          OR: [
            { fatherEmail: normEmail },
            { motherEmail: normEmail },
          ],
        },
        include: {
          enrollments: {
            orderBy: { enrolledAt: "desc" },
            take: 1,
            include: {
              section: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
      });

      if (matchingStudents.length === 0) {
        return apiError("NOT_FOUND", "No student records found with this parent email.", 404);
      }

      // We have matching students! Let's dynamically provision a Parent User account.
      // 1. Find the PARENT role in the database
      const parentRole = await prisma.role.findFirst({
        where: { name: "PARENT" },
      });

      if (!parentRole) {
        return apiError("SERVER_ERROR", "PARENT role is not configured in the system.", 500);
      }

      // Use the first student's branchId and organizationId
      const targetStudent = matchingStudents[0];
      const branch = await prisma.branch.findUnique({
        where: { id: targetStudent.branchId },
        select: { organizationId: true },
      });

      if (!branch) {
        return apiError("SERVER_ERROR", "Could not determine organization context from student branch.", 500);
      }

      const isFather = targetStudent.fatherEmail?.toLowerCase() === normEmail;
      const parentName = isFather
        ? targetStudent.fatherName || "Father"
        : targetStudent.motherName || "Mother";

      // 2. Create the User in database
      // Generate a mock firebaseUid since it is unique and required
      const dummyUid = `parent-mock-${crypto.randomUUID()}`;
      user = await prisma.user.create({
        data: {
          organizationId: branch.organizationId,
          branchId: targetStudent.branchId,
          firebaseUid: dummyUid,
          email: normEmail,
          name: parentName,
          roleId: parentRole.id,
          isActive: true,
        },
        include: {
          role: true,
          branch: true,
          parent: {
            include: {
              children: {
                include: {
                  student: {
                    include: {
                      enrollments: {
                        orderBy: { enrolledAt: "desc" },
                        take: 1,
                        include: {
                          section: {
                            include: {
                              class: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // 3. Create the Parent row linked to User
      const newParent = await prisma.parent.create({
        data: {
          userId: user.id,
          relationship: isFather ? "FATHER" : "MOTHER",
        },
      });

      // 4. Create StudentParent links
      for (const student of matchingStudents) {
        await prisma.studentParent.create({
          data: {
            studentId: student.id,
            parentId: newParent.id,
            relation: isFather ? "FATHER" : "MOTHER",
            isPrimary: true,
          },
        });
      }

      // Reload user with relationships loaded
      const reloadedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: true,
          branch: true,
          parent: {
            include: {
              children: {
                include: {
                  student: {
                    include: {
                      enrollments: {
                        orderBy: { enrolledAt: "desc" },
                        take: 1,
                        include: {
                          section: {
                            include: {
                              class: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (reloadedUser) {
        user = reloadedUser;
      }
    }

    if (!user || !user.parent) {
      return apiError("FORBIDDEN", "User exists but is not linked to a parent profile.", 403);
    }

    // Construct response children list
    const childrenList = user.parent.children.map((link) => {
      const student = link.student;
      const latestEnrollment = student.enrollments[0];
      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo || latestEnrollment?.rollNo || "N/A",
        class: latestEnrollment?.section?.class?.name || "N/A",
        section: latestEnrollment?.section?.name || "N/A",
        gender: student.gender,
        bloodGroup: student.bloodGroup || "N/A",
      };
    });

    const token = `parent-mock-token-${user.id}`;

    return apiSuccess({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "PARENT",
        branchId: user.branchId || "",
        branchName: user.branch?.name || "",
      },
      children: childrenList,
    });
  } catch (error: any) {
    console.error("Parent login error:", error);
    return apiError("SERVER_ERROR", "Internal server error: " + error.message, 500);
  }
}
