import { createBrowserRouter } from "react-router-dom";
import Mainlayout from "./layout/MainLayout";
import NavLayout from "./layout/NavLayout";
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Faq from "./pages/faq/Faq";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import ForgotPassword from "./pages/forgot-password/Forgot-password";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admindashboard/AdminDashboard";
import ClientDashboard from "./pages/clientDashboard/ClientDashboard";
import SpecialistDashboard from "./pages/specialistDashboard/SpecialistDashboard";
import VerifyAndReset from "./pages/verifyandreset/VerifyAndReset";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Mainlayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/faq", element: <Faq /> },
      {
        path: "/clientdashboard",
        element: (
          <ProtectedRoute allowedRole="Client">
            <ClientDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admindashboard",
        element: (
          <ProtectedRoute allowedRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/specialistdashboard",
        element: (
          <ProtectedRoute allowedRole="Specialist">
            <SpecialistDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <NavLayout />,
    children: [
      { path: "/register", 
      element: <Register /> },

      { path: "/login",
       element: <Login /> },

      { path: "/forgot-password",
       element: <ForgotPassword /> },

       {
        path: "//verify-and-reset",
        element: <VerifyAndReset />
      }
      
    ],
  },
]);

export default router;