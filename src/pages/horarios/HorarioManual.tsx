
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
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

const horasDisponibles = Array.from({ length: 32 }, (_, i) => {
  const hora = Math.floor(i / 2) + 7; // Empieza a las 7:00
  const minutos = i % 2 === 0 ? '00' : '30';
  return {
    id: `${hora.toString().padStart(2, '0')}:${minutos}`,
    label: `${hora}:${minutos}`
  };
});

const HorarioManualPage = () => {
  // Estado para los datos
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
  
  // Estado para controlar el formulario
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuración del formulario
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

  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      curso: '',
      docente: '',
      aula: '',
      dia: 'Lunes',
      horaInicio: '',
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingId) {
        // Actualizar existente
        setHorarios(horarios.map(item => 
          item.id === editingId ? { ...data, id: editingId } as Horario : item
        ));
        toast.success(`Horario actualizado`);
      } else {
        // Crear nuevo
        const newItem: Horario = {
          ...data as Horario, // This cast ensures all required fields are present
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

  // Datos de ejemplo para los selectores
  const cursos = ['Algoritmos y Estructuras de Datos', 'Bases de Datos', 'Programación Web', 'Inteligencia Artificial', 'Bases de Datos Avanzadas'];
  const docentes = ['Juan Pérez', 'María Gómez', 'Carlos López', 'Ana Rodríguez'];
  const aulas = ['A101', 'A102', 'L201', 'L202', 'T301'];

  // Group horarios por día para la vista de calendario
  const horariosPorDia: Record<string, Horario[]> = {};
  diasSemana.forEach(dia => {
    horariosPorDia[dia.id] = horarios.filter(h => h.dia === dia.id);
  });

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">Horarios Académicos</h2>
              <p className="text-muted-foreground">
                Gestiona los horarios de clases en formato calendario
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
        
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-6 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {diasSemana.map((dia, index) => (
            <motion.div 
              key={dia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="col-span-1"
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{dia.label}</CardTitle>
                  <CardDescription>
                    {horariosPorDia[dia.id]?.length || 0} {horariosPorDia[dia.id]?.length === 1 ? 'clase' : 'clases'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {horariosPorDia[dia.id] && horariosPorDia[dia.id].length > 0 ? (
                      horariosPorDia[dia.id].map(horario => (
                        <Card key={horario.id} className="p-3 border-l-4 border-l-primary bg-muted/30">
                          <div className="font-medium text-sm">{horario.curso}</div>
                          <div className="text-xs text-muted-foreground flex justify-between mt-1">
                            <span>{horario.horaInicio} - {horario.horaFin}</span>
                            <span>Grupo {horario.grupo}</span>
                          </div>
                          <div className="text-xs mt-1">{horario.docente}</div>
                          <div className="text-xs text-muted-foreground mt-1">Aula {horario.aula}</div>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0" 
                              onClick={() => handleEdit(horario)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10" 
                              onClick={() => handleDelete(horario)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                              </svg>
                            </Button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
                        <CalendarIcon className="h-8 w-8 mb-2" />
                        <p className="text-sm">No hay clases programadas</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HorarioManualPage;
