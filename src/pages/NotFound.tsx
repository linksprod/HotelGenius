
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useHotelPath } from "@/hooks/useHotelPath";

const NotFound = () => {
  const location = useLocation();
  const { resolvePath } = useHotelPath();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="text-center p-8 bg-card rounded-lg shadow-sm border border-border">
        <h1 className="text-6xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Oops! Page not found</p>
        <button 
          onClick={() => window.location.href = resolvePath('/')} 
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
