
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CrudLayout } from '@/components/crud/CrudLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface Docente {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  especialidad: string;
  estado: 'Activo' | 'Inactivo';
}

// Esquema de validación
const docenteSchema = z.object({
  id: z.number().optional(),
  nombres: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  apellidos: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  telefono: z.string().min(5, { message: 'Teléfono inválido' }),
  especialidad: z.string(),
  estado: z.enum(['Activo', 'Inactivo']),
});

type FormValues = z.infer<typeof docenteSchema>;

const DocentePage = () => {
  // Estado para los datos
  const [docentes, setDocentes] = useState<Docente[]>([
    { 
      id: 1, 
      nombres: 'Juan Carlos', 
      apellidos: 'Pérez López', 
      email: 'jperez@ejemplo.com', 
      telefono: '555-1234', 
      especialidad: 'Programación',
      estado: 'Activo'
    },
    { 
      id: 2, 
      nombres: 'María Elena', 
      apellidos: 'Gómez Rodríguez', 
      email: 'mgomez@ejemplo.com', 
      telefono: '555-5678', 
      especialidad: 'Matemáticas',
      estado: 'Activo'
    },
  ]);
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(docenteSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      especialidad: '',
      estado: 'Activo',
    },
  });

  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      especialidad: '',
      estado: 'Activo',
    });
    setShowForm(true);
  };

  const handleEdit = (item: Docente) => {
    setEditingId(item.id);
    form.reset({
      nombres: item.nombres,
      apellidos: item.apellidos,
      email: item.email,
      telefono: item.telefono,
      especialidad: item.especialidad,
      estado: item.estado,
    });
    setShowForm(true);
  };

  const handleDelete = (item: Docente) => {
    setDocentes(docentes.filter(d => d.id !== item.id));
    toast.success(`Docente "${item.nombres} ${item.apellidos}" eliminado`);
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      // Actualizar existente
      setDocentes(docentes.map(item => 
        item.id === editingId ? { ...data, id: editingId } as Docente : item
      ));
      toast.success(`Docente actualizado`);
    } else {
      // Crear nuevo
      const newItem: Docente = {
        ...data,
        id: Math.max(0, ...docentes.map(d => d.id)) + 1,
      };
      setDocentes([...docentes, newItem]);
      toast.success(`Nuevo docente creado`);
    }
    
    setShowForm(false);
    form.reset();
  };

  // Columnas para la tabla
  const columns = [
    { 
      header: 'Nombre', 
      accessor: (item: Docente) => `${item.nombres} ${item.apellidos}` 
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Especialidad', accessor: 'especialidad' },
    { 
      header: 'Estado', 
      accessor: (item: Docente) => (
        <span className={item.estado === 'Activo' ? 'text-green-600' : 'text-red-600'}>
          {item.estado}
        </span>
      )
    },
  ];

  // Renderizado del formulario
  const renderForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input placeholder="Nombres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="apellidos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input placeholder="Apellidos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Teléfono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="especialidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidad</FormLabel>
                <FormControl>
                  <Input placeholder="Especialidad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
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
      title="Docentes"
      subtitle="Gestiona los docentes de la institución"
      items={docentes}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={renderForm}
      showForm={showForm}
      icon={<Users className="h-16 w-16 text-muted-foreground mb-4" />}
    />
  );
};

export default DocentePage;
