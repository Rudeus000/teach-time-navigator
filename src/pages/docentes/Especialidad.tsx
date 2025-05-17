
import React, { useState } from 'react';
import { Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define interfaces
interface Especialidad {
  id: number;
  area: string;
  nombre: string;
  codigo: string;
  descripcion: string;
}

// Define schema with validation
const especialidadSchema = z.object({
  area: z.string().min(2, 'El área debe tener al menos 2 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
});

type FormValues = z.infer<typeof especialidadSchema>;

const EspecialidadPage = () => {
  // Estado para los datos
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([
    { id: 1, area: 'Ingeniería', nombre: 'Desarrollo de Software', codigo: 'DS001', descripcion: 'Especialización en desarrollo de aplicaciones y sistemas' },
    { id: 2, area: 'Ciencias', nombre: 'Matemáticas Aplicadas', codigo: 'MA002', descripcion: 'Aplicación de matemáticas a problemas prácticos' },
    { id: 3, area: 'Tecnología', nombre: 'Bases de Datos', codigo: 'BD003', descripcion: 'Gestión y optimización de bases de datos' },
    { id: 4, area: 'Ingeniería', nombre: 'Redes y Comunicaciones', codigo: 'RC004', descripcion: 'Especialización en redes informáticas' },
  ]);
  
  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Configurar formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(especialidadSchema),
    defaultValues: {
      area: '',
      nombre: '',
      codigo: '',
      descripcion: '',
    },
  });
  
  // Filtrar especialidades por término de búsqueda
  const filteredEspecialidades = especialidades.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      area: '',
      nombre: '',
      codigo: '',
      descripcion: '',
    });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (item: Especialidad) => {
    setEditingId(item.id);
    form.reset({
      area: item.area,
      nombre: item.nombre,
      codigo: item.codigo,
      descripcion: item.descripcion,
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: number) => {
    setEspecialidades(prev => prev.filter(item => item.id !== id));
    toast.success('Especialidad eliminada correctamente');
  };
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingId) {
        // Update existing
        setEspecialidades(especialidades.map(item => 
          item.id === editingId ? { 
            ...item, 
            area: data.area, 
            nombre: data.nombre, 
            codigo: data.codigo, 
            descripcion: data.descripcion || '' 
          } : item
        ));
        toast.success('Especialidad actualizada correctamente');
      } else {
        // Create new
        const newItem: Especialidad = {
          id: Math.max(0, ...especialidades.map(a => a.id)) + 1,
          area: data.area,
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion || '',
        };
        setEspecialidades([...especialidades, newItem]);
        toast.success('Especialidad creada correctamente');
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar la especialidad');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Definir columnas para la tabla
  const columns: {
    header: string;
    accessor: keyof Especialidad | ((item: Especialidad) => ReactNode);
  }[] = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Área', accessor: 'area' },
    { header: 'Descripción', accessor: 'descripcion' },
  ];
  
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Especialidades</CardTitle>
            <CardDescription>
              Gestiona las especialidades de los docentes
            </CardDescription>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Especialidad
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por nombre, área o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>{column.header}</TableHead>
                ))}
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEspecialidades.length > 0 ? (
                filteredEspecialidades.map((especialidad) => (
                  <TableRow key={especialidad.id}>
                    {columns.map((column, columnIndex) => (
                      <TableCell key={columnIndex}>
                        {typeof column.accessor === 'function' 
                          ? column.accessor(especialidad)
                          : especialidad[column.accessor]}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(especialidad)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(especialidad.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar' : 'Nueva'} Especialidad</DialogTitle>
            <DialogDescription>
              Complete la información de la especialidad. Haga clic en guardar cuando termine.
            </DialogDescription>
          </DialogHeader>
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
                        <Input placeholder="Ej: DS001" {...field} />
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
                        <Input placeholder="Ej: Desarrollo de Software" {...field} />
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
                      <Input placeholder="Ej: Ingeniería" {...field} />
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
                      <Input placeholder="Breve descripción de la especialidad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecialidadPage;
