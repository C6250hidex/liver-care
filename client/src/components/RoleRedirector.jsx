import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRedirector = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/dashboard/admin" />;
    case "doctor":
      return <Navigate to="/dashboard/doctor" />;
    default:
      return <Navigate to="/dashboard/patient" />;
  }
};

export default RoleRedirector;
