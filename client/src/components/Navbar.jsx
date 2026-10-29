
import { LogOut, GraduationCap, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import './Navbar.css'
export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login", { replace: true });
  };

  let admin = {};

  try {
    admin = JSON.parse(localStorage.getItem("admin") || "{}");
  } catch {
    admin = {};
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <GraduationCap size={25} />
        </div>
        <div>
          <h2>EdTech CRM</h2>
          <span>Inquiry Management</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="admin-info">
          <UserCircle size={24} />
          <div>
            <strong>{admin.name || "Admin"}</strong>
            <small>{admin.email || "Administrator"}</small>
          </div>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
