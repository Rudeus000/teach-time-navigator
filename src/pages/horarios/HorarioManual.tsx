
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CrudLayout } from '@/components/crud/CrudLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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
  ]);
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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
    setShowForm(true);
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
    setShowForm(true);
  };

  const handleDelete = (item: Horario) => {
    setHorarios(horarios.filter(h => h.id !== item.id));
    toast.success(`Horario eliminado`);
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      // Actualizar existente
      setHorarios(horarios.map(item => 
        item.id === editingId ? { ...data, id: editingId } as Horario : item
      ));
      toast.success(`Horario actualizado`);
    } else {
      // Crear nuevo
      const newItem: Horario = {
        ...data,
        id: Math.max(0, ...horarios.map(h => h.id)) + 1,
      };
      setHorarios([...horarios, newItem]);
      toast.success(`Nuevo horario creado`);
    }
    
    setShowForm(false);
    form.reset();
  };

  // Columnas para la tabla
  const columns = [
    { header: 'Curso', accessor: 'curso' },
    { header: 'Docente', accessor: 'docente' },
    { 
      header: 'Horario', 
      accessor: (item: Horario) => `${item.dia}, ${item.horaInicio} - ${item.horaFin}` 
    },
    { header: 'Aula', accessor: 'aula' },
    { header: 'Grupo', accessor: 'grupo' },
  ];

  // Datos de ejemplo para los selectores
  const cursos = ['Algoritmos y Estructuras de Datos', 'Bases de Datos', 'Programación Web', 'Inteligencia Artificial'];
  const docentes = ['Juan Pérez', 'María Gómez', 'Carlos López', 'Ana Rodríguez'];
  const aulas = ['A101', 'A102', 'L201', 'L202', 'T301'];
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Renderizado del formulario
  const renderForm = (
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
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="">Seleccione un curso</option>
                    {cursos.map(curso => (
                      <option key={curso} value={curso}>{curso}</option>
                    ))}
                  </select>
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
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="">Seleccione un docente</option>
                    {docentes.map(docente => (
                      <option key={docente} value={docente}>{docente}</option>
                    ))}
                  </select>
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
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    {dias.map(dia => (
                      <option key={dia} value={dia}>{dia}</option>
                    ))}
                  </select>
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
                  <Input type="time" {...field} />
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
                  <Input type="time" {...field} />
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
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="">Seleccione un aula</option>
                    {aulas.map(aula => (
                      <option key={aula} value={aula}>{aula}</option>
                    ))}
                  </select>
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
    <CrudLayout
      title="Horarios"
      subtitle="Crea y gestiona horarios de forma manual"
      items={horarios}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={renderForm}
      showForm={showForm}
      icon={<Calendar className="h-16 w-16 text-muted-foreground mb-4" />}
    />
  );
};

export default HorarioManualPage;
