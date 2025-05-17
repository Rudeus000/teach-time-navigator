
import React, { useState } from 'react';
import { CalendarClock, Play, Settings } from 'lucide-react';
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

interface HorarioGenerado {
  id: number;
  nombre: string;
  fechaCreacion: string;
  estadoGeneracion: 'Completo' | 'Parcial' | 'Con Conflictos';
  conflictos: number;
  cursos: number;
  docentes: number;
  aulas: number;
}

// Esquema de validación para el formulario
const generadorSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  periodoAcademico: z.string().min(3, { message: 'Debe especificar el período académico' }),
  prioridadDocente: z.coerce.number().min(1).max(5),
  prioridadAula: z.coerce.number().min(1).max(5),
  maximoHorasDiarias: z.coerce.number().min(1).max(12),
  permitirHuecos: z.boolean().default(false),
});

type FormValues = z.infer<typeof generadorSchema>;

const GeneradorHorarioPage = () => {
  // Estados
  const [horarios, setHorarios] = useState<HorarioGenerado[]>([
    {
      id: 1,
      nombre: 'Horario 2023-I Ingeniería',
      fechaCreacion: '2023-02-15',
      estadoGeneracion: 'Completo',
      conflictos: 0,
      cursos: 45,
      docentes: 15,
      aulas: 12
    },
    {
      id: 2,
      nombre: 'Horario 2023-II Economía',
      fechaCreacion: '2023-07-20',
      estadoGeneracion: 'Parcial',
      conflictos: 3,
      cursos: 30,
      docentes: 10,
      aulas: 8
    }
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [progresoGeneracion, setProgresoGeneracion] = useState(0);
  
  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(generadorSchema),
    defaultValues: {
      nombre: '',
      periodoAcademico: '',
      prioridadDocente: 3,
      prioridadAula: 2,
      maximoHorasDiarias: 8,
      permitirHuecos: false,
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
  };

  // Función para finalizar la generación
  const finalizarGeneracion = (data: FormValues) => {
    setTimeout(() => {
      // Crear nuevo horario
      const nuevoHorario: HorarioGenerado = {
        id: Math.max(0, ...horarios.map(h => h.id)) + 1,
        nombre: data.nombre,
        fechaCreacion: new Date().toISOString().split('T')[0],
        estadoGeneracion: Math.random() > 0.7 ? 'Con Conflictos' : 'Completo',
        conflictos: Math.floor(Math.random() * 5),
        cursos: Math.floor(Math.random() * 30) + 20,
        docentes: Math.floor(Math.random() * 10) + 5,
        aulas: Math.floor(Math.random() * 8) + 5
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
    setHorarios(horarios.filter(h => h.id !== id));
    toast.success('Horario eliminado');
  };

  // Función para abrir el diálogo
  const abrirDialogo = () => {
    setDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto"
    >
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
                  <Button variant="outline" size="sm">
                    Ver Detalle
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
                  name="periodoAcademico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período Académico</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 2023-I, 2023-II" {...field} />
                      </FormControl>
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

export default GeneradorHorarioPage;
