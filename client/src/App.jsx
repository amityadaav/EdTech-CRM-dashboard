
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import InquiryForm from "./pages/InquiryForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/inquiry" replace />} />

        <Route path="/inquiry" element={<InquiryForm />} />

        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected admin route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/inquiry" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
