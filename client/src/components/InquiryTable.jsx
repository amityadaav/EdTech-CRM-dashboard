
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import "./InquiryTable.css";

// Backend API configuration
const API_URL = `${
  import.meta.env.VITE_API_URL ||
  "https://edtech-crm-dashboard-1.onrender.com/api"
}`.replace(/\/+$/, "");

const INQUIRY_URL = `${API_URL}/inquiries`;

const STATUSES = ["New", "In Progress", "Resolved"];

const CATEGORIES = [
  "Scholarship",
  "Concert",
  "Admission",
  "General Query",
];

const USER_TYPES = ["Parent", "Student", "School"];

const LIMIT = 10;

export default function InquiryTable() {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [userType, setUserType] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchInquiries = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setInquiries([]);
      setTotal(0);
      setTotalPages(1);
      setError("Please login again. Authentication token not found.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await axios.get(INQUIRY_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: search.trim(),
          category,
          userType,
          page,
          limit: LIMIT,
        },
        timeout: 60000,
      });

      const result = response.data;

      // Supports common response formats:
      // { data: [] }
      // { inquiries: [] }
      // { results: [] }
      // { data: { inquiries: [], total, totalPages } }

      const nestedData = result?.data;

      const records = Array.isArray(nestedData)
        ? nestedData
        : Array.isArray(nestedData?.inquiries)
        ? nestedData.inquiries
        : Array.isArray(result?.inquiries)
        ? result.inquiries
        : Array.isArray(result?.results)
        ? result.results
        : [];

      const pagination =
        nestedData && !Array.isArray(nestedData)
          ? nestedData
          : result;

      const totalCount = Number(
        pagination?.total ??
          pagination?.count ??
          records.length
      );

      const pages = Number(
        pagination?.totalPages ??
          Math.ceil(totalCount / LIMIT)
      );

      setInquiries(records);
      setTotal(totalCount);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired or invalid token. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view inquiries.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load inquiries. Please check your backend."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [search, category, userType, page]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Update search and filters
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
    setNotice("");
  };

  // Update inquiry status
  const handleStatusChange = async (id, status) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    setUpdatingId(id);
    setError("");
    setNotice("");

    try {
      await axios.patch(
        `${INQUIRY_URL}/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 60000,
        }
      );

      setInquiries((previous) =>
        previous.map((item) =>
          item._id === id
            ? { ...item, status }
            : item
        )
      );

      setNotice("Inquiry status updated successfully.");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired or invalid token. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to update this inquiry.");
      } else {
        setError(
          err.response?.data?.message ||
            "Status update failed. Please try again."
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="inquiry-section">
      {/* Header */}
      <div className="inquiry-heading">
        <div>
          <h2>All Inquiries</h2>
          <p>
            Manage and track student and parent inquiries.
          </p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={fetchInquiries}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "spinner" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Search and filters */}
      <div className="inquiry-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(e) =>
              handleFilterChange(setSearch, e.target.value)
            }
            aria-label="Search inquiries"
          />
        </div>

        <select
          value={category}
          onChange={(e) =>
            handleFilterChange(setCategory, e.target.value)
          }
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>

          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={userType}
          onChange={(e) =>
            handleFilterChange(setUserType, e.target.value)
          }
          aria-label="Filter by user type"
        >
          <option value="">All User Types</option>

          {USER_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div
          className="alert alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Success */}
      {notice && (
        <div
          className="alert alert-success"
          role="status"
        >
          {notice}
        </div>
      )}

      {/* Inquiry table */}
      <div className="table-wrapper">
        <table className="inquiry-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Phone</th>
              <th>User Type</th>
              <th>Category</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="table-message">
                  <LoaderCircle
                    className="spinner"
                    size={22}
                  />
                  Loading inquiries...
                </td>
              </tr>
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-message">
                  No inquiries found.
                </td>
              </tr>
            ) : (
              inquiries.map((item) => {
                const currentStatus = STATUSES.includes(item.status)
                  ? item.status
                  : "New";

                return (
                  <tr key={item._id}>
                    {/* Contact */}
                    <td>
                      <div className="contact-cell">
                        <strong>{item.name || "—"}</strong>
                        <small>{item.email || "—"}</small>
                      </div>
                    </td>

                    {/* Phone */}
                    <td>{item.phone || "—"}</td>

                    {/* User Type */}
                    <td>{item.userType || "—"}</td>

                    {/* Category */}
                    <td>{item.category || "—"}</td>

                    {/* Message */}
                    <td>
                      <div
                        className="message-cell"
                        title={item.message || ""}
                      >
                        {item.message || "—"}
                      </div>
                    </td>

                    {/* Date */}
                    <td>{formatDate(item.createdAt)}</td>

                    {/* Status */}
                    <td>
                      <div className="status-cell">
                        <select
                          className={`status-select status-${currentStatus
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          value={currentStatus}
                          disabled={updatingId === item._id}
                          onChange={(e) =>
                            handleStatusChange(
                              item._id,
                              e.target.value
                            )
                          }
                          aria-label={`Update status for ${item.name || "inquiry"}`}
                        >
                          {STATUSES.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>

                        {updatingId === item._id && (
                          <LoaderCircle
                            size={14}
                            className="spinner"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span>
          {total} total inquiries
        </span>

        <div className="pagination-controls">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() =>
              setPage((previous) =>
                Math.max(1, previous - 1)
              )
            }
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() =>
              setPage((previous) =>
                Math.min(totalPages, previous + 1)
              )
            }
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
