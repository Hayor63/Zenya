import { z } from "zod";

// Get wallet by ID
export const getWalletByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "WalletId is required"),
  }),
});

// Update wallet
export const updateWalletSchema = z.object({
  params: z.object({
    id: z.string().min(1, "WalletId is required"),
  }),
  body: z.object({
    metadata: z
      .record(z.string(), z.any()) // object with string keys and any values
      .refine((val) => Object.keys(val).length > 0, {
        message: "metadata is required",
      }),
  }),
});

// Freeze wallet
export const freezeWalletSchema = z.object({
  params: z.object({
    id: z.string().min(1, "WalletId is required"),
  }),
});

// Unfreeze wallet
export const unfreezeWalletSchema = z.object({
  params: z.object({
    id: z.string().min(1, "WalletId is required"),
  }),
});

// Delete wallet
export const deleteWalletSchema = z.object({
  params: z.object({
    id: z.string().min(1, "WalletId is required"),
  }),
});
