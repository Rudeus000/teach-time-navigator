
import React, { useState } from 'react';
import { Calendar, CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Definir tipos
interface Horario {
  id: number;
  curso: string;
  docente: string;
  aula: string;
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  horaInicio: string;
  horaFin: string;
  grupo: string;
}

// Esquema de validación
const horarioSchema = z.object({
  id: z.number().optional(),
  curso: z.string().min(3, { message: 'Debe seleccionar un curso' }),
  docente: z.string().min(3, { message: 'Debe seleccionar un docente' }),
  aula: z.string().min(2, { message: 'Debe seleccionar un aula' }),
  dia: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']),
  horaInicio: z.string().min(5, { message: 'Debe especificar la hora de inicio' }),
  horaFin: z.string().min(5, { message: 'Debe especificar la hora de fin' }),
  grupo: z.string().min(1, { message: 'Debe especificar el grupo' }),
});

type FormValues = z.infer<typeof horarioSchema>;

const diasSemana = [
  { id: 'Lunes', label: 'Lunes' },
  { id: 'Martes', label: 'Martes' },
  { id: 'Miércoles', label: 'Miércoles' },
  { id: 'Jueves', label: 'Jueves' },
  { id: 'Viernes', label: 'Viernes' },
  { id: 'Sábado', label: 'Sábado' },
];

// Generate hours from 7:00 to 22:00 in 30-minute intervals
const horasDisponibles = Array.from({ length: 32 }, (_, i) => {
  const hora = Math.floor(i / 2) + 7; // Starts at 7:00
  const minutos = i % 2 === 0 ? '00' : '30';
  return {
    id: `${hora.toString().padStart(2, '0')}:${minutos}`,
    label: `${hora}:${minutos}`
  };
});

// Generate time slots for the calendar
const timeSlots = Array.from({ length: 30 }, (_, i) => {
  const hora = Math.floor(i / 2) + 7; // Starts at 7:00
  const minutos = i % 2 === 0 ? '00' : '30';
  return `${hora.toString().padStart(2, '0')}:${minutos}`;
});

const HorarioManualPage = () => {
  // State for data
  const [horarios, setHorarios] = useState<Horario[]>([
    { 
      id: 1, 
      curso: 'Algoritmos y Estructuras de Datos', 
      docente: 'Juan Pérez', 
      aula: 'A101', 
      dia: 'Lunes', 
      horaInicio: '08:00',
      horaFin: '10:00',
      grupo: 'A'
    },
    { 
      id: 2, 
      curso: 'Bases de Datos', 
      docente: 'María Gómez', 
      aula: 'L201', 
      dia: 'Miércoles', 
      horaInicio: '10:00',
      horaFin: '12:00',
      grupo: 'B'
    },
    { 
      id: 3, 
      curso: 'Programación Web', 
      docente: 'Carlos López', 
      aula: 'A102', 
      dia: 'Martes', 
      horaInicio: '14:00',
      horaFin: '16:00',
      grupo: 'A'
    },
    { 
      id: 4, 
      curso: 'Inteligencia Artificial', 
      docente: 'Ana Rodríguez', 
      aula: 'L202', 
      dia: 'Jueves', 
      horaInicio: '16:00',
      horaFin: '18:00',
      grupo: 'C'
    },
    { 
      id: 5, 
      curso: 'Bases de Datos Avanzadas', 
      docente: 'María Gómez', 
      aula: 'T301', 
      dia: 'Viernes', 
      horaInicio: '08:00',
      horaFin: '10:00',
      grupo: 'D'
    },
  ]);
  
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(horarioSchema),
    defaultValues: {
      curso: '',
      docente: '',
      aula: '',
      dia: 'Lunes',
      horaInicio: '',
      horaFin: '',
      grupo: '',
    },
  });
  
  // Handlers
  const handleAdd = (dia: string = 'Lunes', horaInicio: string = '08:00') => {
    setEditingId(null);
    form.reset({
      curso: '',
      docente: '',
      aula: '',
      dia,
      horaInicio,
      horaFin: '',
      grupo: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Horario) => {
    setEditingId(item.id);
    form.reset({
      curso: item.curso,
      docente: item.docente,
      aula: item.aula,
      dia: item.dia,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin,
      grupo: item.grupo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Horario) => {
    setHorarios(horarios.filter(h => h.id !== item.id));
    toast.success(`Horario eliminado`);
  };

  const handleCellClick = (dia: string, hora: string) => {
    setSelectedDay(dia);
    setSelectedTime(hora);
    handleAdd(dia, hora);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingId) {
        // Update existing
        setHorarios(horarios.map(item => 
          item.id === editingId ? { ...data, id: editingId } as Horario : item
        ));
        toast.success(`Horario actualizado`);
      } else {
        // Create new
        const newItem: Horario = {
          ...data as Horario,
          id: Math.max(0, ...horarios.map(h => h.id)) + 1,
        };
        setHorarios([...horarios, newItem]);
        toast.success(`Nuevo horario creado`);
      }
      
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error('Error al guardar el horario');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample data for form selects
  const cursos = ['Algoritmos y Estructuras de Datos', 'Bases de Datos', 'Programación Web', 'Inteligencia Artificial', 'Bases de Datos Avanzadas'];
  const docentes = ['Juan Pérez', 'María Gómez', 'Carlos López', 'Ana Rodríguez'];
  const aulas = ['A101', 'A102', 'L201', 'L202', 'T301'];

  // Calculate the position and height of each class block
  const getClassBlockStyle = (horario: Horario) => {
    const startIndex = timeSlots.findIndex(time => time === horario.horaInicio);
    const endIndex = timeSlots.findIndex(time => time === horario.horaFin);
    
    if (startIndex === -1 || endIndex === -1) return {};
    
    const height = (endIndex - startIndex) * 48; // 48px per 30-minute slot
    const top = startIndex * 48;
    
    return {
      height: `${height}px`,
      top: `${top}px`,
    };
  };

  // Get a nice color based on the course name (for visual separation)
  const getClassColor = (curso: string) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-pink-100 border-pink-300 text-pink-800',
    ];
    
    // Simple hash function to consistently assign colors
    let hash = 0;
    for (let i = 0; i < curso.length; i++) {
      hash = curso.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Horarios Académicos</h2>
              <p className="text-muted-foreground">
                Gestiona los horarios de clases en formato calendario
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleAdd()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Horario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar' : 'Nuevo'} Horario</DialogTitle>
                  <DialogDescription>
                    Complete la información del horario académico
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="curso"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Curso</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un curso" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cursos.map(curso => (
                                    <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="docente"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Docente</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un docente" />
                                </SelectTrigger>
                                <SelectContent>
                                  {docentes.map(docente => (
                                    <SelectItem key={docente} value={docente}>{docente}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="dia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Día</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {diasSemana.map(dia => (
                                    <SelectItem key={dia.id} value={dia.id}>{dia.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="horaInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora Inicio</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Hora inicio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {horasDisponibles.map(hora => (
                                    <SelectItem key={hora.id} value={hora.id}>{hora.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="horaFin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora Fin</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Hora fin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {horasDisponibles
                                    .filter(hora => hora.id > form.getValues("horaInicio"))
                                    .map(hora => (
                                      <SelectItem key={hora.id} value={hora.id}>{hora.label}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="aula"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aula</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un aula" />
                                </SelectTrigger>
                                <SelectContent>
                                  {aulas.map(aula => (
                                    <SelectItem key={aula} value={aula}>{aula}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="grupo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grupo</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: A, B, C..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={form.handleSubmit(onSubmit)} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
        
        <Card>
          <CardContent className="p-4">
            {/* Calendar header */}
            <div className="grid grid-cols-7 mb-2">
              <div className="col-span-1 text-center font-medium text-muted-foreground">Hora</div>
              {diasSemana.map(dia => (
                <div key={dia.id} className="col-span-1 text-center font-medium">{dia.label}</div>
              ))}
            </div>

            {/* Calendar body */}
            <div className="grid grid-cols-7 border rounded-md overflow-hidden">
              {/* Time slots column */}
              <div className="col-span-1 bg-muted/30">
                {timeSlots.map((time, index) => (
                  <div 
                    key={`time-${index}`} 
                    className={`h-12 border-b flex items-center justify-center px-2 text-sm ${index % 2 === 0 ? 'bg-muted/10' : ''}`}
                  >
                    <span className="text-muted-foreground">{time}</span>
                  </div>
                ))}
              </div>

              {/* Days columns */}
              {diasSemana.map(dia => (
                <div key={`col-${dia.id}`} className="col-span-1 relative border-l">
                  {/* Time slots for this day */}
                  {timeSlots.map((time, index) => (
                    <div 
                      key={`slot-${dia.id}-${index}`}
                      className={`h-12 border-b ${index % 2 === 0 ? 'bg-muted/10' : ''} hover:bg-muted/20 cursor-pointer`}
                      onClick={() => handleCellClick(dia.id, time)}
                    ></div>
                  ))}

                  {/* Class blocks */}
                  {horarios
                    .filter(h => h.dia === dia.id)
                    .map(horario => (
                      <div
                        key={`class-${horario.id}`}
                        className={`absolute left-0 right-0 rounded border-l-4 p-1 mx-1 overflow-hidden ${getClassColor(horario.curso)}`}
                        style={getClassBlockStyle(horario)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs font-bold truncate">{horario.curso}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full p-0 hover:bg-background/20"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleDelete(horario);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{horario.horaInicio} - {horario.horaFin}</span>
                        </div>
                        <div className="text-xs">Aula: {horario.aula}</div>
                        <div className="text-xs truncate">Prof: {horario.docente}</div>
                        <div className="text-xs">Grupo: {horario.grupo}</div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs p-0 h-6 mt-1 hover:bg-background/20 w-full text-left"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleEdit(horario);
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HorarioManualPage;
