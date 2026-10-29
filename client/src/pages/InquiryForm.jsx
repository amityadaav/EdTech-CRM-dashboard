
import { useState } from "react";
import axios from "axios";
import {
  GraduationCap,
  UserRound,
  Mail,
  Phone,
  MessageSquareText,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Users,
  BookOpen,
  School,
  RotateCcw,
} from "lucide-react";

import "./InquiryForm.css";
import { useNavigate } from "react-router-dom";

// Render Backend API
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://edtech-crm-dashboard-1.onrender.com/api"
).replace(/\/+$/, "");

const INITIAL_FORM = {
  userType: "",
  category: "",
  name: "",
  email: "",
  phone: "",
  message: "",
};

const USER_TYPES = [
  { label: "Parent", icon: Users },
  { label: "Student", icon: GraduationCap },
  { label: "School", icon: School },
];

const CATEGORIES = [
  "Scholarship",
  "Concert",
  "Admission",
  "General Query",
];

export default function InquiryForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess(false);
  };

  // Handle inquiry submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const payload = {
      userType: formData.userType,
      category: formData.category,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
    };

    // Required field validation
    if (
      !payload.userType ||
      !payload.category ||
      !payload.name ||
      !payload.email ||
      !payload.phone ||
      !payload.message
    ) {
      setError("Please complete all required fields.");
      return;
    }

    // Phone validation
    if (!/^\+?[0-9\s()-]{7,20}$/.test(payload.phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    // Require at least 7 digits
    const digits = payload.phone.replace(/\D/g, "");

    if (digits.length < 7 || digits.length > 15) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post(
        `${API_URL}/inquiries`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      const result = response.data;

      // Handle explicit API failure
      if (result?.success === false) {
        throw new Error(
          result.message || "Inquiry submission failed."
        );
      }

      // Show success only after successful HTTP response
      setSuccess(true);
      setFormData({ ...INITIAL_FORM });
    } catch (err) {
      const status = err.response?.status;
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      if (err.code === "ECONNABORTED") {
        setError(
          "Request timed out. Please check your inquiry status before retrying."
        );
      } else if (!err.response && err.request) {
        setError(
          "Unable to connect to server. Please check your backend and CORS settings."
        );
      } else if (status === 404) {
        setError(
          "Inquiry API not found. Please check your backend route."
        );
      } else if (status === 400) {
        setError(
          serverMessage || "Please check your submitted details."
        );
      } else if (status === 429) {
        setError(
          "Too many requests. Please wait and try again later."
        );
      } else {
        setError(
          serverMessage ||
            err.message ||
            "Something went wrong. Please try again."
        );
      }

      console.error("Inquiry submission error:", {
        status,
        message: serverMessage || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ ...INITIAL_FORM });
    setSuccess(false);
    setError("");
  };

  return (
    <main className="iq-page">
      <div className="iq-shell">

        {/* Brand */}
        <header className="iq-header">
          <a href="/inquiry" className="iq-brand">
            <span className="iq-brand-icon">
              <GraduationCap size={26} />
            </span>

            <span>
              <strong>EdTech CRM</strong>
              <small>Education · Connection · Growth</small>
            </span>
          </a>

          <button
            type="button"
            className="admin-login-btn"
            onClick={() => navigate("/login")}
          >
            <ShieldCheck size={17} />
            <span>Admin Login</span>
          </button>
        </header>

        <div className="iq-layout">

          {/* Left Hero Panel */}
          <aside className="iq-hero">
            <div className="iq-hero-content">
              <div className="iq-eyebrow">
                <Sparkles size={14} />
                WE'RE HERE TO HELP
              </div>

              <h1>
                Let's talk about
                <br />
                <span>your future.</span>
              </h1>

              <p className="iq-hero-description">
                Every great journey starts with a question.
                Tell us what you need, and let us help you
                find the right direction.
              </p>

              <div className="iq-benefits">
                <div className="iq-benefit">
                  <span className="iq-benefit-icon">
                    <CheckCircle2 size={19} />
                  </span>

                  <div>
                    <strong>Simple inquiry process</strong>
                    <p>
                      Share your question in just a few steps.
                    </p>
                  </div>
                </div>

                <div className="iq-benefit">
                  <span className="iq-benefit-icon">
                    <MessageSquareText size={19} />
                  </span>

                  <div>
                    <strong>One place for your queries</strong>
                    <p>
                      Admission, scholarship and more.
                    </p>
                  </div>
                </div>

                <div className="iq-benefit">
                  <span className="iq-benefit-icon">
                    <ShieldCheck size={19} />
                  </span>

                  <div>
                    <strong>
                      Responsible information handling
                    </strong>
                    <p>
                      We request only the details we need.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="iq-hero-bottom">
              <div className="iq-hero-line" />
              <p>
                Helping you move forward, one question at a time.
              </p>
            </div>

            <div className="iq-decoration iq-decoration-one" />
            <div className="iq-decoration iq-decoration-two" />
          </aside>

          {/* Right Form */}
          <section className="iq-form-panel">
            <div className="iq-form-inner">

              {!success ? (
                <>
                  <div className="iq-form-heading">
                    <span className="iq-step-label">
                      INQUIRY FORM
                    </span>

                    <h2>Send us a message</h2>

                    <p>
                      Fill in the details below to get started.
                    </p>
                  </div>

                  {error && (
                    <div
                      className="iq-alert iq-alert-error"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* User Type */}
                    <div className="iq-field">
                      <label className="iq-label">
                        I am a <span>*</span>
                      </label>

                      <div className="iq-user-types">
                        {USER_TYPES.map(
                          ({ label, icon: Icon }) => (
                            <button
                              key={label}
                              type="button"
                              disabled={loading}
                              className={`iq-type-option ${
                                formData.userType === label
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  userType: label,
                                }));

                                setError("");
                              }}
                              aria-pressed={
                                formData.userType === label
                              }
                            >
                              <Icon size={19} />
                              <span>{label}</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="iq-field">
                      <label
                        htmlFor="category"
                        className="iq-label"
                      >
                        Inquiry category <span>*</span>
                      </label>

                      <div className="iq-select-wrap">
                        <BookOpen size={18} />

                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value="">
                            Choose a category
                          </option>

                          {CATEGORIES.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="iq-field">
                      <label
                        htmlFor="name"
                        className="iq-label"
                      >
                        Full name <span>*</span>
                      </label>

                      <div className="iq-input-wrap">
                        <UserRound size={18} />

                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleChange}
                          autoComplete="name"
                          maxLength={100}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="iq-field">
                      <label
                        htmlFor="email"
                        className="iq-label"
                      >
                        Email address <span>*</span>
                      </label>

                      <div className="iq-input-wrap">
                        <Mail size={18} />

                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          autoComplete="email"
                          maxLength={254}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="iq-field">
                      <label
                        htmlFor="phone"
                        className="iq-label"
                      >
                        Phone number <span>*</span>
                      </label>

                      <div className="iq-input-wrap">
                        <Phone size={18} />

                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                          maxLength={20}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="iq-field">
                      <div className="iq-message-label">
                        <label
                          htmlFor="message"
                          className="iq-label"
                        >
                          Your message <span>*</span>
                        </label>

                        <small>Required</small>
                      </div>

                      <div className="iq-textarea-wrap">
                        <MessageSquareText size={18} />

                        <textarea
                          id="message"
                          name="message"
                          placeholder="Tell us how we can help you..."
                          value={formData.message}
                          onChange={handleChange}
                          rows={4}
                          maxLength={3000}
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="iq-char-count">
                        {formData.message.length}/3000
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      className="iq-submit"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle
                            size={19}
                            className="iq-spinner"
                          />
                          Submitting your inquiry...
                        </>
                      ) : (
                        <>Submit inquiry</>
                      )}
                    </button>

                    <div className="iq-privacy">
                      <ShieldCheck size={16} />
                      <span>
                        Your details are submitted securely over
                        your site's configured connection.
                      </span>
                    </div>
                  </form>
                </>
              ) : (
                /* Success Screen */
                <div className="iq-success-screen">
                  <div className="iq-success-icon">
                    <CheckCircle2 size={40} />
                  </div>

                  <span className="iq-step-label">
                    SUBMISSION COMPLETE
                  </span>

                  <h2>Thank you!</h2>

                  <p>
                    Your inquiry has been submitted successfully.
                    We appreciate you reaching out to us.
                  </p>

                  <div className="iq-success-details">
                    <CheckCircle2 size={20} />

                    <div>
                      <strong>Inquiry received</strong>
                      <small>
                        Your message has been sent to our team.
                      </small>
                    </div>
                  </div>

                  <button
                    className="iq-submit"
                    type="button"
                    onClick={resetForm}
                  >
                    Submit another inquiry
                    <RotateCcw size={17} />
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="iq-footer">
          <span>
            © {new Date().getFullYear()} EdTech CRM
          </span>

          <span>Built for better connections.</span>
        </footer>
      </div>
    </main>
  );
}
