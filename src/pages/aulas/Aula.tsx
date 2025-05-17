
import React, { useState } from 'react';
import { Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReactNode } from 'react';

// Define interfaces
interface Aula {
  id: number;
  nombre: string;
  codigo: string;
  capacidad: number;
  edificio: string;
  piso: number;
  tipo: 'Laboratorio' | 'Teoría' | 'Taller';
}

// Define schema with validation
const aulaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
  capacidad: z.coerce.number().min(1, 'La capacidad debe ser mayor a 0'),
  edificio: z.string().min(1, 'Debe especificar el edificio'),
  piso: z.coerce.number().min(0, 'El piso debe ser 0 o mayor'),
  tipo: z.enum(['Laboratorio', 'Teoría', 'Taller']),
});

type FormValues = z.infer<typeof aulaSchema>;

const AulaPage = () => {
  // Estado para los datos
  const [aulas, setAulas] = useState<Aula[]>([
    { id: 1, nombre: 'Aula de Programación', codigo: 'A101', capacidad: 30, edificio: 'Principal', piso: 1, tipo: 'Laboratorio' },
    { id: 2, nombre: 'Aula Magna', codigo: 'AM01', capacidad: 120, edificio: 'Central', piso: 0, tipo: 'Teoría' },
    { id: 3, nombre: 'Taller de Electrónica', codigo: 'T201', capacidad: 25, edificio: 'Tecnología', piso: 2, tipo: 'Taller' },
    { id: 4, nombre: 'Laboratorio de Química', codigo: 'L301', capacidad: 40, edificio: 'Ciencias', piso: 3, tipo: 'Laboratorio' },
  ]);
  
  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Configurar formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(aulaSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      capacidad: 30,
      edificio: '',
      piso: 1,
      tipo: 'Teoría',
    },
  });
  
  // Filtrar aulas por término de búsqueda
  const filteredAulas = aulas.filter(aula =>
    aula.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.edificio.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Manejadores
  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      nombre: '',
      codigo: '',
      capacidad: 30,
      edificio: '',
      piso: 1,
      tipo: 'Teoría',
    });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (item: Aula) => {
    setEditingId(item.id);
    form.reset({
      nombre: item.nombre,
      codigo: item.codigo,
      capacidad: item.capacidad,
      edificio: item.edificio,
      piso: item.piso,
      tipo: item.tipo,
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: number) => {
    setAulas(prev => prev.filter(item => item.id !== id));
    toast.success('Aula eliminada correctamente');
  };
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingId) {
        // Update existing
        setAulas(aulas.map(item => 
          item.id === editingId ? { ...data, id: editingId } : item
        ));
        toast.success('Aula actualizada correctamente');
      } else {
        // Create new
        const newItem: Aula = {
          id: Math.max(0, ...aulas.map(a => a.id)) + 1,
          nombre: data.nombre,
          codigo: data.codigo,
          capacidad: data.capacidad,
          edificio: data.edificio,
          piso: data.piso,
          tipo: data.tipo,
        };
        setAulas([...aulas, newItem]);
        toast.success('Aula creada correctamente');
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar el aula');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Definir columnas para la tabla
  const columns: {
    header: string;
    accessor: keyof Aula | ((item: Aula) => ReactNode);
  }[] = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Capacidad', accessor: 'capacidad' },
    { header: 'Edificio', accessor: 'edificio' },
    { header: 'Piso', accessor: 'piso' },
    { header: 'Tipo', accessor: 'tipo' },
  ];
  
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Aulas</CardTitle>
            <CardDescription>
              Gestiona las aulas disponibles para las clases
            </CardDescription>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Aula
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por nombre, código o edificio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
              startIcon={<Search className="h-4 w-4" />}
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
              {filteredAulas.length > 0 ? (
                filteredAulas.map((aula) => (
                  <TableRow key={aula.id}>
                    {columns.map((column, columnIndex) => (
                      <TableCell key={columnIndex}>
                        {typeof column.accessor === 'function' 
                          ? column.accessor(aula)
                          : aula[column.accessor]}
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
                          <DropdownMenuItem onClick={() => handleEdit(aula)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(aula.id)}>
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
            <DialogTitle>{editingId ? 'Editar' : 'Nueva'} Aula</DialogTitle>
            <DialogDescription>
              Complete la información del aula. Haga clic en guardar cuando termine.
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
                        <Input placeholder="Ej: A101" {...field} />
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
                        <Input placeholder="Ej: Aula de Programación" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="edificio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edificio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Principal" {...field} />
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
              </div>
              
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Aula</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                        <SelectItem value="Teoría">Teoría</SelectItem>
                        <SelectItem value="Taller">Taller</SelectItem>
                      </SelectContent>
                    </Select>
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

export default AulaPage;
