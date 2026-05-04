import { createBrowserRouter } from "react-router-dom";
import Mainlayout from "./layout/MainLayout";
import NavLayout from "./layout/NavLayout";
import ClientSideBarLayout from "./layout/ClientSideBarLayout";
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
import Specialists from "./pages/specialists/Specialists";
import Specialist from "./pages/specialist/Specialist";
import VerifyEmail from "./pages/verify-email/VerifyEmail";
import Settings from "./pages/settings/Settings";
import Messages from "./pages/messages/Messages";
import MyProgram from "./pages/myprogram/MyProgram";
import MyReservation from './pages/myreservation/MyReservation';
import Recipes from "./pages/recipes/Recipes";
import Progress from "./pages/progress/Progress";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Mainlayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/faq", element: <Faq /> },
      { path: "/specialists", element: <Specialists /> },
    ],
  },
  {
    path: "/",
    element: <NavLayout />,
    children: [
      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/verify-email", element: <VerifyEmail /> },
      { path: "/verify-and-reset", element: <VerifyAndReset /> },
      { path: "/specialist/:id", element: <Specialist /> },
    ],
  },
  {
    path: "/",
    element: <ClientSideBarLayout />,  // ✅ layout جديد للـ dashboards
    children: [
      {
        path: "/specialistdashboard",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <SpecialistDashboard />
          </ProtectedRoute>
        ),
      },
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
        path: "/settings",
        element: (
          <ProtectedRoute allowedRole="Client">
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "/messages",
        element: (
          <ProtectedRoute allowedRole="Client">
            <Messages />
          </ProtectedRoute>
        ),
      },
      {
        path: "/myprogram",
        element: (
          <ProtectedRoute allowedRole="Client">
            <MyProgram />
          </ProtectedRoute>
        ),
      },
      {
        path: "/myreservation",
        element: (
          <ProtectedRoute allowedRole="Client">
            <MyReservation />
          </ProtectedRoute>
        ),
      },
      {
        path: "/recipes",
        element: (
          <ProtectedRoute allowedRole="Client">
            <Recipes />
          </ProtectedRoute>
        ),
      },
      {
        path: "/progress",
        element: (
          <ProtectedRoute allowedRole="Client">
            <Progress />
          </ProtectedRoute>
        ),
      }    
    
    ],
  },
]);

export default router;