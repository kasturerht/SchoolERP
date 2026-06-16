/**
 * Utility functions for Indian Numbering System formatting (Lakhs, Crores, etc. grouped 3-2-2)
 */

/**
 * Formats a raw numeric string or number to Indian style.
 * E.g., 100000 -> 1,00,000
 * E.g., 1234567.89 -> 12,34,567.89
 */
export function formatIndianNumber(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  
  let str = val.toString().replace(/,/g, "").trim();
  if (str === "") return "";

  // Split integer and decimal parts
  const parts = str.split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1] !== undefined ? "." + parts[1] : "";
  
  // Check if negative
  const isNegative = integerPart.startsWith("-");
  integerPart = integerPart.replace(/[^\d]/g, "");
  
  if (integerPart === "") {
    return isNegative ? "-" : "";
  }
  
  // Format integer part using Indian grouping
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherBits = integerPart.substring(0, integerPart.length - 3);
  
  if (otherBits !== "") {
    lastThree = "," + lastThree;
  }
  
  const formattedOther = otherBits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  
  return (isNegative ? "-" : "") + formattedOther + lastThree + decimalPart;
}

/**
 * Strips formatting (commas) to get a clean numeric string.
 * E.g., "12,34,567.89" -> "1234567.89"
 */
export function parseFormattedNumber(val: string | undefined | null): string {
  if (val === undefined || val === null) return "";
  return val.toString().replace(/,/g, "").trim();
}

/**
 * Formats a number for static display with optional decimal digits and prepended ₹ symbol.
 * E.g., 250000 -> ₹2,50,000.00
 */
export function formatCurrency(
  val: string | number | undefined | null,
  showSymbol = true,
  decimals = 2
): string {
  if (val === undefined || val === null || val === "") return showSymbol ? "₹0" : "0";
  
  const num = parseFloat(parseFormattedNumber(val.toString()));
  if (isNaN(num)) return showSymbol ? "₹0" : "0";
  
  // Format with fixed decimals first, but if it ends in .00, we can drop decimals or keep it based on parameters
  const fixedStr = num.toFixed(decimals);
  // Remove trailing .00 if decimals is 2, or keep it depending on precision
  const cleanFixedStr = decimals === 2 ? fixedStr.replace(/\.00$/, "") : fixedStr;
  const formatted = formatIndianNumber(cleanFixedStr);
  
  return showSymbol ? `₹${formatted}` : formatted;
}
