import { Router } from "express";
import authenticateUser from "../../../middleware/authenticateUser";
import getUserWallet from "./getUserWallet";
import authorizedRoles from "../../../middleware/role";
import getAllWalletHandler from "./getAllWallet";
import getWalletByIdHandler from "./getWalletById";
import { deleteWalletSchema, freezeWalletSchema, getWalletByIdSchema, updateWalletSchema } from "../../../validationSchema/wallet";
import validate from "../../../middleware/validate";
import updateWalletHandler from "./updateWallet";
import freezeWalletHandler from "./freezeWallet";
import deleteWalletHandler from "./delete";
import unfreezeWalletHandler from "./unFreezeWallet";
import getWalletBalanceHandler from "./getWalletBalance";

const walletRoutes = Router();

//get current user's wallet
walletRoutes.get("/user/wallet", authenticateUser, getUserWallet);

//get wallet balance
walletRoutes.get("/balance", authenticateUser, getWalletBalanceHandler);

//get all wallets(admin)
walletRoutes.get(
  "/",
  authenticateUser,
//   authorizedRoles("admin"),
  getAllWalletHandler
);

//get wallets by Id
walletRoutes.get(
  "/:id",
  authenticateUser,
  validate(getWalletByIdSchema),
//   authorizedRoles("admin"),
  getWalletByIdHandler
);

//update wallet
walletRoutes.patch(
  "/:id",
  authenticateUser,
  validate(updateWalletSchema),
//   authorizedRoles("admin"),
  updateWalletHandler
);

//freeze wallet
walletRoutes.patch(
  "/:id/freeze",
  authenticateUser,
  validate(freezeWalletSchema),
  authorizedRoles("admin"),
  freezeWalletHandler
);

//unfreeze wallet
walletRoutes.patch(
  "/:id/unfreeze",
  authenticateUser,
  validate(freezeWalletSchema),
  authorizedRoles("admin"),
  unfreezeWalletHandler
);

//delete wallet
walletRoutes.delete(
  "/:id",
  authenticateUser,
  validate(deleteWalletSchema),
  authorizedRoles("admin"),
  deleteWalletHandler
);



export default walletRoutes;
