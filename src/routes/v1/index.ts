import { Router } from "express"
import userRoutes from "./user"
import authRoutes from "./auth"
import walletRoutes from "./wallet"
import internaltransactionRoutes from "./transaction"
import transactionRoutes from "./transaction"

const router = Router()
router.use("/users", userRoutes)
router.use("/auth", authRoutes)
router.use("/wallets", walletRoutes)
router.use("/internalTransactions",transactionRoutes)


export default router