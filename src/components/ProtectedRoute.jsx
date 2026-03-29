import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  // ✅ نقرأ الـ role من الـ JWT مباشرة
  const payload = JSON.parse(atob(token.split(".")[1]));
  const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" />;
  }

  return children;
}