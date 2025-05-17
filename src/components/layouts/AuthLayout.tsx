
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthLayout = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // If authenticated, redirect based on role
  if (!loading && isAuthenticated) {
    if (user?.role === 'COORDINADOR') {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/perfil" />;
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      <motion.div 
        className="flex-grow flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

export default AuthLayout;
