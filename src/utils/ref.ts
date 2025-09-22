import { randomBytes } from "crypto";

export function generateReference(type: "deposit" | "withdrawal" | "transfer"): string {
  const prefixes: Record<string, string> = {
    deposit: "DEP",
    withdrawal: "WDL",
    transfer: "TRF",
  };

  const prefix = prefixes[type] || "TRX";
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);

  return `${prefix}-${datePart}-${randomPart}`;
}
