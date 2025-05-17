
import React, { useState } from 'react';
import { School } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CrudLayout } from '@/components/crud/CrudLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface Aula {
  id: number;
  codigo: string;
  nombre: string;
  capacidad: number;
  edificio: string;
  piso: number;
  tipo: 'Laboratorio' | 'Teoría' | 'Taller';
}

// Esquema de validación
const aulaSchema = z.object({
  id: z.number().optional(),
  codigo: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }),
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  capacidad: z.coerce.number().min(1, { message: 'La capacidad debe ser al menos 1' }),
  edificio: z.string().min(1, { message: 'Debe especificar un edificio' }),
  piso: z.coerce.number().min(0, { message: 'El piso debe ser 0 o superior' }),
  tipo: z.enum(['Laboratorio', 'Teoría', 'Taller']),
});

type FormValues = z.infer<typeof aulaSchema>;

const AulaPage = () => {
  // Estado para los datos
  const [aulas, setAulas] = useState<Aula[]>([
    { 
      id: 1, 
      codigo: 'A101', 
      nombre: 'Aula 101', 
      capacidad: 30, 
      edificio: 'Edificio A', 
      piso: 1,
      tipo: 'Teoría'
    },
    { 
      id: 2, 
      codigo: 'L201', 
      nombre: 'Laboratorio de Computación', 
      capacidad: 25, 
      edificio: 'Edificio B', 
      piso: 2,
      tipo: 'Laboratorio'
    },
    { 
      id: 3, 
      codigo: 'T301', 
      nombre: 'Taller de Electrónica', 
      capacidad: 20, 
      edificio: 'Edificio C', 
      piso: 3,
      tipo: 'Taller'
    },
  ]);
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(aulaSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      capacidad: 30,
      edificio: '',
      piso: 1,
      tipo: 'Teoría',
    },
  });

  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      codigo: '',
      nombre: '',
      capacidad: 30,
      edificio: '',
      piso: 1,
      tipo: 'Teoría',
    });
    setShowForm(true);
  };

  const handleEdit = (item: Aula) => {
    setEditingId(item.id);
    form.reset({
      codigo: item.codigo,
      nombre: item.nombre,
      capacidad: item.capacidad,
      edificio: item.edificio,
      piso: item.piso,
      tipo: item.tipo,
    });
    setShowForm(true);
  };

  const handleDelete = (item: Aula) => {
    setAulas(aulas.filter(a => a.id !== item.id));
    toast.success(`Aula "${item.nombre}" eliminada`);
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      // Actualizar existente
      setAulas(aulas.map(item => 
        item.id === editingId ? { ...data, id: editingId } as Aula : item
      ));
      toast.success(`Aula actualizada`);
    } else {
      // Crear nuevo
      const newItem: Aula = {
        ...data,
        id: Math.max(0, ...aulas.map(a => a.id)) + 1,
      };
      setAulas([...aulas, newItem]);
      toast.success(`Nueva aula creada`);
    }
    
    setShowForm(false);
    form.reset();
  };

  // Columnas para la tabla
  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Capacidad', accessor: 'capacidad' },
    { 
      header: 'Ubicación', 
      accessor: (item: Aula) => `${item.edificio}, Piso ${item.piso}` 
    },
    { header: 'Tipo', accessor: 'tipo' },
  ];

  // Renderizado del formulario
  const renderForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Código del aula" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del aula" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="capacidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="edificio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edificio</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del edificio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="piso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Piso</FormLabel>
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
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="Teoría">Teoría</option>
                  <option value="Laboratorio">Laboratorio</option>
                  <option value="Taller">Taller</option>
                </select>
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
      title="Aulas"
      subtitle="Gestiona las aulas de la institución"
      items={aulas}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={renderForm}
      showForm={showForm}
      icon={<School className="h-16 w-16 text-muted-foreground mb-4" />}
    />
  );
};

export default AulaPage;
