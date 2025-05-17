
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context Providers
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

// Layouts
import AppLayout from "@/components/layouts/AppLayout";
import AuthLayout from "@/components/layouts/AuthLayout";

// Authentication Pages
import LoginPage from "@/pages/auth/Login";

// Main App Pages
import DashboardPage from "@/pages/dashboard/Dashboard";
import NotFound from "@/pages/NotFound";
import ProfilePage from "@/pages/profile/Profile";
import DisponibilidadPage from "@/pages/disponibilidad/Disponibilidad";

// Protected Routes
import ProtectedRoute from "@/components/common/ProtectedRoute";
import CoordinatorRoute from "@/components/common/CoordinatorRoute";

// Coordinator Routes
import UnidadAcademicaPage from "@/pages/academica/UnidadAcademica";
import CarreraPage from "@/pages/academica/Carrera";
import CursoPage from "@/pages/academica/Curso";
import DocentePage from "@/pages/docentes/Docente";
import EspecialidadPage from "@/pages/docentes/Especialidad";
import DisponibilidadDocentesPage from "@/pages/docentes/DisponibilidadDocentes";
import AulaPage from "@/pages/aulas/Aula";
import HorarioManualPage from "@/pages/horarios/HorarioManual";
import GeneradorHorarioPage from "@/pages/horarios/GeneradorHorario";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>
              
              {/* Protected App Routes */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                {/* Routes for both roles */}
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/disponibilidad" element={<DisponibilidadPage />} />
                
                {/* Coordinator Only Routes */}
                <Route element={<CoordinatorRoute />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/unidades-academicas" element={<UnidadAcademicaPage />} />
                  <Route path="/carreras" element={<CarreraPage />} />
                  <Route path="/cursos" element={<CursoPage />} />
                  <Route path="/docentes" element={<DocentePage />} />
                  <Route path="/especialidades" element={<EspecialidadPage />} />
                  <Route path="/disponibilidad-docentes" element={<DisponibilidadDocentesPage />} />
                  <Route path="/aulas" element={<AulaPage />} />
                  <Route path="/horarios" element={<HorarioManualPage />} />
                  <Route path="/generar-horarios" element={<GeneradorHorarioPage />} />
                </Route>
              </Route>
              
              {/* 404 - Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
