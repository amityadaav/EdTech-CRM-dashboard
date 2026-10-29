
import { useState } from "react";
import { Menu } from "lucide-react";
import "./Dashboard.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import InquiryTable from "../components/InquiryTable";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="dashboard-body">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="dashboard-main">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="dashboard-welcome">
            <h1>Dashboard</h1>
            <p>Welcome back! Manage your inquiries here.</p>
          </div>

          <InquiryTable />
        </main>
      </div>
    </div>
  );
}
