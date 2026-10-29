
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    if (
      !ADMIN_NAME?.trim() ||
      !ADMIN_EMAIL?.trim() ||
      !ADMIN_PASSWORD
    ) {
      throw new Error(
        "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD"
      );
    }

    if (
      ADMIN_NAME.trim().length > 100 ||
      ADMIN_EMAIL.trim().length > 254 ||
      ADMIN_PASSWORD.length < 12 ||
      ADMIN_PASSWORD.length > 72
    ) {
      throw new Error(
        "Name/email too long or password must be 12-72 bytes"
      );
    }

    // bcrypt's practical input limit is 72 bytes.
    if (Buffer.byteLength(ADMIN_PASSWORD, "utf8") > 72) {
      throw new Error("Admin password exceeds bcrypt limit");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      ADMIN_PASSWORD,
      12
    );

    await Admin.create({
      name: ADMIN_NAME.trim(),
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

createAdmin();
