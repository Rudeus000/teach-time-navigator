
import { useAuth } from '@/context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  School,
  CalendarDays,
  CalendarClock,
  UserCog,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: Array<'COORDINADOR' | 'DOCENTE'>;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Panel Principal', href: '/dashboard', roles: ['COORDINADOR'] },
  { icon: Building2, label: 'Unidades Académicas', href: '/unidades-academicas', roles: ['COORDINADOR'] },
  { icon: GraduationCap, label: 'Carreras', href: '/carreras', roles: ['COORDINADOR'] },
  { icon: BookOpen, label: 'Cursos', href: '/cursos', roles: ['COORDINADOR'] },
  { icon: Users, label: 'Docentes', href: '/docentes', roles: ['COORDINADOR'] },
  { icon: Award, label: 'Especialidades', href: '/especialidades', roles: ['COORDINADOR'] },
  { icon: School, label: 'Aulas', href: '/aulas', roles: ['COORDINADOR'] },
  { icon: Calendar, label: 'Horarios', href: '/horarios', roles: ['COORDINADOR'] },
  { icon: CalendarClock, label: 'Generador de Horarios', href: '/generar-horarios', roles: ['COORDINADOR'] },
  { icon: UserCog, label: 'Perfil', href: '/perfil', roles: ['COORDINADOR', 'DOCENTE'] },
  { icon: CalendarDays, label: 'Disponibilidad', href: '/disponibilidad', roles: ['COORDINADOR', 'DOCENTE'] },
];

const Sidebar = ({ collapsed }: SidebarProps) => {
  const { isCoordinador, isDocente } = useAuth();
  const location = useLocation();
  
  const userRole = isCoordinador ? 'COORDINADOR' : 'DOCENTE';
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className={cn(
        "bg-sidebar text-sidebar-foreground border-r h-screen sticky top-0 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-[280px]"
      )}
    >
      <div className="p-4 flex items-center justify-center h-16 border-b">
        <Link to="/" className="flex items-center">
          <CalendarDays className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="ml-3 font-semibold text-lg">HorarioAcad</span>
          )}
        </Link>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {filteredNavItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center rounded-md py-3 px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  location.pathname === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t text-xs text-center text-sidebar-foreground/70">
        {!collapsed && <span>HorarioAcad v1.0</span>}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
