
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");

const app = express();

app.disable("x-powered-by");

// ================================
// 1. Security
// ================================
app.use(helmet());

// ================================
// 2. CORS Configuration
// ================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.CLIENT_URL,
  process.env.PRODUCTION_CLIENT_URL,
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, ""));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin (e.g. Postman)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn("Blocked CORS origin:", origin);

    return callback(new Error("Not allowed by CORS"));
  },

  methods: ["GET", "POST", "PATCH", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// ================================
// 3. Body Parser
// ================================
app.use(express.json({ limit: "20kb" }));

// ================================
// 4. Health Check
// ================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EdTech CRM API is running",
  });
});

// ================================
// 5. Rate Limiters
// ================================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Try again later.",
  },
});

// ================================
// 6. API Routes
// ================================
app.use("/api/auth/login", loginLimiter);

app.use("/api/inquiries", (req, res, next) => {
  if (req.method === "POST") {
    return inquiryLimiter(req, res, next);
  }

  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/inquiries", inquiryRoutes);

// ================================
// 7. 404 Handler
// ================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================================
// 8. Error Handler
// ================================
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // CORS rejection
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body too large",
    });
  }

  console.error("Unhandled error:", err.message);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ================================
// 9. Start Server
// ================================
const startServer = async () => {
  try {
    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error("JWT_SECRET must be configured properly");
    }

    if (!process.env.CLIENT_URL) {
      throw new Error("CLIENT_URL is missing");
    }

    await connectDB();

    const port = process.env.PORT || 5000;

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
      console.log("Allowed CORS origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
};

startServer();
