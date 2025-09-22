import { Request, Response } from "express";
import internalTransactionRepo from "../../../database/repository/internalTransationRepo";
import APIResponse from "../../../utils/api";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
  };
}

const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "amount",
  "status",
  "type",
  "reference",
];
const ALLOWED_SORT_TYPES = ["asc", "desc", 1, -1];
const MAX_SEARCH_LENGTH = 100;

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? date : null;
};

const validateSearchString = (search: string): boolean => {
  if (!search) return true;
  return search.length <= MAX_SEARCH_LENGTH && !/[<>{}]/.test(search);
};

const getTransactionHistoryHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;
 
  const {
    pageNumber = "1",
    pageSize = "10",
    sortField,
    sortType,
    search,
    fromDate,
    toDate,
  } = req.query;

  try {
    const page = Math.max(1, Number(pageNumber));
    const size = Math.max(1, Math.min(100, Number(pageSize)));

    // Validating search string
    if (search && !validateSearchString(search as string)) {
      return APIResponse.error(
        "Invalid search parameter: too long or contains forbidden characters",
        400
      ).send(res);
    }

    // Validating sort parameters
    if (sortField && !ALLOWED_SORT_FIELDS.includes(sortField as string)) {
      return APIResponse.error(
        `Invalid sort field. Allowed fields: ${ALLOWED_SORT_FIELDS.join(", ")}`,
        400
      ).send(res);
    }

    if (sortType && !ALLOWED_SORT_TYPES.includes(sortType as any)) {
      return APIResponse.error(
        `Invalid sort type. Allowed types: ${ALLOWED_SORT_TYPES.join(", ")}`,
        400
      ).send(res);
    }

    const sortLogic =
      sortField && sortType
        ? { [sortField as string]: sortType as string | number }
        : undefined;

    // Parse date range
    // const from = fromDate as string | undefined;
    // const to = toDate as string | undefined;

    const from = parseDate(fromDate as string);
    const to = parseDate(toDate as string);

    // const fromDateParsed = fromDate
    //   ? validateDateString(fromDate as string)
    //   : null;
    // const toDateParsed = toDate ? validateDateString(toDate as string) : null;

    if (fromDate && !from) {
      return APIResponse.error(
        "Invalid fromDate format. Use ISO date string.",
        400
      ).send(res);
    }

    if (toDate && !to) {
      return APIResponse.error(
        "Invalid toDate format. Use ISO date string.",
        400
      ).send(res);
    }

    // Validating date range logic
    if (from && to && from > to) {
      return APIResponse.error(
        "fromDate cannot be greater than toDate",
        400
      ).send(res);
    }

    // Checking if date range is too wide to prevent abuse
    if (from && to) {
      const daysDifference =
        (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDifference > 365) {
        return APIResponse.error("Date range cannot exceed 365 days", 400).send(
          res
        );
      }
    }

    // Validating pagination bounds
    if (page > 1000) {
      return APIResponse.error(
        "Page number too high. Maximum allowed: 1000",
        400
      ).send(res);
    }

    // Including userId filter if not admin
    const filter = userId && req.user?.role !== "admin" ? { userId } : {};

    // Setting cache headers for appropriate responses
    if (!search && !fromDate && !toDate) {
      res.set("Cache-Control", "public, max-age=60"); 
    } else {
      res.set("Cache-Control", "no-cache");
    }

    const { data, totalItems, totalPages } =
      await internalTransactionRepo.getTransactionHistory({
        pageNumber: page,
        pageSize: size,
        filter,
        search: search as string,
        sortLogic,
        fromDate: from?.toISOString(),
        toDate: to?.toISOString(),
      });

    return APIResponse.success(
      {
        message: "Transaction history retrieved successfully",
        data,
        meta: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize: size,
        },
      },
      200
    ).send(res);
  } catch (error: any) {
    return APIResponse.error(
      error?.message || "Failed to fetch transaction history",
      500
    ).send(res);
  }
};

export default getTransactionHistoryHandler;
