
import React, { useState } from 'react';
import { Award } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CrudLayout } from '@/components/crud/CrudLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Especialidad {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  area: string;
}

// Esquema de validación
const especialidadSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  codigo: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }),
  descripcion: z.string().optional(),
  area: z.string().min(2, { message: 'El área debe tener al menos 2 caracteres' }),
});

type FormValues = z.infer<typeof especialidadSchema>;

const EspecialidadPage = () => {
  // Estado para los datos
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([
    { 
      id: 1, 
      nombre: 'Programación Web', 
      codigo: 'PW', 
      descripcion: 'Especialidad en desarrollo de aplicaciones web', 
      area: 'Informática'
    },
    { 
      id: 2, 
      nombre: 'Inteligencia Artificial', 
      codigo: 'IA', 
      descripcion: 'Especialidad en sistemas inteligentes y ML', 
      area: 'Informática'
    },
    { 
      id: 3, 
      nombre: 'Matemática Aplicada', 
      codigo: 'MA', 
      descripcion: 'Especialidad en aplicación de las matemáticas', 
      area: 'Ciencias'
    },
  ]);
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(especialidadSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      descripcion: '',
      area: '',
    },
  });

  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      nombre: '',
      codigo: '',
      descripcion: '',
      area: '',
    });
    setShowForm(true);
  };

  const handleEdit = (item: Especialidad) => {
    setEditingId(item.id);
    form.reset({
      nombre: item.nombre,
      codigo: item.codigo,
      descripcion: item.descripcion || '',
      area: item.area,
    });
    setShowForm(true);
  };

  const handleDelete = (item: Especialidad) => {
    setEspecialidades(especialidades.filter(e => e.id !== item.id));
    toast.success(`Especialidad "${item.nombre}" eliminada`);
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      // Actualizar existente
      setEspecialidades(especialidades.map(item => 
        item.id === editingId ? { ...data, id: editingId } as Especialidad : item
      ));
      toast.success(`Especialidad actualizada`);
    } else {
      // Crear nuevo
      const newItem: Especialidad = {
        ...data,
        id: Math.max(0, ...especialidades.map(e => e.id)) + 1,
      };
      setEspecialidades([...especialidades, newItem]);
      toast.success(`Nueva especialidad creada`);
    }
    
    setShowForm(false);
    form.reset();
  };

  // Columnas para la tabla
  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Área', accessor: 'area' },
    { header: 'Descripción', accessor: 'descripcion' },
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
                  <Input placeholder="Nombre de la especialidad" {...field} />
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
                  <Input placeholder="Código (abreviatura)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área</FormLabel>
              <FormControl>
                <Input placeholder="Área de la especialidad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción de la especialidad" {...field} />
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
      title="Especialidades"
      subtitle="Gestiona las especialidades de los docentes"
      items={especialidades}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={renderForm}
      showForm={showForm}
      icon={<Award className="h-16 w-16 text-muted-foreground mb-4" />}
    />
  );
};

export default EspecialidadPage;
