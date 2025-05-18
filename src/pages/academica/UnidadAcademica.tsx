
import React, { useState } from 'react';
import { Building2, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { CrudLayout } from '@/components/crud/CrudLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UnidadAcademica {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
}

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  duracion: number;
  unidadAcademicaId: number;
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
  const navigate = useNavigate();
  
  // Estado para los datos
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([
    { id: 1, nombre: 'Facultad de Ingeniería', codigo: 'FI', descripcion: 'Facultad de ingeniería y ciencias' },
    { id: 2, nombre: 'Facultad de Economía', codigo: 'FE', descripcion: 'Facultad de economía y negocios' },
    { id: 3, nombre: 'Facultad de Humanidades', codigo: 'FH', descripcion: 'Facultad de humanidades y ciencias sociales' },
  ]);

  const [carreras, setCarreras] = useState<Carrera[]>([
    { id: 1, nombre: 'Ingeniería de Software', codigo: 'IS', descripcion: 'Carrera de ingeniería de software', duracion: 10, unidadAcademicaId: 1 },
    { id: 2, nombre: 'Ingeniería Civil', codigo: 'IC', descripcion: 'Carrera de ingeniería civil', duracion: 10, unidadAcademicaId: 1 },
    { id: 3, nombre: 'Administración de Empresas', codigo: 'AE', descripcion: 'Carrera de administración', duracion: 8, unidadAcademicaId: 2 },
    { id: 4, nombre: 'Contabilidad', codigo: 'CO', descripcion: 'Carrera de contabilidad', duracion: 8, unidadAcademicaId: 2 },
    { id: 5, nombre: 'Psicología', codigo: 'PS', descripcion: 'Carrera de psicología', duracion: 10, unidadAcademicaId: 3 },
  ]);

  const [cursos, setCursos] = useState<Curso[]>([
    { id: 1, nombre: 'Algoritmos y Estructuras de Datos', codigo: 'AED', descripcion: 'Curso de algoritmos', creditos: 4, horasTeoricas: 2, horasPracticas: 4, carreraId: 1 },
    { id: 2, nombre: 'Bases de Datos', codigo: 'BD', descripcion: 'Curso de bases de datos', creditos: 3, horasTeoricas: 2, horasPracticas: 2, carreraId: 1 },
    { id: 3, nombre: 'Estructuras', codigo: 'EST', descripcion: 'Curso de estructuras', creditos: 4, horasTeoricas: 3, horasPracticas: 2, carreraId: 2 },
    { id: 4, nombre: 'Administración General', codigo: 'ADM', descripcion: 'Curso de administración', creditos: 3, horasTeoricas: 3, horasPracticas: 0, carreraId: 3 },
    { id: 5, nombre: 'Contabilidad Básica', codigo: 'CONT', descripcion: 'Curso de contabilidad', creditos: 3, horasTeoricas: 2, horasPracticas: 2, carreraId: 4 },
    { id: 6, nombre: 'Psicología General', codigo: 'PSG', descripcion: 'Curso de psicología general', creditos: 3, horasTeoricas: 3, horasPracticas: 0, carreraId: 5 },
  ]);
  
  // Estado para controlar el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedUnidadAcademica, setSelectedUnidadAcademica] = useState<UnidadAcademica | null>(null);
  const [selectedCarrera, setSelectedCarrera] = useState<Carrera | null>(null);
  const [activeTab, setActiveTab] = useState<string>("unidades");

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
        item.id === editingId ? { 
          id: editingId, 
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion || ''
        } : item
      ));
      toast.success(`Unidad académica actualizada`);
    } else {
      // Crear nuevo
      const newItem: UnidadAcademica = {
        nombre: data.nombre,
        codigo: data.codigo,
        descripcion: data.descripcion || '',
        id: Math.max(0, ...unidadesAcademicas.map(u => u.id)) + 1,
      };
      setUnidadesAcademicas([...unidadesAcademicas, newItem]);
      toast.success(`Nueva unidad académica creada`);
    }
    
    setShowForm(false);
    form.reset();
  };

  const handleUnidadClick = (unidad: UnidadAcademica) => {
    setSelectedUnidadAcademica(unidad);
    setSelectedCarrera(null);
    setActiveTab("carreras");
  };

  const handleCarreraClick = (carrera: Carrera) => {
    setSelectedCarrera(carrera);
    setActiveTab("cursos");
  };

  const handleBackToUnidades = () => {
    setSelectedUnidadAcademica(null);
    setSelectedCarrera(null);
    setActiveTab("unidades");
  };

  const handleBackToCarreras = () => {
    setSelectedCarrera(null);
    setActiveTab("carreras");
  };

  // Filtrar carreras por unidad académica
  const filteredCarreras = selectedUnidadAcademica 
    ? carreras.filter(carrera => carrera.unidadAcademicaId === selectedUnidadAcademica.id) 
    : [];

  // Filtrar cursos por carrera
  const filteredCursos = selectedCarrera 
    ? cursos.filter(curso => curso.carreraId === selectedCarrera.id) 
    : [];

  // Columnas para las tablas
  const columnasUnidades = [
    { header: 'Código', accessor: 'codigo' as keyof UnidadAcademica },
    { header: 'Nombre', accessor: 'nombre' as keyof UnidadAcademica },
    { header: 'Descripción', accessor: 'descripcion' as keyof UnidadAcademica },
  ];

  const columnasCarreras = [
    { header: 'Código', accessor: 'codigo' as keyof Carrera },
    { header: 'Nombre', accessor: 'nombre' as keyof Carrera },
    { header: 'Duración', accessor: (item: Carrera) => `${item.duracion} semestres` },
    { header: 'Descripción', accessor: 'descripcion' as keyof Carrera },
  ];

  const columnasCursos = [
    { header: 'Código', accessor: 'codigo' as keyof Curso },
    { header: 'Nombre', accessor: 'nombre' as keyof Curso },
    { header: 'Créditos', accessor: 'creditos' as keyof Curso },
    { header: 'Horas', accessor: (item: Curso) => `T: ${item.horasTeoricas} | P: ${item.horasPracticas}` },
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
    <div className="container mx-auto">
      <Tabs 
        defaultValue="unidades" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="unidades" disabled={false}>Unidades Académicas</TabsTrigger>
            <TabsTrigger value="carreras" disabled={selectedUnidadAcademica === null}>Carreras</TabsTrigger>
            <TabsTrigger value="cursos" disabled={selectedCarrera === null}>Cursos</TabsTrigger>
          </TabsList>

          {activeTab === "unidades" && (
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> 
              Agregar Unidad Académica
            </Button>
          )}
        </div>

        <TabsContent value="unidades">
          <CrudLayout
            title="Unidades Académicas"
            subtitle="Seleccione una unidad académica para ver sus carreras"
            items={unidadesAcademicas}
            columns={columnasUnidades}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            renderForm={renderForm}
            showForm={showForm}
            icon={<Building2 className="h-16 w-16 text-muted-foreground mb-4" />}
            onItemClick={handleUnidadClick}
          />
        </TabsContent>

        <TabsContent value="carreras">
          {selectedUnidadAcademica && (
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      <span className="text-sm text-muted-foreground">Unidad Académica:</span> 
                      <span className="ml-2 text-primary">{selectedUnidadAcademica.codigo} - {selectedUnidadAcademica.nombre}</span>
                    </CardTitle>
                    <Button variant="outline" onClick={handleBackToUnidades}>
                      Volver a Unidades Académicas
                    </Button>
                  </div>
                </CardHeader>
              </Card>
              
              <CrudLayout
                title="Carreras"
                subtitle={`Carreras relacionadas a ${selectedUnidadAcademica.nombre}`}
                items={filteredCarreras}
                columns={columnasCarreras}
                onAdd={() => navigate('/carreras')}
                onEdit={() => navigate('/carreras')}
                onDelete={() => {}}
                renderForm={<div />}
                showForm={false}
                icon={<GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />}
                onItemClick={handleCarreraClick}
                readOnly={true}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="cursos">
          {selectedUnidadAcademica && selectedCarrera && (
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex gap-2 items-center">
                        <span className="text-sm text-muted-foreground">Unidad Académica:</span> 
                        <span className="text-primary">{selectedUnidadAcademica.codigo} - {selectedUnidadAcademica.nombre}</span>
                      </CardTitle>
                      <CardTitle className="flex gap-2 items-center mt-2">
                        <span className="text-sm text-muted-foreground">Carrera:</span> 
                        <span className="text-primary">{selectedCarrera.codigo} - {selectedCarrera.nombre}</span>
                      </CardTitle>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" onClick={handleBackToCarreras} className="w-full">
                        Volver a Carreras
                      </Button>
                      <Button variant="outline" onClick={handleBackToUnidades} className="w-full">
                        Volver a Unidades Académicas
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              
              <CrudLayout
                title="Cursos"
                subtitle={`Cursos relacionados a ${selectedCarrera.nombre}`}
                items={filteredCursos}
                columns={columnasCursos}
                onAdd={() => navigate('/cursos')}
                onEdit={() => navigate('/cursos')}
                onDelete={() => {}}
                renderForm={<div />}
                showForm={false}
                icon={<BookOpen className="h-16 w-16 text-muted-foreground mb-4" />}
                readOnly={true}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnidadAcademicaPage;
