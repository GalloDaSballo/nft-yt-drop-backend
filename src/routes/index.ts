import express from "express";
import basicRoutes from "./basic";
import productsRoutes from "./products";
import authRoutes from "./auth";

const router = express.Router();

router.use("/basic", basicRoutes);
router.use("/products", productsRoutes);
router.use("/auth", authRoutes);

export default router;
