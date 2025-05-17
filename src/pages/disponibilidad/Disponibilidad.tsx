
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, Trash2, Clock } from 'lucide-react';
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

const diasSemana = [
  { id: 'LUNES', label: 'Lunes' },
  { id: 'MARTES', label: 'Martes' },
  { id: 'MIÉRCOLES', label: 'Miércoles' },
  { id: 'JUEVES', label: 'Jueves' },
  { id: 'VIERNES', label: 'Viernes' },
  { id: 'SÁBADO', label: 'Sábado' },
];

const horasDisponibles = Array.from({ length: 32 }, (_, i) => {
  const hora = Math.floor(i / 2) + 7; // Empieza a las 7:00
  const minutos = i % 2 === 0 ? '00' : '30';
  return {
    id: `${hora.toString().padStart(2, '0')}:${minutos}`,
    label: `${hora}:${minutos}`
  };
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
      
      // Add new disponibilidad - Fixed the type error by ensuring all properties are required
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
  
  // Group disponibilidades by day for better organization
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
        
        <div className="flex justify-end">
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
                {/* Dialog content same as above */}
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
      </div>
    </div>
  );
};

export default DisponibilidadPage;
