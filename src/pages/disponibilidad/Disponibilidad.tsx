
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, Trash2, Clock, Check } from 'lucide-react';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const diasSemana = [
  { id: 'LUNES', label: 'Lunes' },
  { id: 'MARTES', label: 'Martes' },
  { id: 'MIÉRCOLES', label: 'Miércoles' },
  { id: 'JUEVES', label: 'Jueves' },
  { id: 'VIERNES', label: 'Viernes' },
  { id: 'SÁBADO', label: 'Sábado' },
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

interface DisponibilidadItem {
  id: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

const formSchema = z.object({
  diaSemana: z.string().min(1, 'Seleccione un día'),
  horaInicio: z.string().min(1, 'Seleccione hora de inicio'),
  horaFin: z.string().min(1, 'Seleccione hora de fin'),
}).refine(data => {
  const inicio = data.horaInicio;
  const fin = data.horaFin;
  return inicio < fin;
}, {
  message: "La hora de fin debe ser posterior a la hora de inicio",
  path: ["horaFin"],
});

type FormData = z.infer<typeof formSchema>;

const DisponibilidadPage = () => {
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadItem[]>([
    { id: '1', diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '10:00' },
    { id: '2', diaSemana: 'LUNES', horaInicio: '14:00', horaFin: '16:00' },
    { id: '3', diaSemana: 'MIÉRCOLES', horaInicio: '09:00', horaFin: '12:00' },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('lista');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({});
  const [selectedDay, setSelectedDay] = useState<string>('LUNES');
  
  // Configurar formulario
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diaSemana: '',
      horaInicio: '',
      horaFin: '',
    },
  });
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new disponibilidad
      const newDisponibilidad: DisponibilidadItem = {
        id: Math.random().toString(36).substr(2, 9),
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin
      };
      
      setDisponibilidades(prev => [...prev, newDisponibilidad]);
      toast.success('Disponibilidad agregada correctamente');
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al agregar disponibilidad');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDisponibilidades(prev => prev.filter(item => item.id !== id));
      toast.success('Disponibilidad eliminada');
    } catch (error) {
      toast.error('Error al eliminar disponibilidad');
    }
  };
  
  // Process slots for calendar view
  const toggleTimeSlot = (day: string, time: string) => {
    const slotKey = `${day}-${time}`;
    setSelectedSlots(prev => ({ 
      ...prev, 
      [slotKey]: !prev[slotKey] 
    }));
  };

  // Check if a slot is selected
  const isSlotSelected = (day: string, time: string) => {
    return !!selectedSlots[`${day}-${time}`];
  };

  // Check if a slot is part of an existing disponibilidad
  const isSlotOccupied = (day: string, time: string) => {
    return disponibilidades.some(disp => 
      disp.diaSemana === day && 
      disp.horaInicio <= time && 
      disp.horaFin > time
    );
  };

  // Save the selected time slots
  const saveSelectedSlots = () => {
    // Group consecutive selected slots
    const slots: Record<string, string[]> = {};
    
    // Organize selected slots by day
    Object.keys(selectedSlots).forEach(key => {
      if (selectedSlots[key]) {
        const [day, time] = key.split('-');
        if (!slots[day]) slots[day] = [];
        slots[day].push(time);
      }
    });
    
    // Process each day's selected slots
    Object.entries(slots).forEach(([day, times]) => {
      // Sort times
      times.sort();
      
      // Group consecutive time slots
      let startTime = times[0];
      let currentTime = startTime;
      
      for (let i = 1; i <= times.length; i++) {
        // Get the next expected time (30 min later)
        const nextExpectedTime = getNextTimeSlot(currentTime);
        
        // If we're at the end of the array or there's a gap
        if (i === times.length || nextExpectedTime !== times[i]) {
          // Add the disponibilidad block
          const newDisponibilidad: DisponibilidadItem = {
            id: Math.random().toString(36).substr(2, 9),
            diaSemana: day,
            horaInicio: startTime,
            horaFin: getNextTimeSlot(currentTime),
          };
          
          setDisponibilidades(prev => [...prev, newDisponibilidad]);
          
          // If not at the end, start a new group
          if (i < times.length) {
            startTime = times[i];
            currentTime = startTime;
          }
        } else {
          currentTime = times[i];
        }
      }
    });
    
    // Clear selection
    setSelectedSlots({});
    toast.success('Disponibilidad guardada correctamente');
  };

  // Get the next 30-min time slot
  const getNextTimeSlot = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    
    if (minutes === 30) {
      return `${(hours + 1).toString().padStart(2, '0')}:00`;
    }
    return `${hours.toString().padStart(2, '0')}:30`;
  };
  
  // Group disponibilidades by day for list view
  const disponibilidadesPorDia: Record<string, DisponibilidadItem[]> = {};
  disponibilidades.forEach(disp => {
    if (!disponibilidadesPorDia[disp.diaSemana]) {
      disponibilidadesPorDia[disp.diaSemana] = [];
    }
    disponibilidadesPorDia[disp.diaSemana].push(disp);
  });
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-2">Mi Disponibilidad</h2>
          <p className="text-muted-foreground">
            Administra tus horas disponibles para facilitar la programación de clases
          </p>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="lista">Vista de Lista</TabsTrigger>
            <TabsTrigger value="calendario">Selección en Calendario</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista" className="mt-4">
            <div className="flex justify-end mb-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Disponibilidad
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nueva Disponibilidad</DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo bloque de disponibilidad horaria
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="diaSemana"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Día de la semana</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un día" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {diasSemana.map(dia => (
                                  <SelectItem key={dia.id} value={dia.id}>
                                    {dia.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="horaInicio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora de inicio</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Hora inicio" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {horasDisponibles.map(hora => (
                                    <SelectItem key={hora.id} value={hora.id}>
                                      {hora.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="horaFin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora de fin</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Hora fin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {horasDisponibles.map(hora => (
                                    <SelectItem key={hora.id} value={hora.id}>
                                      {hora.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                      type="submit" 
                      onClick={form.handleSubmit(onSubmit)} 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {Object.keys(disponibilidadesPorDia).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No hay disponibilidad registrada</p>
                  <p className="text-muted-foreground text-center mb-4">
                    Agrega tus horarios disponibles para que el sistema pueda asignarte clases
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Disponibilidad
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {Object.entries(disponibilidadesPorDia).map(([dia, disponibilidadesDia], index) => (
                  <motion.div 
                    key={dia}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {diasSemana.find(d => d.id === dia)?.label}
                        </CardTitle>
                        <CardDescription>
                          {disponibilidadesDia.length} {disponibilidadesDia.length === 1 ? 'bloque' : 'bloques'} disponibles
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {disponibilidadesDia.map(disp => (
                            <li 
                              key={disp.id}
                              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                            >
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {disp.horaInicio} - {disp.horaFin}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(disp.id)}
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="calendario" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Seleccionar Disponibilidad</CardTitle>
                  <div className="flex items-center gap-4">
                    <Select
                      value={selectedDay}
                      onValueChange={setSelectedDay}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecciona un día" />
                      </SelectTrigger>
                      <SelectContent>
                        {diasSemana.map(dia => (
                          <SelectItem key={dia.id} value={dia.id}>{dia.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={saveSelectedSlots}
                      disabled={Object.values(selectedSlots).filter(Boolean).length === 0}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Guardar Selección
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Haga clic en las celdas de tiempo para marcar su disponibilidad
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex">
                    {/* Time slots column */}
                    <div className="w-[100px] mr-2">
                      {timeSlots.map((time, index) => (
                        <div 
                          key={`time-${index}`} 
                          className={`h-12 border-b flex items-center justify-center px-2 text-sm ${index % 2 === 0 ? 'bg-muted/10' : ''}`}
                        >
                          <span className="text-muted-foreground">{time}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Day slots */}
                    <div className="flex-1 relative border rounded-md overflow-hidden">
                      <div className="bg-muted/30 px-4 py-2 text-center font-medium border-b">
                        {diasSemana.find(d => d.id === selectedDay)?.label}
                      </div>
                      
                      {/* Time slots */}
                      {timeSlots.map((time, index) => {
                        const isOccupied = isSlotOccupied(selectedDay, time);
                        const isSelected = isSlotSelected(selectedDay, time);
                        
                        return (
                          <div 
                            key={`slot-${selectedDay}-${index}`}
                            className={`h-12 border-b ${index % 2 === 0 ? 'bg-muted/10' : ''} 
                              ${isSelected ? 'bg-primary/20' : ''} 
                              ${isOccupied ? 'bg-green-100/70 cursor-not-allowed' : 'hover:bg-primary/10 cursor-pointer'}`}
                            onClick={() => !isOccupied && toggleTimeSlot(selectedDay, time)}
                          >
                            {isSelected && (
                              <div className="h-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            {isOccupied && (
                              <div className="h-full flex items-center justify-center">
                                <span className="text-xs text-green-700">Ya disponible</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary/20 mr-2 rounded"></div>
                    <span>Seleccionado</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100/70 mr-2 rounded"></div>
                    <span>Ya disponible</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DisponibilidadPage;
