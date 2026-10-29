
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
export default function Sidebar({ open = true, onClose }) {
  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "All Inquiries",
      path: "/dashboard",
      icon: ClipboardList,
    },
  ];

  return (
    <>
      {open && onClose && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <GraduationCap size={22} />
            <span>Workspace</span>
          </div>

          {onClose && (
            <button
              type="button"
              className="sidebar-close"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <p className="sidebar-label">MENU</p>

        <nav className="sidebar-nav">
          {links.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={`${item.name}-${index}`}
                to={item.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">
            <GraduationCap size={20} />
          </div>
          <div>
            <strong>EdTech CRM</strong>
            <small>Admin Workspace</small>
          </div>
        </div>
      </aside>
    </>
  );
}
