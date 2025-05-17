
import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CrudLayout } from '@/components/crud/CrudLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Curso {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  horasTeoricas: number;
  horasPracticas: number;
  descripcion: string;
}

// Esquema de validación
const cursoSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  codigo: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }),
  creditos: z.coerce.number().min(1, { message: 'Los créditos deben ser al menos 1' }),
  horasTeoricas: z.coerce.number().min(0, { message: 'Las horas teóricas no pueden ser negativas' }),
  horasPracticas: z.coerce.number().min(0, { message: 'Las horas prácticas no pueden ser negativas' }),
  descripcion: z.string().optional(),
});

type FormValues = z.infer<typeof cursoSchema>;

const CursoPage = () => {
  // Estado para los datos
  const [cursos, setCursos] = useState<Curso[]>([
    { 
      id: 1, 
      nombre: 'Algoritmos y Estructuras de Datos', 
      codigo: 'CS101', 
      creditos: 4, 
      horasTeoricas: 3, 
      horasPracticas: 2, 
      descripcion: 'Curso básico de algoritmos y estructuras de datos'
    },
    { 
      id: 2, 
      nombre: 'Bases de Datos', 
      codigo: 'CS202', 
      creditos: 3, 
      horasTeoricas: 2, 
      horasPracticas: 2, 
      descripcion: 'Curso sobre diseño e implementación de bases de datos'
    },
  ]);
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(cursoSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      creditos: 3,
      horasTeoricas: 2,
      horasPracticas: 2,
      descripcion: '',
    },
  });

  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      nombre: '',
      codigo: '',
      creditos: 3,
      horasTeoricas: 2,
      horasPracticas: 2,
      descripcion: '',
    });
    setShowForm(true);
  };

  const handleEdit = (item: Curso) => {
    setEditingId(item.id);
    form.reset({
      nombre: item.nombre,
      codigo: item.codigo,
      creditos: item.creditos,
      horasTeoricas: item.horasTeoricas,
      horasPracticas: item.horasPracticas,
      descripcion: item.descripcion || '',
    });
    setShowForm(true);
  };

  const handleDelete = (item: Curso) => {
    setCursos(cursos.filter(c => c.id !== item.id));
    toast.success(`Curso "${item.nombre}" eliminado`);
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      // Actualizar existente
      setCursos(cursos.map(item => 
        item.id === editingId ? { ...data, id: editingId } as Curso : item
      ));
      toast.success(`Curso actualizado`);
    } else {
      // Crear nuevo
      const newItem: Curso = {
        ...data,
        id: Math.max(0, ...cursos.map(c => c.id)) + 1,
      };
      setCursos([...cursos, newItem]);
      toast.success(`Nuevo curso creado`);
    }
    
    setShowForm(false);
    form.reset();
  };

  // Columnas para la tabla
  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Créditos', accessor: 'creditos' },
    { 
      header: 'Horas', 
      accessor: (item: Curso) => `T: ${item.horasTeoricas}, P: ${item.horasPracticas}` 
    },
  ];

  // Renderizado del formulario
  const renderForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del curso" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Código del curso" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="creditos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Créditos</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="horasTeoricas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas Teóricas</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="horasPracticas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas Prácticas</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción del curso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
      title="Cursos"
      subtitle="Gestiona los cursos de la institución"
      items={cursos}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={renderForm}
      showForm={showForm}
      icon={<BookOpen className="h-16 w-16 text-muted-foreground mb-4" />}
    />
  );
};

export default CursoPage;
