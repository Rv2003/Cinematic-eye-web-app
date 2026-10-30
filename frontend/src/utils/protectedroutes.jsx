import { Outlet,Navigate } from "react-router-dom";
import { LoadingScreen } from "../components/loading";

export function ProtectedRoutes({ user, authLoading }) {
  if (authLoading) {
    return <LoadingScreen/>;
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;}