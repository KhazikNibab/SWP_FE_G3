// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import LoginPage from "./components/login/LoginPage";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/dashboard";
import ManageCategory from "./pages/category";
import { ToastContainer } from "react-toastify";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";
import AccountManagementPage from "./pages/account";
import ManageCar from "./pages/car";
import Contract from "./pages/contract";

function App() {
  const router = createBrowserRouter([
    {
      path: "/dashboard",
      element: <Dashboard />,
      children: [
        // When someone visits /dashboard directly, immediately redirect to
        // the default child page 'car' so the Manage Car content is mounted
        // and fetches data on load.
        { index: true, element: <Navigate to="car" replace /> },
        {
          path: "car",
          element: <ManageCar />, //outlet
        },
        {
          path: "category",
          element: <ManageCategory />, //outlet
        },
        {
          path: "contract",
          element: <Contract />, // Contract management
        },
        {
          path: "accounts",
          element: <AccountManagementPage />, // Admin account management
        },
      ],
    },
    {
      path: "/",
      element: <HomePage />,
      // element: <AccountManagementPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      // Legacy path kept for backward compatibility. Redirect to the new
      // nested route inside Dashboard so the shared layout is used.
      path: "/manageAccount",
      element: <Navigate to="/dashboard/accounts" replace />,
    },
  ]);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
