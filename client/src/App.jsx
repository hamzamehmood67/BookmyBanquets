import Register from "./pages/Register";
import Login from "./pages/Login";
import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import HomeLayout from "./layout/homeLayout";
import Home from "./pages/Venues";
import HomeNew from "./pages/HomeNew";
import HallProfile from "./pages/HallProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ManagerDashboard from "./pages/ManagerDashboard";
import HallCustomerDashboard from "./pages/HallCustomerDashboard";
import Contact from "./pages/contact";
import Services from "./pages/services";
import Locations from "./pages/Locations";
import ResetPassword from "./pages/resetPassword";
import VerifyEmail from "./pages/EmailVerification";
const Router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <HomeNew />,
      },

      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/venues",
        element: <Home />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/manager-dashboard",
        element: <ManagerDashboard />,
      },
      {
        path: "/customer-dashboard",
        element: <HallCustomerDashboard />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/services",
        element: <Services />,
      },
      {
        path: "/locations",
        element: <Locations />,
      },
    ],
  },
  {
    path: "/hall/:id",
    element: <HallProfile />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "verify-email",
    element: <VerifyEmail />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={Router}></RouterProvider>
    </>
  );
}

export default App;
