
const express = require("express");
const router = express.Router();

const {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
} = require("../controllers/inquiryController");

const {
  authenticateAdmin,
} = require("../middleware/authMiddleware");

// Public route
router.post("/", createInquiry);

// Protected admin routes
router.get("/", authenticateAdmin, getAllInquiries);

router.patch(
  "/:id/status",
  authenticateAdmin,
  updateInquiryStatus
);

module.exports = router;
