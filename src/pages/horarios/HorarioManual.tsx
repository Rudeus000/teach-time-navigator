import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// We need to fix the day type to match "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado"
type Day = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado";

interface HorarioClase {
  id: number;
  cursoId: number;
  curso: string;
  aulaId: number;
  aula: string;
  docenteId: number;
  docente: string;
  dia: Day;
  horaInicio: string;
  horaFin: string;
}

interface Curso {
  id: number;
  nombre: string;
}

interface Aula {
  id: number;
  nombre: string;
}

interface Docente {
  id: number;
  nombre: string;
}

// Esquema de validación
const horarioSchema = z.object({
  cursoId: z.string().min(1, { message: 'Debe seleccionar un curso' }),
  aulaId: z.string().min(1, { message: 'Debe seleccionar un aula' }),
  docenteId: z.string().min(1, { message: 'Debe seleccionar un docente' }),
  dia: z.string().min(1, { message: 'Debe seleccionar un día' }),
  horaInicio: z.string().min(5, { message: 'Hora de inicio inválida' }),
  horaFin: z.string().min(5, { message: 'Hora de fin inválida' }),
});

type FormValues = z.infer<typeof horarioSchema>;

const HorarioManualPage = () => {
  // Estado para los horarios
  const [horarios, setHorarios] = useState<HorarioClase[]>([
    { 
      id: 1, 
      cursoId: 1, 
      curso: 'Algoritmos y Estructuras de Datos', 
      aulaId: 1, 
      aula: 'Laboratorio de Computación 1', 
      docenteId: 1, 
      docente: 'Juan Pérez', 
      dia: "Lunes", 
      horaInicio: '08:00', 
      horaFin: '10:00' 
    },
    { 
      id: 2, 
      cursoId: 2, 
      curso: 'Bases de Datos', 
      aulaId: 2, 
      aula: 'Aula Teórica 101', 
      docenteId: 2, 
      docente: 'María Gómez', 
      dia: "Martes", 
      horaInicio: '10:00', 
      horaFin: '12:00' 
    },
  ]);

  // Estado para los cursos, aulas y docentes (simulados)
  const [cursos, setCursos] = useState<Curso[]>([
    { id: 1, nombre: 'Algoritmos y Estructuras de Datos' },
    { id: 2, nombre: 'Bases de Datos' },
    { id: 3, nombre: 'Ingeniería de Software' },
  ]);

  const [aulas, setAulas] = useState<Aula[]>([
    { id: 1, nombre: 'Laboratorio de Computación 1' },
    { id: 2, nombre: 'Aula Teórica 101' },
    { id: 3, nombre: 'Aula Magna' },
  ]);

  const [docentes, setDocentes] = useState<Docente[]>([
    { id: 1, nombre: 'Juan Pérez' },
    { id: 2, nombre: 'María Gómez' },
    { id: 3, nombre: 'Carlos Rodríguez' },
  ]);

  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("horarios");

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(horarioSchema),
    defaultValues: {
      cursoId: '',
      aulaId: '',
      docenteId: '',
      dia: '',
      horaInicio: '08:00',
      horaFin: '10:00',
    },
  });

  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      cursoId: '',
      aulaId: '',
      docenteId: '',
      dia: '',
      horaInicio: '08:00',
      horaFin: '10:00',
    });
    setShowForm(true);
  };

  const handleEdit = (item: HorarioClase) => {
    setEditingId(item.id);
    form.reset({
      cursoId: item.cursoId.toString(),
      aulaId: item.aulaId.toString(),
      docenteId: item.docenteId.toString(),
      dia: item.dia,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin,
    });
    setShowForm(true);
  };

  const handleDelete = (item: HorarioClase) => {
    setHorarios(horarios.filter(h => h.id !== item.id));
    toast.success(`Horario de clase eliminado`);
  };

  const handleAddHorario = (data: any) => {
    // Ensure the day is properly typed as Day
    const día: Day = data.dia as Day;

    const newHorario: HorarioClase = {
      id: Math.max(0, ...horarios.map(h => h.id)) + 1,
      cursoId: parseInt(data.cursoId),
      curso: cursos.find(c => c.id === parseInt(data.cursoId))?.nombre || '',
      aulaId: parseInt(data.aulaId),
      aula: aulas.find(a => a.id === parseInt(data.aulaId))?.nombre || '',
      docenteId: parseInt(data.docenteId),
      docente: docentes.find(d => d.id === parseInt(data.docenteId))?.nombre || '',
      dia: día,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
    };

    setHorarios([...horarios, newHorario]);
    toast.success(`Nuevo horario de clase creado`);
    setShowForm(false);
    form.reset();
  };

  const handleUpdateHorario = (data: any) => {
    if (editingId) {
      // Ensure the day is properly typed as Day
      const día: Day = data.dia as Day;

      setHorarios(horarios.map(item => 
        item.id === editingId ? { 
          id: editingId, 
          cursoId: parseInt(data.cursoId),
          curso: cursos.find(c => c.id === parseInt(data.cursoId))?.nombre || '',
          aulaId: parseInt(data.aulaId),
          aula: aulas.find(a => a.id === parseInt(data.aulaId))?.nombre || '',
          docenteId: parseInt(data.docenteId),
          docente: docentes.find(d => d.id === parseInt(data.docenteId))?.nombre || '',
          dia: día,
          horaInicio: data.horaInicio,
          horaFin: data.horaFin,
        } : item
      ));
      toast.success(`Horario de clase actualizado`);
    }
    setShowForm(false);
    form.reset();
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      handleUpdateHorario(data);
    } else {
      handleAddHorario(data);
    }
  };

  // Columnas para la tabla
  const columns = [
    { header: 'Curso', accessor: 'curso' },
    { header: 'Aula', accessor: 'aula' },
    { header: 'Docente', accessor: 'docente' },
    { header: 'Día', accessor: 'dia' },
    { header: 'Hora Inicio', accessor: 'horaInicio' },
    { header: 'Hora Fin', accessor: 'horaFin' },
  ];

  // Renderizado del formulario
  const renderForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cursoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Curso</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map(curso => (
                        <SelectItem key={curso.id} value={curso.id.toString()}>
                          {curso.nombre}
                        </SelectItem>
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
            name="aulaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aula</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un aula" />
                    </SelectTrigger>
                    <SelectContent>
                      {aulas.map(aula => (
                        <SelectItem key={aula.id} value={aula.id.toString()}>
                          {aula.nombre}
                        </SelectItem>
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
            name="docenteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Docente</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un docente" />
                    </SelectTrigger>
                    <SelectContent>
                      {docentes.map(docente => (
                        <SelectItem key={docente.id} value={docente.id.toString()}>
                          {docente.nombre}
                        </SelectItem>
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
            name="dia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Día</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un día" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lunes">Lunes</SelectItem>
                      <SelectItem value="Martes">Martes</SelectItem>
                      <SelectItem value="Miércoles">Miércoles</SelectItem>
                      <SelectItem value="Jueves">Jueves</SelectItem>
                      <SelectItem value="Viernes">Viernes</SelectItem>
                      <SelectItem value="Sábado">Sábado</SelectItem>
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
            name="horaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Inicio</FormLabel>
                <FormControl>
                  {/* You might want to use a time picker component here */}
                  <input 
                    type="time" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field} 
                  />
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
                  {/* You might want to use a time picker component here */}
                  <input 
                    type="time"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowForm(false)}
          >
            Cancelar
          </Button>
          <Button type="submit">
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div>
      <Tabs 
        defaultValue="horarios" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="horarios" disabled={false}>Horarios</TabsTrigger>
          </TabsList>

          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> 
            Agregar Horario
          </Button>
        </div>

        <TabsContent value="horarios">
          {/* Table to display horarios */}
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Clase</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableHead key={index}>{column.header}</TableHead>
                    ))}
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {horarios.map((horario) => (
                    <TableRow key={horario.id}>
                      {columns.map((column, index) => (
                        <TableCell key={index}>
                          {horario[column.accessor as keyof HorarioClase]}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(horario)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(horario)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showForm && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Horario' : 'Agregar Horario'}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderForm}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HorarioManualPage;
