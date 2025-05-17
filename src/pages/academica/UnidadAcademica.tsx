
import React, { useState } from 'react';
import { Building2, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CrudLayout } from '@/components/crud/CrudLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface UnidadAcademica {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
}

// Esquema de validación
const unidadAcademicaSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  codigo: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }),
  descripcion: z.string().optional(),
});

type FormValues = z.infer<typeof unidadAcademicaSchema>;

const UnidadAcademicaPage = () => {
  // Estado para los datos
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([
    { id: 1, nombre: 'Facultad de Ingeniería', codigo: 'FI', descripcion: 'Facultad de ingeniería y ciencias' },
    { id: 2, nombre: 'Facultad de Economía', codigo: 'FE', descripcion: 'Facultad de economía y negocios' },
  ]);
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(unidadAcademicaSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      descripcion: '',
    },
  });

  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      nombre: '',
      codigo: '',
      descripcion: '',
    });
    setShowForm(true);
  };

  const handleEdit = (item: UnidadAcademica) => {
    setEditingId(item.id);
    form.reset({
      nombre: item.nombre,
      codigo: item.codigo,
      descripcion: item.descripcion || '',
    });
    setShowForm(true);
  };

  const handleDelete = (item: UnidadAcademica) => {
    setUnidadesAcademicas(unidadesAcademicas.filter(u => u.id !== item.id));
    toast.success(`Unidad académica "${item.nombre}" eliminada`);
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      // Actualizar existente
      setUnidadesAcademicas(unidadesAcademicas.map(item => 
        item.id === editingId ? { ...data, id: editingId } as UnidadAcademica : item
      ));
      toast.success(`Unidad académica actualizada`);
    } else {
      // Crear nuevo
      const newItem: UnidadAcademica = {
        ...data,
        id: Math.max(0, ...unidadesAcademicas.map(u => u.id)) + 1,
      };
      setUnidadesAcademicas([...unidadesAcademicas, newItem]);
      toast.success(`Nueva unidad académica creada`);
    }
    
    setShowForm(false);
    form.reset();
  };

  // Columnas para la tabla
  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
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
                  <Input placeholder="Nombre de la unidad académica" {...field} />
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
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Descripción (opcional)" {...field} />
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
      title="Unidades Académicas"
      subtitle="Gestiona las unidades académicas de la institución"
      items={unidadesAcademicas}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={renderForm}
      showForm={showForm}
      icon={<Building2 className="h-16 w-16 text-muted-foreground mb-4" />}
    />
  );
};

export default UnidadAcademicaPage;
