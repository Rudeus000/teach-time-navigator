
import React, { useState, useEffect } from 'react';
import { Users, Award } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Especialidad {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  area: string;
}

interface Docente {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  especialidad: string;
  estado: 'Activo' | 'Inactivo';
  especialidades?: Especialidad[];
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
  especialidadId: z.string().optional(),
});

// Esquema para agregar especialidad
const especialidadDocenteSchema = z.object({
  especialidadId: z.string().min(1, { message: 'Debe seleccionar una especialidad' }),
});

type FormValues = z.infer<typeof docenteSchema>;
type EspecialidadFormValues = z.infer<typeof especialidadDocenteSchema>;

const DocentePage = () => {
  // Estado para las especialidades
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([
    { id: 1, nombre: 'Programación Web', codigo: 'PW', descripcion: 'Especialidad en desarrollo de aplicaciones web', area: 'Informática' },
    { id: 2, nombre: 'Inteligencia Artificial', codigo: 'IA', descripcion: 'Especialidad en sistemas inteligentes y ML', area: 'Informática' },
    { id: 3, nombre: 'Matemática Aplicada', codigo: 'MA', descripcion: 'Aplicación de las matemáticas', area: 'Ciencias' },
    { id: 4, nombre: 'Bases de Datos', codigo: 'BD', descripcion: 'Gestión y administración de bases de datos', area: 'Informática' },
    { id: 5, nombre: 'Redes', codigo: 'RED', descripcion: 'Redes y comunicaciones', area: 'Telecomunicaciones' },
  ]);
  
  // Estado para los docentes
  const [docentes, setDocentes] = useState<Docente[]>([
    { 
      id: 1, 
      nombres: 'Juan Carlos', 
      apellidos: 'Pérez López', 
      email: 'jperez@ejemplo.com', 
      telefono: '555-1234', 
      especialidad: 'Programación',
      estado: 'Activo',
      especialidades: [
        { id: 1, nombre: 'Programación Web', codigo: 'PW', descripcion: 'Especialidad en desarrollo de aplicaciones web', area: 'Informática' },
      ]
    },
    { 
      id: 2, 
      nombres: 'María Elena', 
      apellidos: 'Gómez Rodríguez', 
      email: 'mgomez@ejemplo.com', 
      telefono: '555-5678', 
      especialidad: 'Matemáticas',
      estado: 'Activo',
      especialidades: [
        { id: 3, nombre: 'Matemática Aplicada', codigo: 'MA', descripcion: 'Aplicación de las matemáticas', area: 'Ciencias' },
      ]
    },
  ]);
  
  // Estado para controlar el formulario docente
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Estado para controlar el diálogo de especialidades
  const [especialidadDialogOpen, setEspecialidadDialogOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  
  // Configuración del formulario docente
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
  
  // Configuración del formulario de especialidades
  const especialidadForm = useForm<EspecialidadFormValues>({
    resolver: zodResolver(especialidadDocenteSchema),
    defaultValues: {
      especialidadId: '',
    },
  });

  // Manejadores para docentes
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

  // Manejadores para especialidades
  const handleAddEspecialidad = (docente: Docente) => {
    setSelectedDocente(docente);
    especialidadForm.reset({ especialidadId: '' });
    setEspecialidadDialogOpen(true);
  };
  
  const handleRemoveEspecialidad = (docenteId: number, especialidadId: number) => {
    setDocentes(prevDocentes => 
      prevDocentes.map(d => {
        if (d.id === docenteId) {
          return {
            ...d,
            especialidades: d.especialidades?.filter(e => e.id !== especialidadId) || []
          };
        }
        return d;
      })
    );
    toast.success('Especialidad removida del docente');
  };
  
  const onSubmitEspecialidad = (data: EspecialidadFormValues) => {
    if (!selectedDocente) return;
    
    const especialidadId = parseInt(data.especialidadId);
    const especialidad = especialidades.find(e => e.id === especialidadId);
    
    if (especialidad) {
      // Verificar si ya tiene esta especialidad
      const yaAsignada = selectedDocente.especialidades?.some(e => e.id === especialidad.id);
      
      if (yaAsignada) {
        toast.error('Esta especialidad ya está asignada al docente');
        return;
      }
      
      setDocentes(prevDocentes => 
        prevDocentes.map(d => {
          if (d.id === selectedDocente.id) {
            return {
              ...d,
              especialidades: [...(d.especialidades || []), especialidad]
            };
          }
          return d;
        })
      );
      
      toast.success('Especialidad asignada correctamente');
      setEspecialidadDialogOpen(false);
      especialidadForm.reset();
    }
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      // Actualizar existente
      setDocentes(docentes.map(item => 
        item.id === editingId ? { 
          ...item,
          nombres: data.nombres,
          apellidos: data.apellidos,
          email: data.email,
          telefono: data.telefono,
          especialidad: data.especialidad,
          estado: data.estado
        } : item
      ));
      toast.success(`Docente actualizado`);
    } else {
      // Crear nuevo
      const newItem: Docente = {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono,
        especialidad: data.especialidad,
        estado: data.estado,
        id: Math.max(0, ...docentes.map(d => d.id)) + 1,
        especialidades: []
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
    { header: 'Email', accessor: 'email' as keyof Docente },
    { header: 'Teléfono', accessor: 'telefono' as keyof Docente },
    { 
      header: 'Especialidades', 
      accessor: (item: Docente) => (
        <div className="flex flex-wrap gap-1">
          {item.especialidades && item.especialidades.length > 0 ? (
            item.especialidades.map((esp) => (
              <Badge key={esp.id} variant="outline" className="flex items-center gap-1">
                {esp.nombre}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveEspecialidad(item.id, esp.id);
                  }}
                  className="ml-1 h-3 w-3 rounded-full hover:bg-destructive/20"
                >
                  ×
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-gray-400 text-xs">Sin especialidades</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleAddEspecialidad(item);
            }}
          >
            +
          </Button>
        </div>
      ) 
    },
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
                <FormLabel>Especialidad Principal</FormLabel>
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
    <>
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
      
      {/* Modal para agregar especialidades al docente */}
      <Dialog open={especialidadDialogOpen} onOpenChange={setEspecialidadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Especialidad</DialogTitle>
            <DialogDescription>
              Asignar una nueva especialidad a {selectedDocente?.nombres} {selectedDocente?.apellidos}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...especialidadForm}>
            <form onSubmit={especialidadForm.handleSubmit(onSubmitEspecialidad)} className="space-y-4">
              <FormField
                control={especialidadForm.control}
                name="especialidadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidad</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {especialidades.map((esp) => (
                            <SelectItem key={esp.id} value={esp.id.toString()}>
                              {esp.nombre} ({esp.codigo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEspecialidadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={especialidadForm.handleSubmit(onSubmitEspecialidad)}>
              Asignar Especialidad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocentePage;
