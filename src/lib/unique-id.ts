import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Accept both raw prisma client and transaction client (tx)
type PrismaTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Generates a collision-resistant unique student admission number inside a transaction or client.
 */
export async function generateUniqueAdmissionNo(prisma: PrismaTx): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  for (let i = 0; i < 5; i++) {
    const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase(); // 4 chars
    const admissionNo = `ADM-${dateStr}-${randomSuffix}`;
    const exists = await prisma.student.findFirst({
      where: { admissionNo },
      select: { id: true },
    });
    if (!exists) return admissionNo;
  }
  // Fallback to random UUID if 5 retries fail
  return `ADM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

/**
 * Generates a collision-resistant unique invoice number inside a transaction or client.
 */
export async function generateUniqueInvoiceNo(prisma: PrismaTx): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  for (let i = 0; i < 5; i++) {
    const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase(); // 4 chars
    const invoiceNo = `INV-${dateStr}-${randomSuffix}`;
    const exists = await prisma.invoice.findUnique({
      where: { number: invoiceNo },
      select: { id: true },
    });
    if (!exists) return invoiceNo;
  }
  // Fallback
  return `INV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

/**
 * Generates a collision-resistant unique payment receipt number inside a transaction or client.
 */
export async function generateUniqueReceiptNo(prisma: PrismaTx): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  for (let i = 0; i < 5; i++) {
    const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase(); // 4 chars
    const receiptNo = `RCP-${dateStr}-${randomSuffix}`;
    const exists = await prisma.feePayment.findUnique({
      where: { receiptNo },
      select: { id: true },
    });
    if (!exists) return receiptNo;
  }
  // Fallback
  return `RCP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

/**
 * Generates a collision-resistant unique admission application number inside a transaction or client.
 */
export async function generateUniqueApplicationNo(prisma: PrismaTx): Promise<string> {
  const year = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
    const applicationNo = `APP-${year}-${randomSuffix}`;
    const exists = await prisma.admissionApplication.findUnique({
      where: { applicationNo },
      select: { id: true },
    });
    if (!exists) return applicationNo;
  }
  // Fallback
  return `APP-${year}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
