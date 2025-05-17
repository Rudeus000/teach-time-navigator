
import React, { useState } from 'react';
import { GraduationCap, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

import { CrudLayout } from '@/components/crud/CrudLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UnidadAcademica {
  id: number;
  nombre: string;
  codigo: string;
}

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  duracion: number; // en semestres
  unidadAcademicaId: number;
  unidadAcademica?: UnidadAcademica;
}

// Esquema de validación
const carreraSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  codigo: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }),
  descripcion: z.string().optional(),
  duracion: z.number().min(1, { message: 'La duración debe ser al menos 1 semestre' }),
  unidadAcademicaId: z.string().min(1, { message: 'Debe seleccionar una unidad académica' }),
});

type FormValues = z.infer<typeof carreraSchema>;

const CarreraPage = () => {
  // Estado para las unidades académicas
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([
    { id: 1, nombre: 'Facultad de Ingeniería', codigo: 'FI' },
    { id: 2, nombre: 'Facultad de Economía', codigo: 'FE' },
    { id: 3, nombre: 'Facultad de Humanidades', codigo: 'FH' },
  ]);
  
  // Estado para los datos
  const [carreras, setCarreras] = useState<Carrera[]>([
    { 
      id: 1, 
      nombre: 'Ingeniería de Software', 
      codigo: 'IS', 
      descripcion: 'Carrera de ingeniería de software', 
      duracion: 10,
      unidadAcademicaId: 1,
      unidadAcademica: { id: 1, nombre: 'Facultad de Ingeniería', codigo: 'FI' },
    },
    { 
      id: 2, 
      nombre: 'Administración de Empresas', 
      codigo: 'AE', 
      descripcion: 'Carrera de administración', 
      duracion: 8,
      unidadAcademicaId: 2,
      unidadAcademica: { id: 2, nombre: 'Facultad de Economía', codigo: 'FE' },
    },
  ]);
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(carreraSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      descripcion: '',
      duracion: 8,
      unidadAcademicaId: '',
    },
  });

  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      nombre: '',
      codigo: '',
      descripcion: '',
      duracion: 8,
      unidadAcademicaId: '',
    });
    setShowForm(true);
  };

  const handleEdit = (item: Carrera) => {
    setEditingId(item.id);
    form.reset({
      nombre: item.nombre,
      codigo: item.codigo,
      descripcion: item.descripcion || '',
      duracion: item.duracion,
      unidadAcademicaId: item.unidadAcademicaId.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (item: Carrera) => {
    setCarreras(carreras.filter(c => c.id !== item.id));
    toast.success(`Carrera "${item.nombre}" eliminada`);
  };

  const onSubmit = (data: FormValues) => {
    const unidadAcademica = unidadesAcademicas.find(
      u => u.id === parseInt(data.unidadAcademicaId)
    );
    
    if (editingId) {
      // Actualizar existente
      setCarreras(carreras.map(item => 
        item.id === editingId ? { 
          id: editingId, 
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion || '',
          duracion: data.duracion,
          unidadAcademicaId: parseInt(data.unidadAcademicaId),
          unidadAcademica
        } : item
      ));
      toast.success(`Carrera actualizada`);
    } else {
      // Crear nuevo
      const newItem: Carrera = {
        nombre: data.nombre,
        codigo: data.codigo,
        descripcion: data.descripcion || '',
        duracion: data.duracion,
        unidadAcademicaId: parseInt(data.unidadAcademicaId),
        unidadAcademica,
        id: Math.max(0, ...carreras.map(c => c.id)) + 1,
      };
      setCarreras([...carreras, newItem]);
      toast.success(`Nueva carrera creada`);
    }
    
    setShowForm(false);
    form.reset();
  };

  // Columnas para la tabla
  const columns = [
    { header: 'Código', accessor: 'codigo' as keyof Carrera },
    { header: 'Nombre', accessor: 'nombre' as keyof Carrera },
    { 
      header: 'Unidad Académica', 
      accessor: (item: Carrera) => item.unidadAcademica?.nombre || '-'
    },
    { header: 'Duración', accessor: (item: Carrera) => `${item.duracion} semestres` },
    { header: 'Descripción', accessor: 'descripcion' as keyof Carrera },
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
                  <Input placeholder="Nombre de la carrera" {...field} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unidadAcademicaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad Académica</FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una unidad académica" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesAcademicas.map(unidad => (
                        <SelectItem key={unidad.id} value={unidad.id.toString()}>
                          {unidad.codigo} - {unidad.nombre}
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
            name="duracion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (semestres)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Duración en semestres"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
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
      title="Carreras"
      subtitle="Gestiona las carreras académicas de la institución"
      items={carreras}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={renderForm}
      showForm={showForm}
      icon={<GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />}
    />
  );
};

export default CarreraPage;
