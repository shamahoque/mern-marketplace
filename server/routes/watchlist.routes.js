import express from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist
} from "../controllers/watchlist.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:productId", protect, addToWatchlist);
router.delete("/:productId", protect, removeFromWatchlist);
router.get("/", protect, getWatchlist);

export default router;
