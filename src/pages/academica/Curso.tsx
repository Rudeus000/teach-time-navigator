
import React, { useState } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
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

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
}

interface Curso {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  creditos: number;
  horasTeoricas: number;
  horasPracticas: number;
  carreraId: number;
  carrera?: Carrera;
}

// Esquema de validación
const cursoSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  codigo: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }),
  descripcion: z.string().optional(),
  creditos: z.number().min(1, { message: 'Los créditos deben ser al menos 1' }),
  horasTeoricas: z.number().min(0, { message: 'Las horas teóricas no pueden ser negativas' }),
  horasPracticas: z.number().min(0, { message: 'Las horas prácticas no pueden ser negativas' }),
  carreraId: z.string().min(1, { message: 'Debe seleccionar una carrera' }),
});

type FormValues = z.infer<typeof cursoSchema>;

const CursoPage = () => {
  // Estado para las carreras
  const [carreras, setCarreras] = useState<Carrera[]>([
    { id: 1, nombre: 'Ingeniería de Software', codigo: 'IS' },
    { id: 2, nombre: 'Administración de Empresas', codigo: 'AE' },
    { id: 3, nombre: 'Psicología', codigo: 'PS' },
  ]);
  
  // Estado para los cursos
  const [cursos, setCursos] = useState<Curso[]>([
    { 
      id: 1, 
      nombre: 'Algoritmos y Estructuras de Datos', 
      codigo: 'AED', 
      descripcion: 'Curso de algoritmos y estructuras de datos', 
      creditos: 4,
      horasTeoricas: 2,
      horasPracticas: 4,
      carreraId: 1,
      carrera: { id: 1, nombre: 'Ingeniería de Software', codigo: 'IS' },
    },
    { 
      id: 2, 
      nombre: 'Bases de Datos', 
      codigo: 'BD', 
      descripcion: 'Curso de bases de datos', 
      creditos: 3,
      horasTeoricas: 2,
      horasPracticas: 2,
      carreraId: 1,
      carrera: { id: 1, nombre: 'Ingeniería de Software', codigo: 'IS' },
    },
    { 
      id: 3, 
      nombre: 'Administración General', 
      codigo: 'ADM', 
      descripcion: 'Curso de administración general', 
      creditos: 3,
      horasTeoricas: 3,
      horasPracticas: 0,
      carreraId: 2,
      carrera: { id: 2, nombre: 'Administración de Empresas', codigo: 'AE' },
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
      descripcion: '',
      creditos: 3,
      horasTeoricas: 2,
      horasPracticas: 2,
      carreraId: '',
    },
  });

  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      nombre: '',
      codigo: '',
      descripcion: '',
      creditos: 3,
      horasTeoricas: 2,
      horasPracticas: 2,
      carreraId: '',
    });
    setShowForm(true);
  };

  const handleEdit = (item: Curso) => {
    setEditingId(item.id);
    form.reset({
      nombre: item.nombre,
      codigo: item.codigo,
      descripcion: item.descripcion || '',
      creditos: item.creditos,
      horasTeoricas: item.horasTeoricas,
      horasPracticas: item.horasPracticas,
      carreraId: item.carreraId.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (item: Curso) => {
    setCursos(cursos.filter(c => c.id !== item.id));
    toast.success(`Curso "${item.nombre}" eliminado`);
  };

  const onSubmit = (data: FormValues) => {
    const carrera = carreras.find(c => c.id === parseInt(data.carreraId));
    
    if (editingId) {
      // Actualizar existente
      setCursos(cursos.map(item => 
        item.id === editingId ? { 
          id: editingId, 
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion || '',
          creditos: data.creditos,
          horasTeoricas: data.horasTeoricas,
          horasPracticas: data.horasPracticas,
          carreraId: parseInt(data.carreraId),
          carrera
        } : item
      ));
      toast.success(`Curso actualizado`);
    } else {
      // Crear nuevo
      const newItem: Curso = {
        nombre: data.nombre,
        codigo: data.codigo,
        descripcion: data.descripcion || '',
        creditos: data.creditos,
        horasTeoricas: data.horasTeoricas,
        horasPracticas: data.horasPracticas,
        carreraId: parseInt(data.carreraId),
        carrera,
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
    { header: 'Código', accessor: 'codigo' as keyof Curso },
    { header: 'Nombre', accessor: 'nombre' as keyof Curso },
    { 
      header: 'Carrera', 
      accessor: (item: Curso) => item.carrera?.nombre || '-'
    },
    { header: 'Créditos', accessor: 'creditos' as keyof Curso },
    { 
      header: 'Horas', 
      accessor: (item: Curso) => `T: ${item.horasTeoricas} | P: ${item.horasPracticas}` 
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
                  <Input placeholder="Código (abreviatura)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="carreraId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrera</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {carreras.map(carrera => (
                      <SelectItem key={carrera.id} value={carrera.id.toString()}>
                        {carrera.codigo} - {carrera.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="creditos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Créditos</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Créditos"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
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
                  <Input 
                    type="number" 
                    placeholder="Horas teóricas"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
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
                  <Input 
                    type="number" 
                    placeholder="Horas prácticas"
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
      title="Cursos"
      subtitle="Gestiona los cursos académicos de la institución"
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
