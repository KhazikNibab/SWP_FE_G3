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
import Customer from "./pages/customer";
import TestDrivePage from "./pages/testDrive";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ROUTE_ACCESS } from "./components/auth/roles";

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
          element: (
            <ProtectedRoute
              allowedRoles={ROUTE_ACCESS.car}
              element={<ManageCar />}
            />
          ), //outlet
        },
        {
          path: "category",
          element: (
            <ProtectedRoute
              allowedRoles={ROUTE_ACCESS.category}
              element={<ManageCategory />}
            />
          ), //outlet
        },
        {
          path: "contract",
          element: (
            <ProtectedRoute
              allowedRoles={ROUTE_ACCESS.contract}
              element={<Contract />}
            />
          ), // Contract management
        },
        {
          path: "accounts",
          element: (
            <ProtectedRoute
              allowedRoles={ROUTE_ACCESS.accounts}
              element={<AccountManagementPage />}
            />
          ), // Admin account management
        },
        {
          path: "customer",
          element: (
            <ProtectedRoute
              allowedRoles={ROUTE_ACCESS.customer}
              element={<Customer />}
            />
          ), //for dealer staff
        },
        {
          path: "testDrive",
          element: (
            <ProtectedRoute
              allowedRoles={ROUTE_ACCESS.testDrive}
              element={<TestDrivePage />}
            />
          ),
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
