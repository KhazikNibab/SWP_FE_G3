import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { hasAccess } from "./roles";

// Wrap a route element with role checks
const ProtectedRoute = ({ allowedRoles, element }) => {
  const account = useSelector((s) => s.account);
  const location = useLocation();

  if (!account) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!hasAccess(account.role, allowedRoles)) {
    return <Navigate to="/" replace />;
  }
  return element;
};

export default ProtectedRoute;
