
import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

import { CrudLayout } from '@/components/crud/CrudLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Checkbox
} from "@/components/ui/checkbox";

interface UnidadAcademica {
  id: number;
  nombre: string;
  codigo: string;
}

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  unidadAcademica?: UnidadAcademica;
  unidadAcademicaId: number;
}

interface Especialidad {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  area: string;
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
  especialidades?: Especialidad[];
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
  especialidadesIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof cursoSchema>;

const CursoPage = () => {
  // Estado para las unidades académicas
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([
    { id: 1, nombre: 'Facultad de Ingeniería', codigo: 'FING' },
    { id: 2, nombre: 'Facultad de Ciencias Económicas', codigo: 'FECO' },
    { id: 3, nombre: 'Facultad de Ciencias Sociales', codigo: 'FSOC' },
  ]);
  
  // Estado para las carreras
  const [carreras, setCarreras] = useState<Carrera[]>([
    { id: 1, nombre: 'Ingeniería de Software', codigo: 'IS', unidadAcademicaId: 1, unidadAcademica: { id: 1, nombre: 'Facultad de Ingeniería', codigo: 'FING' } },
    { id: 2, nombre: 'Administración de Empresas', codigo: 'AE', unidadAcademicaId: 2, unidadAcademica: { id: 2, nombre: 'Facultad de Ciencias Económicas', codigo: 'FECO' } },
    { id: 3, nombre: 'Psicología', codigo: 'PS', unidadAcademicaId: 3, unidadAcademica: { id: 3, nombre: 'Facultad de Ciencias Sociales', codigo: 'FSOC' } },
    { id: 4, nombre: 'Ingeniería Civil', codigo: 'IC', unidadAcademicaId: 1, unidadAcademica: { id: 1, nombre: 'Facultad de Ingeniería', codigo: 'FING' } },
  ]);

  // Estado para las especialidades
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([
    { id: 1, nombre: 'Programación Web', codigo: 'PW', descripcion: 'Especialidad en desarrollo de aplicaciones web', area: 'Informática' },
    { id: 2, nombre: 'Inteligencia Artificial', codigo: 'IA', descripcion: 'Especialidad en sistemas inteligentes y ML', area: 'Informática' },
    { id: 3, nombre: 'Matemática Aplicada', codigo: 'MA', descripcion: 'Aplicación de las matemáticas', area: 'Ciencias' },
    { id: 4, nombre: 'Bases de Datos', codigo: 'BD', descripcion: 'Gestión y administración de bases de datos', area: 'Informática' },
    { id: 5, nombre: 'Redes', codigo: 'RED', descripcion: 'Redes y comunicaciones', area: 'Telecomunicaciones' },
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
      carrera: { id: 1, nombre: 'Ingeniería de Software', codigo: 'IS', unidadAcademicaId: 1 },
      especialidades: [
        { id: 1, nombre: 'Programación Web', codigo: 'PW', descripcion: 'Especialidad en desarrollo de aplicaciones web', area: 'Informática' },
        { id: 4, nombre: 'Bases de Datos', codigo: 'BD', descripcion: 'Gestión y administración de bases de datos', area: 'Informática' },
      ]
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
      carrera: { id: 1, nombre: 'Ingeniería de Software', codigo: 'IS', unidadAcademicaId: 1 },
      especialidades: [
        { id: 4, nombre: 'Bases de Datos', codigo: 'BD', descripcion: 'Gestión y administración de bases de datos', area: 'Informática' },
      ]
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
      carrera: { id: 2, nombre: 'Administración de Empresas', codigo: 'AE', unidadAcademicaId: 2 },
      especialidades: []
    },
  ]);
  
  // Estado para filtrado
  const [unidadAcademicaSeleccionada, setUnidadAcademicaSeleccionada] = useState<number | null>(null);
  const [carrerasFiltradas, setCarrerasFiltradas] = useState<Carrera[]>(carreras);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<number | null>(null);
  const [cursosFiltrados, setCursosFiltrados] = useState<Curso[]>(cursos);
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState<string[]>([]);
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [especialidadesDialog, setEspecialidadesDialog] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);

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
      especialidadesIds: [],
    },
  });

  // Efecto para filtrar carreras cuando cambia la unidad académica
  useEffect(() => {
    if (unidadAcademicaSeleccionada) {
      const filtradas = carreras.filter(carrera => carrera.unidadAcademicaId === unidadAcademicaSeleccionada);
      setCarrerasFiltradas(filtradas);
      setCarreraSeleccionada(null); // Resetear carrera seleccionada
      setCursosFiltrados([]); // Resetear cursos cuando cambia la UA
    } else {
      setCarrerasFiltradas(carreras);
      setCursosFiltrados(cursos);
    }
  }, [unidadAcademicaSeleccionada, carreras, cursos]);

  // Efecto para filtrar cursos cuando cambia la carrera
  useEffect(() => {
    if (carreraSeleccionada) {
      const filtrados = cursos.filter(curso => curso.carreraId === carreraSeleccionada);
      setCursosFiltrados(filtrados);
    } else if (unidadAcademicaSeleccionada) {
      // Si hay una UA seleccionada pero no carrera, mostrar todos los cursos de esa UA
      const carrerasIds = carreras
        .filter(c => c.unidadAcademicaId === unidadAcademicaSeleccionada)
        .map(c => c.id);
      const filtrados = cursos.filter(curso => carrerasIds.includes(curso.carreraId));
      setCursosFiltrados(filtrados);
    } else {
      setCursosFiltrados(cursos);
    }
  }, [carreraSeleccionada, cursos, carreras, unidadAcademicaSeleccionada]);

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
      carreraId: carreraSeleccionada ? carreraSeleccionada.toString() : '',
      especialidadesIds: [],
    });
    setEspecialidadesSeleccionadas([]);
    setShowForm(true);
  };

  const handleEdit = (item: Curso) => {
    setEditingId(item.id);
    const especialidadesIds = item.especialidades?.map(esp => esp.id.toString()) || [];
    
    form.reset({
      nombre: item.nombre,
      codigo: item.codigo,
      descripcion: item.descripcion || '',
      creditos: item.creditos,
      horasTeoricas: item.horasTeoricas,
      horasPracticas: item.horasPracticas,
      carreraId: item.carreraId.toString(),
      especialidadesIds: especialidadesIds,
    });
    
    setEspecialidadesSeleccionadas(especialidadesIds);
    setShowForm(true);
  };

  const handleDelete = (item: Curso) => {
    setCursos(cursos.filter(c => c.id !== item.id));
    setCursosFiltrados(prev => prev.filter(c => c.id !== item.id));
    toast.success(`Curso "${item.nombre}" eliminado`);
  };

  const handleEspecialidadesOpen = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setEspecialidadesSeleccionadas(curso.especialidades?.map(esp => esp.id.toString()) || []);
    setEspecialidadesDialog(true);
  };

  const handleEspecialidadesGuardar = () => {
    if (!cursoSeleccionado) return;
    
    // Actualizar curso con las especialidades seleccionadas
    const especialidadesAsignadas = especialidades.filter(esp => 
      especialidadesSeleccionadas.includes(esp.id.toString())
    );
    
    const updatedCursos = cursos.map(curso => 
      curso.id === cursoSeleccionado.id 
        ? { ...curso, especialidades: especialidadesAsignadas } 
        : curso
    );
    
    setCursos(updatedCursos);
    setCursosFiltrados(prev => prev.map(curso => 
      curso.id === cursoSeleccionado.id 
        ? { ...curso, especialidades: especialidadesAsignadas } 
        : curso
    ));
    
    setEspecialidadesDialog(false);
    toast.success(`Especialidades actualizadas para "${cursoSeleccionado.nombre}"`);
  };

  const handleToggleEspecialidad = (id: string) => {
    setEspecialidadesSeleccionadas(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const onSubmit = (data: FormValues) => {
    // Obtener las especialidades seleccionadas
    const especialidadesAsignadas = especialidades.filter(esp => 
      especialidadesSeleccionadas.includes(esp.id.toString())
    );
    
    const carrera = carreras.find(c => c.id === parseInt(data.carreraId));
    
    if (editingId) {
      // Actualizar existente
      const updatedCursos = cursos.map(item => 
        item.id === editingId ? { 
          id: editingId, 
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion || '',
          creditos: data.creditos,
          horasTeoricas: data.horasTeoricas,
          horasPracticas: data.horasPracticas,
          carreraId: parseInt(data.carreraId),
          carrera,
          especialidades: especialidadesAsignadas
        } : item
      );
      setCursos(updatedCursos);
      setCursosFiltrados(prev => prev.map(item => 
        item.id === editingId ? updatedCursos.find(c => c.id === editingId)! : item
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
        especialidades: especialidadesAsignadas,
        id: Math.max(0, ...cursos.map(c => c.id)) + 1,
      };
      setCursos([...cursos, newItem]);
      if (!carreraSeleccionada || carreraSeleccionada === parseInt(data.carreraId)) {
        setCursosFiltrados(prev => [...prev, newItem]);
      }
      toast.success(`Nuevo curso creado`);
    }
    
    setShowForm(false);
    form.reset();
    setEspecialidadesSeleccionadas([]);
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
    {
      header: 'Especialidades',
      accessor: (item: Curso) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {item.especialidades && item.especialidades.length > 0 ? (
            item.especialidades.map(esp => (
              <Badge key={esp.id} variant="outline" className="flex items-center">
                {esp.nombre}
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
              handleEspecialidadesOpen(item);
            }}
          >
            +
          </Button>
        </div>
      )
    }
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
                    {carrerasFiltradas.map(carrera => (
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
                <Textarea 
                  placeholder="Descripción (opcional)" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="especialidadesIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidades que pueden enseñar este curso</FormLabel>
              <div className="border rounded-md p-4 space-y-2">
                {especialidades.map(esp => (
                  <div key={esp.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`esp-${esp.id}`}
                      checked={especialidadesSeleccionadas.includes(esp.id.toString())}
                      onCheckedChange={() => handleToggleEspecialidad(esp.id.toString())}
                    />
                    <label 
                      htmlFor={`esp-${esp.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {esp.nombre} ({esp.codigo})
                    </label>
                  </div>
                ))}
                {especialidades.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay especialidades disponibles</p>
                )}
              </div>
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
      <div className="mb-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="filtros">
            <AccordionTrigger>Filtrar Cursos</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div>
                  <FormLabel>Unidad Académica</FormLabel>
                  <Select
                    onValueChange={(value) => setUnidadAcademicaSeleccionada(parseInt(value))}
                    value={unidadAcademicaSeleccionada?.toString() || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar Unidad Académica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {unidadesAcademicas.map((ua) => (
                        <SelectItem key={ua.id} value={ua.id.toString()}>
                          {ua.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <FormLabel>Carrera</FormLabel>
                  <Select
                    onValueChange={(value) => setCarreraSeleccionada(parseInt(value))}
                    value={carreraSeleccionada?.toString() || ''}
                    disabled={unidadAcademicaSeleccionada === null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        unidadAcademicaSeleccionada === null
                          ? "Seleccione primero una Unidad Académica"
                          : "Seleccionar Carrera"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {carrerasFiltradas.map((carrera) => (
                        <SelectItem key={carrera.id} value={carrera.id.toString()}>
                          {carrera.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <CrudLayout
        title="Cursos"
        subtitle="Gestiona los cursos académicos de la institución"
        items={cursosFiltrados}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderForm={renderForm}
        showForm={showForm}
        icon={<BookOpen className="h-16 w-16 text-muted-foreground mb-4" />}
        formWidth="wide"
      />
      
      {/* Modal para editar especialidades */}
      <Dialog open={especialidadesDialog} onOpenChange={setEspecialidadesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Especialidades para el curso</DialogTitle>
            <DialogDescription>
              Selecciona qué especialidades pueden enseñar este curso
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="border rounded-md p-4 space-y-2 max-h-[300px] overflow-y-auto">
              {especialidades.map(esp => (
                <div key={esp.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`modal-esp-${esp.id}`}
                    checked={especialidadesSeleccionadas.includes(esp.id.toString())}
                    onCheckedChange={() => handleToggleEspecialidad(esp.id.toString())}
                  />
                  <label 
                    htmlFor={`modal-esp-${esp.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {esp.nombre} ({esp.codigo}) - {esp.area}
                  </label>
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Especialidades seleccionadas:</h4>
              <div className="flex flex-wrap gap-1">
                {especialidadesSeleccionadas.length > 0 ? (
                  especialidades
                    .filter(esp => especialidadesSeleccionadas.includes(esp.id.toString()))
                    .map(esp => (
                      <Badge key={esp.id} variant="secondary">{esp.nombre}</Badge>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay especialidades seleccionadas</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEspecialidadesDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEspecialidadesGuardar}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CursoPage;
