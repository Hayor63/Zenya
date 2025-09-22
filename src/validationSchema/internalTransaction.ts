import { string, TypeOf, z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    toWalletId: z.string().min(1, "to wallet id is required"),
    description: z.string().min(1, "description is required"),
    transferAmount: z.number().positive("amount must be greater than 0"),
    type: z.enum(["transfer"]),
  }),
});

export const getSingleTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "wallet Id is required"),
  }),
});

// get transaction history
export const getTransactionHistorySchema = z.object({
  query: z.object({
    pageNumber: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
        message: "pageNumber must be a positive number",
      }),
    pageSize: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          (!isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100),
        {
          message: "pageSize must be a positive number and ≤ 100",
        }
      ),
    sortField: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          ["createdAt", "amount", "status", "type", "reference"].includes(val),
        {
          message: "Invalid sortField",
        }
      ),
    sortType: z
      .string()
      .optional()
      .refine((val) => !val || ["asc", "desc", "1", "-1"].includes(val), {
        message: "Invalid sortType",
      }),
    search: z
      .string()
      .max(100, { message: "Search string too long" })
      .regex(/^[^<>{}]*$/, { message: "Search contains forbidden characters" })
      .optional(),

    fromDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid fromDate format",
      }),
    toDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid toDate format",
      }),
  }),
});

//Get transaction statistics for dashboard
export const getInternalTransactionStatsSchema = z.object({
  fromDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid fromDate format",
    }),
  toDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid toDate format",
    }),
});

// Allowed statuses
export const updateTransactionStatusSchema = z.object({
  params: z.object({
    id: string().min(1, "WalletId is required"),
  }),
  body: z.object({
    status: z
      .string()
      .min(1, "Status must not be empty")
      .refine(
        (val) => ["pending", "completed", "failed", "cancelled"].includes(val),
        {
          message: "Invalid status value",
        }
      ),
    reason: z
      .string()
      .min(3, "Reason must be at least 3 characters")
      .optional(),
  }),
});

export type createTransactionInput = z.infer<
  typeof createTransactionSchema
>["body"];
