import { Router } from "express";
import authenticateUser from "../../../middleware/authenticateUser";
import validate from "../../../middleware/validate";
import {
  createTransactionSchema,
  getInternalTransactionStatsSchema,
  getSingleTransactionSchema,
  getTransactionHistorySchema,
  updateTransactionStatusSchema,
} from "../../../validationSchema/internalTransaction";
import createInternalTransactionHandler from "./create";
import getSingleTransactionHandler from "./getSingleTransaction";
import getTransactionHistoryHandler from "./transactionHistory";
import authorizedRoles from "../../../middleware/role";
import genLimiter from "../../../middleware/rateLimit";
import getTransactionStatsHandler from "./getInternalTransationStats";
import updateTransactionHandler from "./updateTransactionStatus";

const transactionRoutes = Router();

transactionRoutes.post(
  "/",
  authenticateUser,
  validate(createTransactionSchema),
  createInternalTransactionHandler
);

transactionRoutes.get(
  "/:id",
  authenticateUser,
  authorizedRoles("admin", "user"),
  validate(getSingleTransactionSchema),
  getSingleTransactionHandler
);

transactionRoutes.get(
  "/",
  authenticateUser,
  authorizedRoles("admin", "user"),
  genLimiter,
  validate(getTransactionHistorySchema),
  getTransactionHistoryHandler
);


//Get transaction statistics for dashboard
transactionRoutes.get(
  "/stats",
  authenticateUser,
  authorizedRoles("admin", "user"),
  genLimiter,
  validate(getInternalTransactionStatsSchema),
  getTransactionStatsHandler
)

//update transaction status
transactionRoutes.patch(
  "/:id/status",
  authenticateUser,
  authorizedRoles("admin"),
  genLimiter,
  validate(updateTransactionStatusSchema),
  updateTransactionHandler
)

export default transactionRoutes;
