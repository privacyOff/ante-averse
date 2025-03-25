
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-zinc-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-poker-red to-red-700 flex items-center justify-center mb-6 mx-auto">
          <span className="text-5xl">404</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-poker-red via-poker-gold to-poker-red">
          Page Not Found
        </h1>
        
        <p className="text-xl text-zinc-400 mb-8">
          Oops! It seems you've been dealt a bad hand. This page doesn't exist.
        </p>
        
        <Button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-poker-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-6 text-lg rounded-xl transition-all"
        >
          Return to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
