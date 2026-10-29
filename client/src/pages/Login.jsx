
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

// Render Backend API
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://edtech-crm-dashboard-1.onrender.com/api"
).replace(/\/+$/, "");

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already logged in
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      const result = response.data;

      // Validate backend response
      if (
        !result?.success ||
        !result?.token ||
        !result?.admin ||
        result.admin.role !== "admin"
      ) {
        throw new Error(
          "Invalid login response or unauthorized admin account."
        );
      }

      // Save authentication data
      localStorage.setItem("token", result.token);
      localStorage.setItem(
        "admin",
        JSON.stringify(result.admin)
      );

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;

      const message =
        err.response?.data?.message ||
        err.response?.data?.error;

      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please try again.");
      } else if (!err.response && err.request) {
        setError(
          "Cannot connect to server. Check backend status and CORS settings."
        );
      } else if (status === 401) {
        setError(message || "Invalid email or password.");
      } else if (status === 403) {
        setError(message || "You are not authorized to login.");
      } else if (status === 404) {
        setError(
          "Login API not found. Please check your backend route."
        );
      } else {
        setError(
          message || err.message || "Login failed. Please try again."
        );
      }

      // Helpful for development/debugging
      console.error("Login error:", {
        status,
        message: err.response?.data || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left side branding */}
        <section className="login-brand-panel">
          <div className="login-brand">
            <div className="login-logo">
              <GraduationCap size={30} />
            </div>

            <div>
              <h2>EdTech CRM</h2>
              <p>Inquiry Management System</p>
            </div>
          </div>

          <div className="login-brand-content">
            <span className="login-eyebrow">
              ADMIN WORKSPACE
            </span>

            <h1>
              Manage inquiries.
              <br />
              Build connections.
            </h1>

            <p>
              A centralized workspace to manage student,
              parent and school inquiries efficiently.
            </p>

            <div className="login-feature">
              <ShieldCheck size={21} />
              <span>Secure administrator access</span>
            </div>

            <div className="login-feature">
              <ShieldCheck size={21} />
              <span>Inquiry tracking and management</span>
            </div>
          </div>

          <div className="login-brand-footer">
            EdTech CRM · Admin Portal
          </div>
        </section>

        {/* Right side login form */}
        <section className="login-form-panel">
          <div className="login-form-wrapper">
            <div className="login-mobile-logo">
              <GraduationCap size={32} />
            </div>

            <div className="login-heading">
              <span className="login-small-title">
                WELCOME BACK
              </span>

              <h1>Admin Login</h1>

              <p>
                Enter your administrator credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="login-input-wrapper">
                  <Mail size={19} />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="login-input-wrapper">
                  <LockKeyhole size={19} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="spinner"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>

            <div className="login-security-note">
              <ShieldCheck size={17} />
              <span>Authorized administrators only</span>
            </div>

            <p className="login-copyright">
              © {new Date().getFullYear()} EdTech CRM
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
