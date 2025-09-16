import { Router } from "express"
import userRoutes from "./user"
import authRoutes from "./auth"
import walletRoutes from "./wallet"

const router = Router()
router.use("/users", userRoutes)
router.use("/auth", authRoutes)
router.use("/wallets", walletRoutes)


export default router