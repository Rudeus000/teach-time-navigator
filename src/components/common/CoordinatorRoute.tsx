
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const CoordinatorRoute = () => {
  const { isCoordinador, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-full">Cargando...</div>;
  }
  
  // If not a coordinator, redirect to profile
  if (!isCoordinador) {
    return <Navigate to="/perfil" />;
  }
  
  // Render children if coordinator
  return <Outlet />;
};

export default CoordinatorRoute;
