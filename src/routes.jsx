import { createBrowserRouter } from "react-router-dom";
import Mainlayout from "./layout/MainLayout";
import NavLayout from "./layout/NavLayout";
import ClientSideBarLayout from "./layout/ClientSideBarLayout";
import SpecialistSideBarLayout from "./layout/SpecialistSideBarLayout";
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Faq from "./pages/faq/Faq";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import ForgotPassword from "./pages/forgot-password/Forgot-password";
import ProtectedRoute from "./components/ProtectedRoute";
// import AdminDashboard from "./pages/admindashboard/AdminDashboard";
import ClientDashboard from "./pages/clientDashboard/ClientDashboard";
import SpecialistDashboard from "./pages/specialistDashboard/SpecialistDashboard";
import VerifyAndReset from "./pages/verifyandreset/VerifyAndReset";
import Specialists from "./pages/specialists/Specialists";
import Specialist from "./pages/specialist/Specialist";
import VerifyEmail from "./pages/verify-email/VerifyEmail";
import ClientMessages from "./pages/clientMessages/ClientMessages";
import MyProgram from "./pages/myprogram/MyProgram";
import MyReservation from './pages/myreservation/MyReservation';
import ClientRecipes from "./pages/clientRecipes/ClientRecipes";
import Progress from "./pages/progress/Progress";
import ClientSettings from "./pages/clientSettings/ClientSettings";
import Appointments from "./pages/appointments/Appointments";
import SpecialistRecipes from "./pages/specialistRecipes/SpecialistRecipes";
import Programs from "./pages/programs/Programs";
import SpecialistSettings from "./pages/specialistSettings/SpecialistSettings";
import SpecialistMessages from "./pages/specialistMessages/SpecialistMessages";
import Clients from "./pages/clients/Clients";
import AIBodyAnalysis from "./pages/aIBodyAnalysis/AIBodyAnalysis";
import Plans from "./pages/plans/Plans";
import SpecialistInbody from "./pages/specialistinbody/SpecialistInbody";



const router = createBrowserRouter([
  {
    path: "/",
    element: <Mainlayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/faq", element: <Faq /> },     
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
    ],
  },

  {
    path: "/",
    element: <ClientSideBarLayout />,  
    children: [
      { path: "/specialist/:id", 
      element: <Specialist /> 
    },

      { path: "/specialists", 
      element: <Specialists />
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
        path: "/aIBodyAnalysis",
        element: (
          <ProtectedRoute allowedRole="Client">
            <AIBodyAnalysis />
          </ProtectedRoute>
        ),
      },
      {
        path: "/clientSettings",
        element: (
          <ProtectedRoute allowedRole="Client">
            <ClientSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "/clientMessages",
        element: (
          <ProtectedRoute allowedRole="Client">
            <ClientMessages />
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
        path: "/clientRecipes",
        element: (
          <ProtectedRoute allowedRole="Client">
            <ClientRecipes />
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

  {
    path: "/",
    element: <SpecialistSideBarLayout />,  
    children: [
      {
        path: "/specialistInbody/:clientId",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <SpecialistInbody />
          </ProtectedRoute>
        ),
      },
      {
        path: "/specialistdashboard",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <SpecialistDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/plans",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <Plans />
          </ProtectedRoute>
        ),
      },

      {
        path: "/specialistSettings",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <SpecialistSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "/specialistMessages",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <SpecialistMessages />
          </ProtectedRoute>
        ),
      },
      {
        path: "/Programs",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <Programs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/Clients",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <Clients/>
          </ProtectedRoute>
        ),
      },
      {
        path: "/specialistRecipes",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <SpecialistRecipes />
          </ProtectedRoute>
        ),
      },
      {
        path: "/Appointments",
        element: (
          <ProtectedRoute allowedRole="Nutritionist">
            <Appointments />
          </ProtectedRoute>
        ),
      }    
    
    ],
  },
]);

export default router;