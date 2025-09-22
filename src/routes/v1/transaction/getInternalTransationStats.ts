import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import InternalTransactionModel from "../../../database/model/internalTransactionModel";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
  };
}

const getTransactionStatsHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const { fromDate, toDate } = req.query;

  try {
    // Validating date params if added
    if (fromDate && isNaN(Date.parse(fromDate as string))) {
      return APIResponse.error("Invalid fromDate format", 400).send(res);
    }

    if (toDate && isNaN(Date.parse(toDate as string))) {
      return APIResponse.error("Invalid toDate format", 400).send(res);
    }
    // Building base filter: admins see all, users see only theirs
    const filter: Record<string, any> = userRole === "admin" ? {} : { userId };
    
    //Adding date range filter if provided
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate as string);
      if (toDate) filter.createdAt.$lte = new Date(toDate as string);
    }

    // Aggregating statistics
    const stats = await InternalTransactionModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: "$transferAmount" },
          totalFees: { $sum: "$internalFees" },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          // Additional metrics
          averageAmount: { $avg: "$transferAmount" },
          todayCount: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    "$createdAt",
                    new Date(new Date().setHours(0, 0, 0, 0)),
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalTransactions: 0,
      totalAmount: 0,
      totalFees: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      averageAmount: 0,
      todayCount: 0,
    };

    return APIResponse.success(
      {
        message:
          userRole === "admin"
            ? "Platform-wide transaction stats"
            : "User transaction stats",
        data: result,
      },
      200
    ).send(res);
  } catch (error: any) {
    return APIResponse.error(
      error.message || "Failed to fetch transaction stats",
      500
    ).send(res);
  }
};

export default getTransactionStatsHandler;
