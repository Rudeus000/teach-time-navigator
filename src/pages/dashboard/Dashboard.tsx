
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, BookOpen, School, Calendar, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const statsData = [
  {
    title: "Docentes",
    value: 45,
    icon: Users,
    color: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-500",
    link: "/docentes"
  },
  {
    title: "Asignaturas",
    value: 128,
    icon: BookOpen,
    color: "bg-green-100 dark:bg-green-900",
    iconColor: "text-green-500",
    link: "/cursos"
  },
  {
    title: "Aulas",
    value: 32,
    icon: School,
    color: "bg-amber-100 dark:bg-amber-900",
    iconColor: "text-amber-500",
    link: "/aulas"
  },
  {
    title: "Horarios Activos",
    value: 8,
    icon: Calendar,
    color: "bg-pink-100 dark:bg-pink-900",
    iconColor: "text-pink-500",
    link: "/horarios"
  },
];

const usageData = [
  { name: "Edificio de Ciencias", percentage: 78 },
  { name: "Artes Liberales", percentage: 64 },
  { name: "Centro de Ingeniería", percentage: 92 },
  { name: "Facultad de Negocios", percentage: 45 },
];

const scheduleStatusData = [
  {
    title: "Horario Primavera 2025",
    status: "success",
    message: "Publicado y listo",
  },
  {
    title: "Horario Otoño 2025",
    status: "warning",
    message: "10 conflictos por resolver",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Animation variants for stagger effect
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Panel Principal</h2>
          <p className="text-muted-foreground">
            Bienvenido, {user?.firstName || 'Coordinador'}. Aquí puedes gestionar todos los aspectos del sistema.
          </p>
        </div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsData.map((stat, index) => (
            <motion.div key={index} variants={item}>
              <Card className="stat-card cursor-pointer hover:scale-[1.02] transition-all" 
                onClick={() => navigate(stat.link)}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`rounded-full p-2 ${stat.color}`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> 
                  Utilización de Aulas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usageData.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-value"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: 0.4 + (index * 0.1) }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" /> 
                  Estado del Horario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduleStatusData.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    item.status === 'success' 
                      ? 'bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-800' 
                      : 'bg-amber-100 border border-amber-300 dark:bg-amber-900/30 dark:border-amber-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className={`text-sm ${
                          item.status === 'success' 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-amber-700 dark:text-amber-300'
                        }`}>
                          {item.message}
                        </p>
                      </div>
                      {item.status === 'warning' && (
                        <Button size="sm" variant="secondary">Resolver</Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Ver Horario
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
