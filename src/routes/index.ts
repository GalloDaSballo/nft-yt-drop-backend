import express from "express";
import dropsRoutes from "./drops";
import claimRoutes from "./claim";

const router = express.Router();

router.use("/drops", dropsRoutes);
router.use("/claim", claimRoutes);

export default router;
