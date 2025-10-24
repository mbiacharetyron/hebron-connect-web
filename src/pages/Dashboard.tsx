import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to connect rooms page
    navigate("/rooms", { replace: true });
  }, [navigate]);

  return null; // Will redirect to /rooms
};

export default Dashboard;

