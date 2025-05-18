
// Fix the type error by ensuring all properties in Aula are required
// Add the exact type definition and remove the startIcon prop from Input
import React, { useState, ChangeEvent } from 'react';
import { Building, Search } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

// Define Aula interface with all required properties
interface Aula {
  id: number;
  nombre: string;
  codigo: string;
  capacidad: number;
  edificio: string;
  piso: number;
  tipo: "Laboratorio" | "Teoría" | "Taller";
}

// Esquema de validación
const aulaSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  codigo: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }),
  capacidad: z.number().min(1, { message: 'La capacidad debe ser al menos 1' }),
  edificio: z.string().min(1, { message: 'Debe especificar un edificio' }),
  piso: z.number().min(0, { message: 'El piso no puede ser negativo' }),
  tipo: z.enum(['Laboratorio', 'Teoría', 'Taller'], { 
    required_error: 'Debe seleccionar un tipo de aula' 
  }),
});

type FormValues = z.infer<typeof aulaSchema>;

const AulaPage = () => {
  // Estado para los datos
  const [aulas, setAulas] = useState<Aula[]>([
    { 
      id: 1, 
      nombre: 'Laboratorio de Computación 1', 
      codigo: 'LAB-1', 
      capacidad: 30,
      edificio: 'A',
      piso: 1,
      tipo: 'Laboratorio',
    },
    { 
      id: 2, 
      nombre: 'Aula Teórica 101', 
      codigo: 'A-101', 
      capacidad: 60,
      edificio: 'B',
      piso: 1,
      tipo: 'Teoría',
    },
    { 
      id: 3, 
      nombre: 'Taller de Electrónica', 
      codigo: 'T-ELEC', 
      capacidad: 25,
      edificio: 'C',
      piso: 2,
      tipo: 'Taller',
    },
  ]);
  
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Configuración del formulario
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
    setShowForm(true);
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
        item.id === editingId ? { 
          id: editingId, 
          nombre: data.nombre,
          codigo: data.codigo,
          capacidad: data.capacidad,
          edificio: data.edificio,
          piso: data.piso,
          tipo: data.tipo,
        } : item
      ));
      toast.success(`Aula actualizada`);
    } else {
      // Crear nuevo
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
      toast.success(`Nueva aula creada`);
    }
    
    setShowForm(false);
    form.reset();
  };

  // Filtrar aulas
  const filteredAulas = aulas.filter(aula => {
    const matchesSearch = 
      aula.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aula.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = !filterTipo || aula.tipo === filterTipo;
    
    return matchesSearch && matchesTipo;
  });

  // Columnas para la tabla
  const columns = [
    { header: 'Código', accessor: 'codigo' as keyof Aula },
    { header: 'Nombre', accessor: 'nombre' as keyof Aula },
    { header: 'Tipo', accessor: 'tipo' as keyof Aula },
    { header: 'Capacidad', accessor: 'capacidad' as keyof Aula },
    { header: 'Ubicación', accessor: (item: Aula) => `Edificio ${item.edificio}, Piso ${item.piso}` },
  ];

  // Renderizado del formulario de búsqueda
  const searchForm = (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Input
          placeholder="Buscar aulas..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10" // Added padding for the icon
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      
      <Select value={filterTipo} onValueChange={setFilterTipo}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Tipo de aula" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos los tipos</SelectItem>
          <SelectItem value="Laboratorio">Laboratorio</SelectItem>
          <SelectItem value="Teoría">Teoría</SelectItem>
          <SelectItem value="Taller">Taller</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

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
                  <Input placeholder="Nombre del aula" {...field} />
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
                  <Input placeholder="Código o identificador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
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
          
          <FormField
            control={form.control}
            name="capacidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Capacidad de estudiantes"
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
            name="edificio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edificio</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: A, B, C" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="piso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Piso</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Número de piso"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
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
    <>
      {searchForm}
      
      <CrudLayout
        title="Aulas"
        subtitle="Gestiona las aulas y espacios de la institución"
        items={filteredAulas}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderForm={renderForm}
        showForm={showForm}
        icon={<Building className="h-16 w-16 text-muted-foreground mb-4" />}
      />
    </>
  );
};

export default AulaPage;
