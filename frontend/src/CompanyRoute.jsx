import { Navigate, replace } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function CompanyRoute({ children }) {
  const { user, loading } = useAuth();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user?.role !== "company")) {
      toast.error("Unauthorized!");
      setRedirect(true);
    }
  }, [loading, user]);

  if (loading) return <p>Loading.....</p>;
  if (redirect) return <Navigate to="/" replace />;

  return children;
}

export default CompanyRoute;
