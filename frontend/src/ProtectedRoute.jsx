import { Navigate, replace } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      toast.error("you must be logged in to access this page!");
      setRedirect(true);
    }
  }, [loading, user]);

  if (loading) return <p>Loading.....</p>;
  if (redirect) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
