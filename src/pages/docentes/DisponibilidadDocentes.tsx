
import React, { useState, useEffect } from 'react';
import { CalendarDays, Users, Search, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Definir tipos
interface Docente {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  especialidad: string;
}

interface DisponibilidadItem {
  id: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  docenteId: number;
}

const diasSemana = [
  { id: 'LUNES', label: 'Lunes' },
  { id: 'MARTES', label: 'Martes' },
  { id: 'MIÉRCOLES', label: 'Miércoles' },
  { id: 'JUEVES', label: 'Jueves' },
  { id: 'VIERNES', label: 'Viernes' },
  { id: 'SÁBADO', label: 'Sábado' },
];

const DisponibilidadDocentesPage = () => {
  // Estados
  const [docentes, setDocentes] = useState<Docente[]>([
    { id: 1, nombres: 'Juan Carlos', apellidos: 'Pérez López', email: 'jperez@ejemplo.com', telefono: '555-1234', especialidad: 'Programación' },
    { id: 2, nombres: 'María Elena', apellidos: 'Gómez Rodríguez', email: 'mgomez@ejemplo.com', telefono: '555-5678', especialidad: 'Matemáticas' },
    { id: 3, nombres: 'Carlos Alberto', apellidos: 'López Ruiz', email: 'clopez@ejemplo.com', telefono: '555-9012', especialidad: 'Bases de Datos' },
  ]);
  
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadItem[]>([
    { id: '1', diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '10:00', docenteId: 1 },
    { id: '2', diaSemana: 'LUNES', horaInicio: '14:00', horaFin: '16:00', docenteId: 1 },
    { id: '3', diaSemana: 'MARTES', horaInicio: '10:00', horaFin: '12:00', docenteId: 1 },
    { id: '4', diaSemana: 'MIÉRCOLES', horaInicio: '09:00', horaFin: '12:00', docenteId: 2 },
    { id: '5', diaSemana: 'JUEVES', horaInicio: '14:00', horaFin: '18:00', docenteId: 2 },
    { id: '6', diaSemana: 'VIERNES', horaInicio: '08:00', horaFin: '12:00', docenteId: 3 },
  ]);
  
  const [search, setSearch] = useState('');
  const [filterDocenteId, setFilterDocenteId] = useState<string>('');
  const [filterDia, setFilterDia] = useState<string>('');
  const [activeTab, setActiveTab] = useState('lista');
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  
  // Filtrar docentes por búsqueda
  const filteredDocentes = docentes.filter(docente => {
    const fullName = `${docente.nombres} ${docente.apellidos}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) ||
           docente.email.toLowerCase().includes(search.toLowerCase()) ||
           docente.especialidad.toLowerCase().includes(search.toLowerCase());
  });
  
  // Filtrar disponibilidades
  const filteredDisponibilidades = disponibilidades.filter(disp => {
    if (filterDocenteId && parseInt(filterDocenteId) !== disp.docenteId) return false;
    if (filterDia && disp.diaSemana !== filterDia) return false;
    return true;
  });
  
  // Agrupar disponibilidades por docente para mostrar en tarjetas
  const disponibilidadesPorDocente: Record<number, DisponibilidadItem[]> = {};
  disponibilidades.forEach(disp => {
    if (!disponibilidadesPorDocente[disp.docenteId]) {
      disponibilidadesPorDocente[disp.docenteId] = [];
    }
    disponibilidadesPorDocente[disp.docenteId].push(disp);
  });
  
  // Mostrar el detalle de disponibilidad de un docente
  const showDocenteDetail = (docente: Docente) => {
    setSelectedDocente(docente);
    setActiveTab('detalle');
  };
  
  // Agrupar disponibilidades por día para la vista de detalle
  const getDisponibilidadesPorDia = (docenteId: number) => {
    const disponibilidadesDocente = disponibilidades.filter(disp => disp.docenteId === docenteId);
    const porDia: Record<string, DisponibilidadItem[]> = {};
    
    diasSemana.forEach(dia => {
      porDia[dia.id] = disponibilidadesDocente.filter(disp => disp.diaSemana === dia.id);
    });
    
    return porDia;
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-2">Disponibilidad de Docentes</h2>
          <p className="text-muted-foreground">
            Consulta los horarios de disponibilidad de todos los docentes
          </p>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="lista">Lista de Docentes</TabsTrigger>
              <TabsTrigger value="calendario">Vista de Calendario</TabsTrigger>
              {selectedDocente && (
                <TabsTrigger value="detalle">Detalle de Docente</TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="lista" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <Input 
                      placeholder="Buscar docentes por nombre, email o especialidad" 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full"
                      icon={<Search className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocentes.map(docente => (
                    <Card key={docente.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg truncate">{docente.nombres} {docente.apellidos}</CardTitle>
                        <CardDescription className="truncate">{docente.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm mb-3">
                          <p>Especialidad: <span className="font-medium">{docente.especialidad}</span></p>
                          <p>Teléfono: <span className="font-medium">{docente.telefono}</span></p>
                          <p className="mt-2">
                            <strong>{disponibilidadesPorDocente[docente.id]?.length || 0}</strong> bloques de disponibilidad
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => showDocenteDetail(docente)}
                        >
                          <CalendarDays className="h-4 w-4 mr-2" />
                          Ver Disponibilidad
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filteredDocentes.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No se encontraron docentes</h3>
                    <p className="mt-2 text-muted-foreground">
                      Intente con otros términos de búsqueda
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendario" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <CardTitle>Calendario de Disponibilidad</CardTitle>
                  <div className="flex gap-4">
                    <Select 
                      value={filterDocenteId} 
                      onValueChange={setFilterDocenteId}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Todos los docentes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los docentes</SelectItem>
                        {docentes.map(docente => (
                          <SelectItem key={docente.id} value={docente.id.toString()}>
                            {docente.nombres} {docente.apellidos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={filterDia} 
                      onValueChange={setFilterDia}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Todos los días" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los días</SelectItem>
                        {diasSemana.map(dia => (
                          <SelectItem key={dia.id} value={dia.id}>{dia.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                  {diasSemana.map((dia, index) => (
                    <motion.div 
                      key={dia.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="col-span-1"
                    >
                      <Card className="h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{dia.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {filteredDisponibilidades
                              .filter(disp => disp.diaSemana === dia.id)
                              .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                              .map(disp => {
                                const docente = docentes.find(d => d.id === disp.docenteId);
                                return (
                                  <Card key={disp.id} className="p-3 bg-muted/30">
                                    <div className="font-medium text-sm truncate">
                                      {docente?.nombres} {docente?.apellidos}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 flex gap-2 items-center">
                                      <Clock className="h-3 w-3" />
                                      <span>{disp.horaInicio} - {disp.horaFin}</span>
                                    </div>
                                  </Card>
                                );
                              })}
                              
                            {filteredDisponibilidades.filter(disp => disp.diaSemana === dia.id).length === 0 && (
                              <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
                                <CalendarDays className="h-8 w-8 mb-2" />
                                <p className="text-sm">No hay disponibilidad</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="detalle" className="mt-4">
            {selectedDocente && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">
                    {selectedDocente.nombres} {selectedDocente.apellidos}
                  </h3>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab('lista');
                      setSelectedDocente(null);
                    }}
                  >
                    Volver a Lista
                  </Button>
                </div>
                
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedDocente.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{selectedDocente.telefono}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Especialidad</p>
                        <p className="font-medium">{selectedDocente.especialidad}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <h4 className="text-lg font-medium mb-3">Disponibilidad semanal</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(getDisponibilidadesPorDia(selectedDocente.id)).map(([dia, disponibilidadesDia]) => {
                    const diaLabel = diasSemana.find(d => d.id === dia)?.label;
                    return (
                      <Card key={dia} className={disponibilidadesDia.length === 0 ? 'opacity-50' : ''}>
                        <CardHeader>
                          <CardTitle className="text-lg">{diaLabel}</CardTitle>
                          <CardDescription>
                            {disponibilidadesDia.length} {disponibilidadesDia.length === 1 ? 'bloque' : 'bloques'} disponibles
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {disponibilidadesDia.length > 0 ? (
                            <ul className="space-y-2">
                              {disponibilidadesDia.map(disp => (
                                <li key={disp.id} className="p-2 bg-secondary/50 rounded flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{disp.horaInicio} - {disp.horaFin}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
                              <p className="text-sm">No hay disponibilidad</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DisponibilidadDocentesPage;
