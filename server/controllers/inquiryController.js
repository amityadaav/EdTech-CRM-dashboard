
const mongoose = require("mongoose");
const Inquiry = require("../models/Inquiry");

const CATEGORIES = [
  "Scholarship",
  "Concert",
  "Admission",
  "General Query",
];

const USER_TYPES = ["Parent", "Student", "School"];

const STATUSES = ["New", "In Progress", "Resolved"];

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/inquiries
const createInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      userType,
      category,
      message,
    } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof userType !== "string" ||
      typeof category !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanMessage = message.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;

    if (
      !cleanName ||
      cleanName.length > 100 ||
      !emailRegex.test(cleanEmail) ||
      cleanEmail.length > 254 ||
      !phoneRegex.test(cleanPhone) ||
      !cleanMessage ||
      cleanMessage.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid inquiry details",
      });
    }

    if (!USER_TYPES.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const inquiry = await Inquiry.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      userType,
      category,
      message: cleanMessage,
      // Status is assigned by the schema default.
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      inquiry: {
        id: inquiry._id,
        name: inquiry.name,
        category: inquiry.category,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    console.error("Create inquiry error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to submit inquiry",
    });
  }
};

// GET /api/inquiries
const getAllInquiries = async (req, res) => {
  try {
    const {
      category,
      userType,
      search,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isSafeInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isSafeInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const filter = {};

    if (category) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category filter",
        });
      }

      filter.category = category;
    }

    if (userType) {
      if (!USER_TYPES.includes(userType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user type filter",
        });
      }

      filter.userType = userType;
    }

    if (search !== undefined) {
      if (
        typeof search !== "string" ||
        search.length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid search query",
        });
      }

      const term = search.trim();

      if (term) {
        const safeTerm = escapeRegex(term);

        filter.$or = [
          { name: { $regex: safeTerm, $options: "i" } },
          { phone: { $regex: safeTerm, $options: "i" } },
        ];
      }
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .select(
          "name phone email userType category status createdAt"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Inquiry.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      inquiries,
    });
  } catch (error) {
    console.error("Get inquiries error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries",
    });
  }
};

// PATCH /api/inquiries/:id/status
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID",
      });
    }

    if (
      typeof status !== "string" ||
      !STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status",
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    ).select(
      "name email phone userType category status createdAt"
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry status updated",
      inquiry,
    });
  } catch (error) {
    console.error("Update status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update inquiry status",
    });
  }
};

module.exports = {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
};
