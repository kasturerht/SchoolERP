import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
} from "@/lib/api-helpers";
import { checkApiPermission, getTenantContext } from "@/lib/rbac";
import { expressAdmitSchema } from "@/lib/validations/express-admission";
import {
  generateUniqueAdmissionNo,
  generateUniqueInvoiceNo,
  generateUniqueReceiptNo,
  generateUniqueApplicationNo,
} from "@/lib/unique-id";
import { logAction } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

function splitFullName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Student" };
  }
  const lastName = parts.pop() || "";
  const firstName = parts.join(" ");
  return { firstName, lastName };
}

/**
 * POST /api/v1/admissions/inquiries/[id]/express-admit
 * Express promote an inquiry directly to student, bypassing manual application and verification stages.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const denied = await checkApiPermission(req, "admissions", "registrar_desk");
  if (denied) return denied;

  const ctx = getTenantContext(req);
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const parsed = expressAdmitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("BAD_REQUEST", "Validation failed", 400);
  }

  const {
    sectionId,
    rollNo,
    admissionDate,
    discountPercent,
    amountPaid,
    paymentMethod,
    transactionId,
    termType,
    installments,
  } = parsed.data;

  const { bypassAgeLimit } = body as { bypassAgeLimit?: boolean };

  try {
    const branchScope = ctx.roleName !== "SUPER_ADMIN" && ctx.roleName !== "SCHOOL_ADMIN" && ctx.branchId
      ? { branchId: ctx.branchId }
      : {};

    // 1. Fetch Inquiry
    const inquiry = await prisma.admissionInquiry.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        ...branchScope,
      },
    });

    if (!inquiry) {
      return apiError("NOT_FOUND", "Inquiry not found in current scope", 404);
    }

    if (inquiry.status === "APPLIED") {
      // Check if already has application
      const existingApp = await prisma.admissionApplication.findFirst({
        where: { inquiryId: id },
      });
      if (existingApp && existingApp.status === "ADMITTED") {
        return apiError("CONFLICT", "Candidate from this inquiry has already been admitted", 409);
      }
    }

    // Age validation (bypassable with flag)
    const dob = new Date(inquiry.dateOfBirth);
    const admDate = admissionDate ? new Date(admissionDate) : new Date();
    const ageAtAdmission = (admDate.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageAtAdmission < 3.0 && !bypassAgeLimit) {
      return apiError("BAD_REQUEST", "Student must be at least 3 years old on the admission date", 400);
    }

    // 2. Verify Section
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        class: {
          id: inquiry.classAppliedId,
          branchId: inquiry.branchId,
        },
      },
      include: {
        class: true,
      },
    });

    if (!section) {
      return apiError("NOT_FOUND", "Selected class section not found", 404);
    }

    const { firstName, lastName } = splitFullName(inquiry.studentName);

    // 3. Database Transaction
    const student = await prisma.$transaction(async (tx) => {
      // a. Create AdmissionApplication programmatically
      const applicationNo = await generateUniqueApplicationNo(tx);
      const application = await tx.admissionApplication.create({
        data: {
          inquiryId: id,
          organizationId: ctx.organizationId,
          branchId: inquiry.branchId,
          academicYearId: inquiry.academicYearId,
          classId: inquiry.classAppliedId,
          applicationNo,
          firstName,
          lastName,
          dateOfBirth: inquiry.dateOfBirth,
          gender: inquiry.gender,
          address: "N/A",
          pincode: "000000",
          emergencyContact: inquiry.parentPhone,
          fatherName: inquiry.parentName,
          fatherPhone: inquiry.parentPhone,
          fatherEmail: inquiry.parentEmail,
          status: "ADMITTED",
          applicationFeePaid: true,
        },
      });

      // b. Create Student profile
      const admissionNo = await generateUniqueAdmissionNo(tx);
      const studentRecord = await tx.student.create({
        data: {
          branchId: inquiry.branchId,
          admissionNo,
          rollNo: rollNo || null,
          firstName,
          lastName,
          dateOfBirth: inquiry.dateOfBirth,
          gender: inquiry.gender,
          address: "N/A",
          pincode: "000000",
          emergencyContact1: inquiry.parentPhone,
          fatherName: inquiry.parentName,
          fatherPhone: inquiry.parentPhone,
          fatherEmail: inquiry.parentEmail,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          status: "ACTIVE",
        },
      });

      // c. Create StudentEnrollment
      await tx.studentEnrollment.create({
        data: {
          studentId: studentRecord.id,
          academicYearId: inquiry.academicYearId,
          sectionId,
          rollNo: rollNo || null,
          termType: termType || "FULL_TERM",
        },
      });

      // d. Billing generation (copied from promote endpoint)
      const feeStructures = await tx.feeStructure.findMany({
        where: { classId: inquiry.classAppliedId, termType: termType || "FULL_TERM" },
        include: { feeCategory: { select: { name: true } } },
      });

      if (feeStructures.length > 0) {
        const feeCategoriesAnnual = feeStructures.map((fs) => {
          const base = Number(fs.amount);
          let annual = base;
          switch (fs.frequency) {
            case "MONTHLY": annual = base * 12; break;
            case "QUARTERLY": annual = base * 4; break;
            case "SEMI_ANNUAL": annual = base * 2; break;
            default: annual = base;
          }
          return { feeStructureId: fs.id, name: fs.feeCategory.name, annual };
        });

        const annualTotal = feeCategoriesAnnual.reduce((s, f) => s + f.annual, 0);
        const discountPct = discountPercent ?? 0;
        const discountMultiplier = 1 - discountPct / 100;

        let targetInstallments: { name: string; amount: number; dueDate: Date; lateFeeActive: boolean; lateFeeType: string; lateFeeValue: number; lateFeePerDay: number; lateFeeGrace: number }[] = [];
        
        if (installments && installments.length > 0) {
          const templateIds = installments.map(i => i.templateId);
          const matchedTemplates = await tx.feeInstallmentTemplate.findMany({
            where: { id: { in: templateIds } },
          });

          targetInstallments = installments.map(inst => {
            const temp = matchedTemplates.find(t => t.id === inst.templateId);
            return {
              name: temp?.name || "Installment",
              amount: inst.amount,
              dueDate: temp?.dueDate || new Date(),
              lateFeeActive: temp?.lateFeeActive || false,
              lateFeeType: temp?.lateFeeType || "DAILY",
              lateFeeValue: temp ? Number(temp.lateFeeValue) : 0,
              lateFeePerDay: temp ? Number(temp.lateFeePerDay) : 0,
              lateFeeGrace: temp?.lateFeeGrace || 0,
            };
          });
        } else {
          const classTemplates = await tx.feeInstallmentTemplate.findMany({
            where: {
              classId: inquiry.classAppliedId,
              academicYearId: inquiry.academicYearId,
              termType: termType || "FULL_TERM",
            },
            orderBy: { dueDate: "asc" },
          });

          if (classTemplates.length > 0) {
            targetInstallments = classTemplates.map(t => ({
              name: t.name,
              amount: Number(t.amount),
              dueDate: t.dueDate,
              lateFeeActive: t.lateFeeActive,
              lateFeeType: t.lateFeeType,
              lateFeeValue: Number(t.lateFeeValue),
              lateFeePerDay: Number(t.lateFeePerDay),
              lateFeeGrace: t.lateFeeGrace,
            }));
          }
        }

        const createdInvoices = [];

        if (targetInstallments.length > 0) {
          const totalTemplateAmount = targetInstallments.reduce((sum, inst) => sum + inst.amount, 0);

          for (const inst of targetInstallments) {
            const invoiceNo = await generateUniqueInvoiceNo(tx);
            const installmentDiscountedTotal = inst.amount * discountMultiplier;

            let finalDueDate = new Date(inst.dueDate);
            const today = new Date();
            if (finalDueDate < today) {
              finalDueDate = today;
            }

            const invoice = await tx.invoice.create({
              data: {
                studentId: studentRecord.id,
                number: invoiceNo,
                year: new Date().getFullYear(),
                totalAmount: installmentDiscountedTotal,
                paidAmount: 0,
                status: "PENDING",
                dueDate: finalDueDate,
                lateFeeActive: inst.lateFeeActive,
                lateFeeType: (inst.lateFeeType || "DAILY") as any,
                lateFeeValue: inst.lateFeeValue,
                lateFeePerDay: inst.lateFeePerDay,
                lateFeeGrace: inst.lateFeeGrace,
                items: {
                  create: feeCategoriesAnnual.map((fi) => {
                    const proportionalAmount = totalTemplateAmount > 0 
                      ? fi.annual * (inst.amount / totalTemplateAmount) * discountMultiplier 
                      : 0;
                    return {
                      feeStructureId: fi.feeStructureId,
                      amount: proportionalAmount,
                      description: `${fi.name} - ${inst.name}`,
                    };
                  }),
                },
              },
            });

            createdInvoices.push(invoice);
          }
        } else {
          const invoiceNo = await generateUniqueInvoiceNo(tx);
          const discountedTotal = annualTotal * discountMultiplier;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);

          const invoice = await tx.invoice.create({
            data: {
              studentId: studentRecord.id,
              number: invoiceNo,
              year: new Date().getFullYear(),
              totalAmount: discountedTotal,
              paidAmount: 0,
              status: "PENDING",
              dueDate,
              items: {
                create: feeCategoriesAnnual.map((fi) => ({
                  feeStructureId: fi.feeStructureId,
                  amount: fi.annual * discountMultiplier,
                  description: fi.name,
                })),
              },
            },
          });

          createdInvoices.push(invoice);
        }

        // Apply payment rollover
        let remainingPayment = amountPaid ?? 0;
        
        if (remainingPayment > 0 && paymentMethod) {
          createdInvoices.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

          for (const inv of createdInvoices) {
            if (remainingPayment <= 0) break;

            const invTotal = Number(inv.totalAmount);
            const paymentToApply = Math.min(remainingPayment, invTotal);
            const newPaidAmount = paymentToApply;
            const newStatus = newPaidAmount >= invTotal ? "PAID" : "PARTIAL";

            const receiptNo = await generateUniqueReceiptNo(tx);

            await tx.feePayment.create({
              data: {
                invoiceId: inv.id,
                studentId: studentRecord.id,
                amount: paymentToApply,
                method: paymentMethod,
                transactionId: transactionId || null,
                receiptNo,
                paidAt: new Date(),
              },
            });

            await tx.invoice.update({
              where: { id: inv.id },
              data: {
                paidAmount: newPaidAmount,
                status: newStatus,
              },
            });

            remainingPayment -= paymentToApply;
          }
        }
      }

      // e. Update Inquiry status to APPLIED
      await tx.admissionInquiry.update({
        where: { id },
        data: { status: "APPLIED" },
      });

      return studentRecord;
    }, { timeout: 30000 });

    await logAction({
      organizationId: ctx.organizationId,
      branchId: student.branchId,
      userId: ctx.userId,
      action: "CREATE",
      module: "STUDENTS",
      entityId: student.id,
      details: { admissionNo: student.admissionNo, name: `${student.firstName} ${student.lastName}`, expressPromotedFrom: id }
    });

    return apiSuccess(student, undefined, 201);
  } catch (error) {
    console.error("Express admit candidate error:", error);
    return apiError("INTERNAL_ERROR", "Failed to express admit candidate", 500);
  }
}
