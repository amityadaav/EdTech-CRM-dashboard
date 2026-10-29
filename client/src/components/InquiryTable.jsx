
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import './InquiryTable.css'
const API_URL = "http://localhost:5000/api/inquiries";

const STATUSES = ["New", "In Progress", "Resolved"];
const CATEGORIES = [
  "Scholarship",
  "Concert",
  "Admission",
  "General Query",
];
const USER_TYPES = ["Parent", "Student", "School"];

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

  const limit = 10;

  const fetchInquiries = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: search.trim(),
          category,
          userType,
          page,
          limit,
        },
      });

      const result = response.data;

      // Supports common API response structures
      const records = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.inquiries)
        ? result.inquiries
        : Array.isArray(result.results)
        ? result.results
        : [];

      setInquiries(records);
      setTotal(Number(result.total ?? result.count ?? records.length));

      setTotalPages(
        Math.max(
          1,
          Number(
            result.totalPages ??
              Math.ceil(
                Number(result.total ?? result.count ?? records.length) /
                  limit
              )
          )
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load inquiries. Check your backend."
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, userType, page]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
    setNotice("");
  };

  const handleStatusChange = async (id, status) => {
    const token = localStorage.getItem("token");

    setUpdatingId(id);
    setError("");
    setNotice("");

    try {
      await axios.patch(
        `${API_URL}/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInquiries((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status } : item
        )
      );

      setNotice("Inquiry status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Status update failed."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="inquiry-section">
      <div className="inquiry-heading">
        <div>
          <h2>All Inquiries</h2>
          <p>Manage and track student and parent inquiries.</p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={fetchInquiries}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Search and filters */}
      <div className="inquiry-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) =>
              handleFilterChange(setSearch, e.target.value)
            }
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

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="alert alert-success" role="status">
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
                <td colSpan="7" className="table-message">
                  <LoaderCircle className="spinner" size={22} />
                  Loading inquiries...
                </td>
              </tr>
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-message">
                  No inquiries found.
                </td>
              </tr>
            ) : (
              inquiries.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="contact-cell">
                      <strong>{item.name}</strong>
                      <small>{item.email || "—"}</small>
                    </div>
                  </td>

                  <td>{item.phone || "—"}</td>
                  <td>{item.userType || "—"}</td>
                  <td>{item.category || "—"}</td>

                  <td>
                    <div
                      className="message-cell"
                      title={item.message}
                    >
                      {item.message || "—"}
                    </div>
                  </td>

                  <td>
                    {formatDate(item.createdAt)}
                  </td>

                  <td>
                    <select
                      className={`status-select status-${(
                        item.status || "New"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      value={item.status || "New"}
                      disabled={updatingId === item._id}
                      onChange={(e) =>
                        handleStatusChange(
                          item._id,
                          e.target.value
                        )
                      }
                      aria-label={`Update status for ${item.name}`}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
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
                  </td>
                </tr>
              ))
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              setPage((p) => Math.min(totalPages, p + 1))
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
