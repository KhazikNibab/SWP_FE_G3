// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import LoginPage from "./components/login/LoginPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./components/dashboard";
import ManageBike from "./pages/bike";
import ManageCategory from "./pages/category";
import { ToastContainer } from "react-toastify";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        {
          path: "bike",
          element: <ManageBike />,
        },
        {
          path: "category",
          element: <ManageCategory />,
        },
      ],
    },
  ]);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
    // <Router>
    //   <div className="App">
    //     <Routes>
    //       <Route path="/" element={<LoginPage />} />
    //     </Routes>
    //   </div>
    // </Router>
  );
}

export default App;
