export interface AttendanceLog {
  date: string; // YYYY-MM-DD
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
}

export interface SubjectMark {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
}

export interface ExamRecord {
  id: string;
  name: string; // Term 1, Unit Test 1, etc.
  date: string;
  percentage: number;
  grade: string;
  result: "PASS" | "FAIL";
  subjects: SubjectMark[];
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  title: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: "PAID" | "PARTIALLY_PAID" | "UNPAID" | "OVERDUE";
}

export interface SchoolNotice {
  id: string;
  title: string;
  description: string;
  date: string;
  category: "ACADEMIC" | "FEES" | "EVENT" | "HOLIDAY" | "URGENT";
  author: string;
}

export interface StudentProfile {
  id: string;
  admissionNo: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  gender: "MALE" | "FEMALE";
  photo: string | null;
  bloodGroup: string;
  attendance: {
    percentage: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    logs: AttendanceLog[];
  };
  exams: ExamRecord[];
  invoices: Invoice[];
}

export interface ParentDashboardData {
  parentName: string;
  children: StudentProfile[];
  notices: SchoolNotice[];
}

// Generate realistic daily attendance logs for June 2026
const generateAttendanceLogs = (presentRate: number): AttendanceLog[] => {
  const logs: AttendanceLog[] = [];
  // For June 1 to June 20, 2026 (excluding weekends)
  for (let day = 1; day <= 20; day++) {
    const dateStr = `2026-06-${day.toString().padStart(2, "0")}`;
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip Sat & Sun

    const rand = Math.random();
    if (rand < presentRate) {
      logs.push({ date: dateStr, status: rand < 0.08 ? "LATE" : "PRESENT" });
    } else {
      logs.push({ date: dateStr, status: rand < 0.95 ? "ABSENT" : "LEAVE" });
    }
  }
  return logs;
};

export const mockParentData: ParentDashboardData = {
  parentName: "Suresh Kumar",
  children: [
    {
      id: "std-rahul-10a",
      admissionNo: "ADM-2024-0089",
      rollNo: "24",
      firstName: "Rahul",
      lastName: "Kumar",
      class: "Class 10",
      section: "A",
      gender: "MALE",
      photo: null,
      bloodGroup: "O+",
      attendance: {
        percentage: 89.2,
        presentDays: 13,
        absentDays: 1,
        lateDays: 1,
        leaveDays: 0,
        logs: [
          { date: "2026-06-01", status: "PRESENT" },
          { date: "2026-06-02", status: "PRESENT" },
          { date: "2026-06-03", status: "PRESENT" },
          { date: "2026-06-04", status: "ABSENT" },
          { date: "2026-06-05", status: "PRESENT" },
          { date: "2026-06-08", status: "PRESENT" },
          { date: "2026-06-09", status: "LATE" },
          { date: "2026-06-10", status: "PRESENT" },
          { date: "2026-06-11", status: "PRESENT" },
          { date: "2026-06-12", status: "PRESENT" },
          { date: "2026-06-15", status: "PRESENT" },
          { date: "2026-06-16", status: "PRESENT" },
          { date: "2026-06-17", status: "PRESENT" },
          { date: "2026-06-18", status: "PRESENT" },
          { date: "2026-06-19", status: "PRESENT" },
        ],
      },
      exams: [
        {
          id: "ex-rahul-term1",
          name: "First Term Examination",
          date: "2026-04-12",
          percentage: 84.6,
          grade: "A",
          result: "PASS",
          subjects: [
            { subject: "English", marksObtained: 85, maxMarks: 100, grade: "A" },
            { subject: "Mathematics", marksObtained: 92, maxMarks: 100, grade: "A+" },
            { subject: "Science & Tech", marksObtained: 88, maxMarks: 100, grade: "A" },
            { subject: "Social Science", marksObtained: 79, maxMarks: 100, grade: "B" },
            { subject: "Marathi Language", marksObtained: 82, maxMarks: 100, grade: "A" },
            { subject: "Hindi Language", marksObtained: 81, maxMarks: 100, grade: "A" },
          ],
        },
        {
          id: "ex-rahul-unit1",
          name: "Unit Test 1",
          date: "2026-05-18",
          percentage: 88.0,
          grade: "A",
          result: "PASS",
          subjects: [
            { subject: "English", marksObtained: 22, maxMarks: 25, grade: "A" },
            { subject: "Mathematics", marksObtained: 24, maxMarks: 25, grade: "A+" },
            { subject: "Science & Tech", marksObtained: 21, maxMarks: 25, grade: "A" },
            { subject: "Social Science", marksObtained: 20, maxMarks: 25, grade: "B" },
            { subject: "Marathi Language", marksObtained: 23, maxMarks: 25, grade: "A+" },
          ],
        },
      ],
      invoices: [
        {
          id: "inv-rahul-1",
          invoiceNo: "INV-2026-00431",
          title: "First Term Tuition Fee",
          dueDate: "2026-06-15",
          amount: 18500,
          paidAmount: 18500,
          status: "PAID",
        },
        {
          id: "inv-rahul-2",
          invoiceNo: "INV-2026-00812",
          title: "Second Term Tuition Fee",
          dueDate: "2026-09-15",
          amount: 18500,
          paidAmount: 0,
          status: "UNPAID",
        },
        {
          id: "inv-rahul-3",
          invoiceNo: "INV-2026-01254",
          title: "Computer Lab & Sports Fee",
          dueDate: "2026-05-30",
          amount: 6000,
          paidAmount: 2000,
          status: "PARTIALLY_PAID",
        },
        {
          id: "inv-rahul-4",
          invoiceNo: "INV-2026-00212",
          title: "Library Deposit (Annual)",
          dueDate: "2026-04-15",
          amount: 2500,
          paidAmount: 2500,
          status: "PAID",
        },
      ],
    },
    {
      id: "std-riya-7b",
      admissionNo: "ADM-2026-0004",
      rollNo: "12",
      firstName: "Riya",
      lastName: "Kumar",
      class: "Class 7",
      section: "B",
      gender: "FEMALE",
      photo: null,
      bloodGroup: "O+",
      attendance: {
        percentage: 95.8,
        presentDays: 14,
        absentDays: 0,
        lateDays: 0,
        leaveDays: 1,
        logs: [
          { date: "2026-06-01", status: "PRESENT" },
          { date: "2026-06-02", status: "PRESENT" },
          { date: "2026-06-03", status: "PRESENT" },
          { date: "2026-06-04", status: "PRESENT" },
          { date: "2026-06-05", status: "PRESENT" },
          { date: "2026-06-08", status: "PRESENT" },
          { date: "2026-06-09", status: "PRESENT" },
          { date: "2026-06-10", status: "PRESENT" },
          { date: "2026-06-11", status: "LEAVE" },
          { date: "2026-06-12", status: "PRESENT" },
          { date: "2026-06-15", status: "PRESENT" },
          { date: "2026-06-16", status: "PRESENT" },
          { date: "2026-06-17", status: "PRESENT" },
          { date: "2026-06-18", status: "PRESENT" },
          { date: "2026-06-19", status: "PRESENT" },
        ],
      },
      exams: [
        {
          id: "ex-riya-term1",
          name: "First Term Examination",
          date: "2026-04-12",
          percentage: 91.2,
          grade: "A+",
          result: "PASS",
          subjects: [
            { subject: "English", marksObtained: 92, maxMarks: 100, grade: "A+" },
            { subject: "Mathematics", marksObtained: 95, maxMarks: 100, grade: "A+" },
            { subject: "Science", marksObtained: 89, maxMarks: 100, grade: "A" },
            { subject: "Social Science", marksObtained: 87, maxMarks: 100, grade: "A" },
            { subject: "Marathi Language", marksObtained: 94, maxMarks: 100, grade: "A+" },
            { subject: "Hindi Language", marksObtained: 90, maxMarks: 100, grade: "A+" },
          ],
        },
      ],
      invoices: [
        {
          id: "inv-riya-1",
          invoiceNo: "INV-2026-00432",
          title: "First Term Tuition Fee",
          dueDate: "2026-06-15",
          amount: 15500,
          paidAmount: 15500,
          status: "PAID",
        },
        {
          id: "inv-riya-2",
          invoiceNo: "INV-2026-00813",
          title: "Second Term Tuition Fee",
          dueDate: "2026-09-15",
          amount: 15500,
          paidAmount: 0,
          status: "UNPAID",
        },
        {
          id: "inv-riya-3",
          invoiceNo: "INV-2026-00213",
          title: "Library Deposit (Annual)",
          dueDate: "2026-04-15",
          amount: 2500,
          paidAmount: 2500,
          status: "PAID",
        },
      ],
    },
  ],
  notices: [
    {
      id: "nt-1",
      title: "First Term Final Exam Timetable Released",
      description: "Dear Parents, the exam timetable for the upcoming First Term Exams starting June 28th has been published. Please ensure students prepare accordingly. Detailed syllabus has been handed over to students.",
      date: "2026-06-05",
      category: "ACADEMIC",
      author: "Principal Desk",
    },
    {
      id: "nt-2",
      title: "School Fees Clearance Reminder",
      description: "This is a kind reminder to clear any outstanding academic fees for Term 1. The due date was June 15th, 2026. Ignore if already paid.",
      date: "2026-06-04",
      category: "FEES",
      author: "Accounts Branch",
    },
    {
      id: "nt-3",
      title: "Annual Sports Meet 2026 Registrations",
      description: "Registration for the Annual Sports Meet is now open. Students can select up to 3 track or field events. Kindly encourage your children to participate actively.",
      date: "2026-06-02",
      category: "EVENT",
      author: "Physical Education Dept",
    },
    {
      id: "nt-4",
      title: "Holiday Announcement - Shivaji Maharaj Coronation Day",
      description: "School will remain closed on Saturday, June 6th, 2026, on the occasion of Chhatrapati Shivaji Maharaj Coronation Day.",
      date: "2026-06-01",
      category: "HOLIDAY",
      author: "Administration",
    },
  ],
};
