
import React, { useState, useEffect } from 'react';
import { CalendarClock, Play, Settings, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Interfaces que reflejan la estructura del backend Django
interface PeriodoAcademico {
  id: number;
  nombre_periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

interface Docente {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  especialidades: Especialidad[];
}

interface Especialidad {
  id: number;
  nombre: string;
  codigo: string;
  area: string;
}

interface Curso {
  id: number;
  nombre: string;
  codigo: string;
  especialidades: Especialidad[];
  carreraId: number;
}

interface Grupo {
  grupo_id: number;
  codigo_grupo: string;
  materia: Curso;
  carrera: any;
  periodo: PeriodoAcademico;
  numero_estudiantes_estimado: number | null;
  turno_preferente: 'M' | 'T' | 'N' | null;
  docente_asignado_directamente: Docente | null;
}

interface BloqueHorario {
  bloque_def_id: number;
  nombre_bloque: string;
  hora_inicio: string;
  hora_fin: string;
  turno: 'M' | 'T' | 'N';
  dia_semana: number | null;
}

interface HorarioAsignado {
  horario_id: number;
  grupo: Grupo;
  docente: Docente;
  espacio: any;
  periodo: PeriodoAcademico;
  dia_semana: number;
  bloque_horario: BloqueHorario;
  estado: 'Programado' | 'Confirmado' | 'Cancelado';
  observaciones: string | null;
}

interface DisponibilidadDocente {
  disponibilidad_id: number;
  docente: Docente;
  periodo: PeriodoAcademico;
  dia_semana: number;
  bloque_horario: BloqueHorario;
  esta_disponible: boolean;
  preferencia: number;
}

interface HorarioGenerado {
  id: number;
  nombre: string;
  fechaCreacion: string;
  estadoGeneracion: 'Completo' | 'Parcial' | 'Con Conflictos';
  conflictos: number;
  cursos: number;
  docentes: number;
  aulas: number;
  periodo: PeriodoAcademico;
  horarios?: HorarioAsignado[];
}

// Esquema de validación para el formulario
const generadorSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  periodoId: z.string().min(1, { message: 'Debe seleccionar un período académico' }),
  prioridadDocente: z.coerce.number().min(1).max(5),
  prioridadAula: z.coerce.number().min(1).max(5),
  maximoHorasDiarias: z.coerce.number().min(1).max(12),
  permitirHuecos: z.boolean().default(false),
  turnoPreferente: z.enum(['M', 'T', 'N', 'todos']).default('todos'),
});

type FormValues = z.infer<typeof generadorSchema>;

const GeneradorHorarioPage = () => {
  // Estados para datos del backend
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([
    { id: 1, nombre_periodo: '2023-I', fecha_inicio: '2023-03-01', fecha_fin: '2023-07-31', activo: false },
    { id: 2, nombre_periodo: '2023-II', fecha_inicio: '2023-08-01', fecha_fin: '2023-12-20', activo: false },
    { id: 3, nombre_periodo: '2024-I', fecha_inicio: '2024-03-01', fecha_fin: '2024-07-31', activo: true },
  ]);
  
  const [bloques, setBloques] = useState<BloqueHorario[]>([
    { bloque_def_id: 1, nombre_bloque: 'Bloque 1', hora_inicio: '07:00', hora_fin: '08:30', turno: 'M', dia_semana: null },
    { bloque_def_id: 2, nombre_bloque: 'Bloque 2', hora_inicio: '08:45', hora_fin: '10:15', turno: 'M', dia_semana: null },
    { bloque_def_id: 3, nombre_bloque: 'Bloque 3', hora_inicio: '10:30', hora_fin: '12:00', turno: 'M', dia_semana: null },
    { bloque_def_id: 4, nombre_bloque: 'Bloque 4', hora_inicio: '12:15', hora_fin: '13:45', turno: 'T', dia_semana: null },
    { bloque_def_id: 5, nombre_bloque: 'Bloque 5', hora_inicio: '14:00', hora_fin: '15:30', turno: 'T', dia_semana: null },
    { bloque_def_id: 6, nombre_bloque: 'Bloque 6', hora_inicio: '15:45', hora_fin: '17:15', turno: 'T', dia_semana: null },
    { bloque_def_id: 7, nombre_bloque: 'Bloque 7', hora_inicio: '17:30', hora_fin: '19:00', turno: 'N', dia_semana: null },
    { bloque_def_id: 8, nombre_bloque: 'Bloque 8', hora_inicio: '19:15', hora_fin: '20:45', turno: 'N', dia_semana: null },
  ]);
  
  // Estado para horarios generados
  const [horarios, setHorarios] = useState<HorarioGenerado[]>([
    {
      id: 1,
      nombre: 'Horario 2023-I Ingeniería',
      fechaCreacion: '2023-02-15',
      estadoGeneracion: 'Completo',
      conflictos: 0,
      cursos: 45,
      docentes: 15,
      aulas: 12,
      periodo: periodos[0]
    },
    {
      id: 2,
      nombre: 'Horario 2023-II Economía',
      fechaCreacion: '2023-07-20',
      estadoGeneracion: 'Parcial',
      conflictos: 3,
      cursos: 30,
      docentes: 10,
      aulas: 8,
      periodo: periodos[1]
    }
  ]);
  
  // Estados para UI
  const [selectedHorario, setSelectedHorario] = useState<HorarioGenerado | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [horarioDetalle, setHorarioDetalle] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [progresoGeneracion, setProgresoGeneracion] = useState(0);
  
  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(generadorSchema),
    defaultValues: {
      nombre: '',
      periodoId: '',
      prioridadDocente: 3,
      prioridadAula: 2,
      maximoHorasDiarias: 8,
      permitirHuecos: false,
      turnoPreferente: 'todos',
    },
  });

  // Función para generar un horario (simulado)
  const generarHorario = (data: FormValues) => {
    setGenerando(true);
    setProgresoGeneracion(0);
    
    // Simulación del progreso
    const intervalId = setInterval(() => {
      setProgresoGeneracion(prev => {
        if (prev >= 100) {
          clearInterval(intervalId);
          finalizarGeneracion(data);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    
    // Aquí se implementaría la llamada al backend con axios
    // axios.post('/api/acciones-horario/generar-horario-automatico', {
    //   periodo_id: data.periodoId,
    //   config: {
    //     prioridad_docente: data.prioridadDocente,
    //     prioridad_aula: data.prioridadAula,
    //     maximo_horas_diarias: data.maximoHorasDiarias,
    //     permitir_huecos: data.permitirHuecos,
    //     turno_preferente: data.turnoPreferente === 'todos' ? null : data.turnoPreferente
    //   }
    // })
    // .then(response => {
    //   finalizarGeneracion({...data, resultadoApi: response.data});
    // })
    // .catch(error => {
    //   toast.error('Error al generar el horario');
    //   setGenerando(false);
    //   setDialogOpen(false);
    // });
  };

  // Función para finalizar la generación
  const finalizarGeneracion = (data: FormValues) => {
    setTimeout(() => {
      const periodo = periodos.find(p => p.id.toString() === data.periodoId);
      
      // Crear nuevo horario
      const nuevoHorario: HorarioGenerado = {
        id: Math.max(0, ...horarios.map(h => h.id)) + 1,
        nombre: data.nombre,
        fechaCreacion: new Date().toISOString().split('T')[0],
        estadoGeneracion: Math.random() > 0.7 ? 'Con Conflictos' : 'Completo',
        conflictos: Math.floor(Math.random() * 5),
        cursos: Math.floor(Math.random() * 30) + 20,
        docentes: Math.floor(Math.random() * 10) + 5,
        aulas: Math.floor(Math.random() * 8) + 5,
        periodo: periodo!
      };
      
      setHorarios([...horarios, nuevoHorario]);
      setGenerando(false);
      setDialogOpen(false);
      toast.success('Horario generado exitosamente');
      form.reset();
    }, 1000);
  };

  // Función para eliminar un horario
  const eliminarHorario = (id: number) => {
    if (selectedHorario?.id === id) {
      setSelectedHorario(null);
      setHorarioDetalle(false);
    }
    setHorarios(horarios.filter(h => h.id !== id));
    toast.success('Horario eliminado');
  };

  // Función para abrir el diálogo
  const abrirDialogo = () => {
    form.reset({
      nombre: '',
      periodoId: periodos.find(p => p.activo)?.id.toString() || '',
      prioridadDocente: 3,
      prioridadAula: 2,
      maximoHorasDiarias: 8,
      permitirHuecos: false,
      turnoPreferente: 'todos',
    });
    setDialogOpen(true);
  };

  // Función para ver detalle de un horario
  const verDetalleHorario = (horario: HorarioGenerado) => {
    setSelectedHorario(horario);
    // Aquí se implementaría la carga de detalles del horario desde el API
    // axios.get(`/api/horarios-asignados?periodo=${horario.periodo.id}`)
    //   .then(response => {
    //     const horarioConDetalle = {...horario, horarios: response.data};
    //     setSelectedHorario(horarioConDetalle);
    //     setHorarioDetalle(true);
    //   })
    //   .catch(error => {
    //     toast.error('Error al cargar los detalles del horario');
    //   });
    
    // Simulación de carga de datos
    setTimeout(() => {
      const diasSemana = [1, 2, 3, 4, 5];
      const bloquesPorDia = bloques.map(bloque => ({...bloque, dia_semana: 1}));
      
      const horarioConDetalle = {...horario, horarios: []};
      setSelectedHorario(horarioConDetalle);
      setHorarioDetalle(true);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto"
    >
      {!horarioDetalle ? (
        // Vista de lista de horarios
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Generador de Horarios</h2>
              <p className="text-muted-foreground">Genera horarios de forma automática</p>
            </div>
            <Button onClick={abrirDialogo} className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> 
              Generar Nuevo Horario
            </Button>
          </div>
          
          {horarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {horarios.map((horario) => (
                <Card key={horario.id}>
                  <CardHeader>
                    <CardTitle>{horario.nombre}</CardTitle>
                    <CardDescription>Creado el {horario.fechaCreacion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Periodo:</span>
                        <span>{horario.periodo.nombre_periodo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Estado:</span>
                        <span 
                          className={`font-medium ${
                            horario.estadoGeneracion === 'Completo' 
                              ? 'text-green-600' 
                              : horario.estadoGeneracion === 'Parcial' 
                                ? 'text-amber-600' 
                                : 'text-red-600'
                          }`}
                        >
                          {horario.estadoGeneracion}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Conflictos:</span>
                        <span>{horario.conflictos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cursos:</span>
                        <span>{horario.cursos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Docentes:</span>
                        <span>{horario.docentes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Aulas:</span>
                        <span>{horario.aulas}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-x-2 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => verDetalleHorario(horario)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Ver Horario
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => eliminarHorario(horario.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-muted/20 border rounded-md">
              <CalendarClock className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No hay horarios generados</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Genere un nuevo horario utilizando el botón "Generar Nuevo Horario".
              </p>
              <Button onClick={abrirDialogo} className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> 
                Generar Nuevo Horario
              </Button>
            </div>
          )}
        </>
      ) : (
        // Vista de detalle de horario
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2" 
                  onClick={() => setHorarioDetalle(false)}
                >
                  ← Volver
                </Button>
                <h2 className="text-3xl font-bold">{selectedHorario?.nombre}</h2>
              </div>
              <p className="text-muted-foreground ml-12">
                Periodo: {selectedHorario?.periodo.nombre_periodo} • Creado: {selectedHorario?.fechaCreacion}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className={`${
                  selectedHorario?.estadoGeneracion === 'Completo' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : selectedHorario?.estadoGeneracion === 'Parcial' 
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                {selectedHorario?.estadoGeneracion}
              </Badge>
              <Button variant="outline" size="sm">Exportar a Excel</Button>
            </div>
          </div>
          
          <Tabs defaultValue="calendario" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="calendario">Vista Calendario</TabsTrigger>
              <TabsTrigger value="docentes">Por Docentes</TabsTrigger>
              <TabsTrigger value="aulas">Por Aulas</TabsTrigger>
              <TabsTrigger value="grupos">Por Grupos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendario">
              <Card>
                <CardContent className="pt-6">
                  <div className="w-full overflow-x-auto">
                    <CalendarView />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="docentes">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Vista por docentes en desarrollo...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="aulas">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Vista por aulas en desarrollo...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="grupos">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Vista por grupos en desarrollo...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {/* Diálogo para generar un nuevo horario */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generar Nuevo Horario</DialogTitle>
            <DialogDescription>
              Configure los parámetros para la generación automática del horario.
            </DialogDescription>
          </DialogHeader>
          
          {!generando ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(generarHorario)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del horario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="periodoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período Académico</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un período" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {periodos.map(periodo => (
                            <SelectItem key={periodo.id} value={periodo.id.toString()}>
                              {periodo.nombre_periodo} {periodo.activo ? '(Actual)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="prioridadDocente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad Docente (1-5)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="prioridadAula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad Aula (1-5)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maximoHorasDiarias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo Horas Diarias</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="turnoPreferente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turno Preferente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un turno" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="todos">Todos los turnos</SelectItem>
                            <SelectItem value="M">Mañana</SelectItem>
                            <SelectItem value="T">Tarde</SelectItem>
                            <SelectItem value="N">Noche</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="permitirHuecos"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 mt-1"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Permitir huecos en horarios</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex items-center gap-2">
                    <Play className="h-4 w-4" /> Generar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <div className="py-6">
              <div className="mb-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${progresoGeneracion}%` }}
                  ></div>
                </div>
                <p className="text-center mt-2">
                  Generando horario... {progresoGeneracion}%
                </p>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Esto puede tomar algunos minutos.</p>
                <p>Por favor, no cierre esta ventana.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Componente para la vista de calendario
const CalendarView = () => {
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const horasClase = [
    { id: 1, hora: "07:00 - 08:30" },
    { id: 2, hora: "08:45 - 10:15" },
    { id: 3, hora: "10:30 - 12:00" },
    { id: 4, hora: "12:15 - 13:45" },
    { id: 5, hora: "14:00 - 15:30" },
    { id: 6, hora: "15:45 - 17:15" },
    { id: 7, hora: "17:30 - 19:00" },
    { id: 8, hora: "19:15 - 20:45" },
  ];

  // Ejemplo de clases para mostrar en el calendario
  const clases = [
    { id: 1, diaSemana: 1, bloque: 2, curso: "Algoritmos", docente: "Juan Pérez", aula: "A101", color: "bg-blue-100" },
    { id: 2, diaSemana: 1, bloque: 3, curso: "Bases de Datos", docente: "María Gómez", aula: "B204", color: "bg-green-100" },
    { id: 3, diaSemana: 2, bloque: 1, curso: "Programación Web", docente: "Juan Pérez", aula: "A101", color: "bg-blue-100" },
    { id: 4, diaSemana: 3, bloque: 5, curso: "Matemáticas", docente: "Ana López", aula: "C305", color: "bg-yellow-100" },
    { id: 5, diaSemana: 4, bloque: 4, curso: "Inglés", docente: "Carlos Ruiz", aula: "D120", color: "bg-purple-100" },
    { id: 6, diaSemana: 5, bloque: 6, curso: "Redes", docente: "María Gómez", aula: "B205", color: "bg-green-100" },
  ];

  return (
    <div className="w-full min-w-max">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-muted/50 w-[120px]">Hora</th>
            {diasSemana.map((dia, index) => (
              <th key={index} className="border p-2 bg-muted/50 w-[180px]">{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horasClase.map((hora) => (
            <tr key={hora.id} className="h-24">
              <td className="border p-1 text-center text-sm bg-muted/20">{hora.hora}</td>
              {diasSemana.map((dia, diaIndex) => {
                const clase = clases.find(c => c.diaSemana === diaIndex + 1 && c.bloque === hora.id);
                return (
                  <td key={diaIndex} className="border p-1 align-top">
                    {clase ? (
                      <div className={`p-1 h-full rounded ${clase.color} border border-${clase.color.replace('bg-', 'border-')}`}>
                        <div className="font-medium">{clase.curso}</div>
                        <div className="text-xs mt-1">Prof: {clase.docente}</div>
                        <div className="text-xs mt-1">Aula: {clase.aula}</div>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeneradorHorarioPage;
