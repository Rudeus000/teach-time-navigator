
import React, { useState, useEffect } from 'react';
import { CalendarDays, Users, Search, Clock, Plus, Check, X, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Docente, DisponibilidadDocente, BloqueHorario, PeriodoAcademico } from '@/models/api';
import DisponibilidadService from '@/services/DisponibilidadService';
import { mapDayNumberToName, formatTime } from '@/lib/dateUtils';

const DisponibilidadDocentesPage = () => {
  // Estado para la UI
  const [search, setSearch] = useState('');
  const [filterDocenteId, setFilterDocenteId] = useState<string>('');
  const [filterDia, setFilterDia] = useState<string>('');
  const [activeTab, setActiveTab] = useState('lista');
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<number | null>(null);

  // Estado para la edición de disponibilidad
  const [editMode, setEditMode] = useState(false);
  const [selectedBloques, setSelectedBloques] = useState<{[key: string]: boolean}>({});
  
  // Obtener períodos académicos activos
  const { 
    data: periodos = [],
    isLoading: isLoadingPeriodos
  } = useQuery({
    queryKey: ['periodos-academicos'],
    queryFn: DisponibilidadService.getPeriodosActivos,
    onSuccess: (data) => {
      if (data.length > 0 && !selectedPeriodo) {
        setSelectedPeriodo(data[0].periodo_id);
      }
    }
  });

  // Obtener bloques horarios
  const { 
    data: bloquesHorarios = [],
    isLoading: isLoadingBloques 
  } = useQuery({
    queryKey: ['bloques-horarios'],
    queryFn: DisponibilidadService.getBloqueHorarios,
  });
  
  // Consulta para obtener docentes (simulado hasta que se conecte al backend real)
  const { 
    data: docentes = [],
    isLoading: isLoadingDocentes 
  } = useQuery({
    queryKey: ['docentes'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/users/docentes/');
        return response.data;
      } catch (error) {
        console.error('Error fetching docentes:', error);
        return [];
      }
    },
    enabled: !!selectedPeriodo,
  });

  // Consulta para obtener disponibilidades de docentes
  const { 
    data: disponibilidades = [],
    isLoading: isLoadingDisponibilidades,
    refetch: refetchDisponibilidades
  } = useQuery({
    queryKey: ['disponibilidades', selectedPeriodo],
    queryFn: async () => {
      if (!selectedPeriodo) return [];
      return DisponibilidadService.getAllDocentesDisponibilidad(selectedPeriodo);
    },
    enabled: !!selectedPeriodo,
  });

  // Consulta para obtener disponibilidades específicas de un docente
  const {
    data: docenteDisponibilidades = [],
    isLoading: isLoadingDocenteDisponibilidad,
    refetch: refetchDocenteDisponibilidad
  } = useQuery({
    queryKey: ['docente-disponibilidad', selectedDocente?.docente_id, selectedPeriodo],
    queryFn: async () => {
      if (!selectedDocente?.docente_id || !selectedPeriodo) return [];
      return DisponibilidadService.getDisponibilidadDocente(
        selectedDocente.docente_id,
        selectedPeriodo
      );
    },
    enabled: !!selectedDocente?.docente_id && !!selectedPeriodo,
  });

  // Efecto para manejar los bloques seleccionados cuando cambia el docente o sus disponibilidades
  useEffect(() => {
    if (docenteDisponibilidades.length) {
      const newSelectedBloques: {[key: string]: boolean} = {};
      
      docenteDisponibilidades.forEach((disp) => {
        const key = `${disp.dia_semana}-${disp.bloque_horario}`;
        newSelectedBloques[key] = disp.esta_disponible;
      });
      
      setSelectedBloques(newSelectedBloques);
    } else {
      setSelectedBloques({});
    }
  }, [docenteDisponibilidades]);
  
  // Filtrar docentes por búsqueda
  const filteredDocentes = docentes.filter((docente: Docente) => {
    const fullName = `${docente.nombres} ${docente.apellidos}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) ||
           docente.email?.toLowerCase().includes(search.toLowerCase());
  });
  
  // Filtrar disponibilidades
  const filteredDisponibilidades = disponibilidades.filter((disp: DisponibilidadDocente) => {
    if (filterDocenteId && parseInt(filterDocenteId) !== disp.docente) return false;
    if (filterDia && parseInt(filterDia) !== disp.dia_semana) return false;
    return true;
  });
  
  // Organizar bloques horarios por turno y día
  const bloquesPorTurno: {[key: string]: BloqueHorario[]} = {};
  bloquesHorarios.forEach((bloque: BloqueHorario) => {
    if (!bloquesPorTurno[bloque.turno]) {
      bloquesPorTurno[bloque.turno] = [];
    }
    bloquesPorTurno[bloque.turno].push(bloque);
  });

  // Agrupar disponibilidades por docente para mostrar en tarjetas
  const disponibilidadesPorDocente: Record<number, DisponibilidadDocente[]> = {};
  disponibilidades.forEach((disp: DisponibilidadDocente) => {
    if (!disponibilidadesPorDocente[disp.docente]) {
      disponibilidadesPorDocente[disp.docente] = [];
    }
    disponibilidadesPorDocente[disp.docente].push(disp);
  });
  
  // Mostrar el detalle de disponibilidad de un docente
  const showDocenteDetail = (docente: Docente) => {
    setSelectedDocente(docente);
    setActiveTab('detalle');
  };
  
  // Obtener bloque horario por id
  const getBloqueHorario = (bloqueId: number) => {
    return bloquesHorarios.find((b: BloqueHorario) => b.bloque_def_id === bloqueId);
  };

  // Organizar bloques horarios por día para la vista detalle
  const getBloquesPorDia = () => {
    // Días de la semana (Lunes a Sábado)
    const dias = [1, 2, 3, 4, 5, 6]; // Django: 1=Lunes hasta 6=Sábado
    
    // Crear estructura de datos para organizar bloques por día
    const bloquesPorDia: {[key: number]: BloqueHorario[]} = {};
    dias.forEach(dia => {
      bloquesPorDia[dia] = bloquesHorarios.filter(b => b.dia_semana === dia);
    });
    
    return bloquesPorDia;
  };
  
  // Cambiar estado de disponibilidad de un bloque
  const toggleBloqueDisponibilidad = (dia: number, bloqueId: number) => {
    const key = `${dia}-${bloqueId}`;
    setSelectedBloques(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Guardar cambios de disponibilidad
  const saveDisponibilidad = async () => {
    if (!selectedDocente || !selectedPeriodo) return;
    
    try {
      // Para cada bloque seleccionado, crear o actualizar la disponibilidad
      const promises = Object.entries(selectedBloques).map(async ([key, estaDisponible]) => {
        const [diaStr, bloqueStr] = key.split('-');
        const dia = parseInt(diaStr);
        const bloqueId = parseInt(bloqueStr);
        
        // Buscar si ya existe esta disponibilidad
        const existingDisp = docenteDisponibilidades.find(
          d => d.dia_semana === dia && d.bloque_horario === bloqueId
        );
        
        // Si existe, actualizar; si no, crear
        return DisponibilidadService.saveDisponibilidad({
          disponibilidad_id: existingDisp?.disponibilidad_id,
          docente: selectedDocente.docente_id,
          periodo: selectedPeriodo,
          dia_semana: dia,
          bloque_horario: bloqueId,
          esta_disponible: estaDisponible
        });
      });
      
      await Promise.all(promises);
      
      toast.success('Disponibilidad guardada correctamente');
      setEditMode(false);
      refetchDocenteDisponibilidad();
      refetchDisponibilidades();
    } catch (error) {
      toast.error('Error al guardar la disponibilidad');
      console.error('Error guardando disponibilidad:', error);
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    // Restaurar estado original desde docenteDisponibilidades
    const originalBloques: {[key: string]: boolean} = {};
    docenteDisponibilidades.forEach((disp) => {
      const key = `${disp.dia_semana}-${disp.bloque_horario}`;
      originalBloques[key] = disp.esta_disponible;
    });
    setSelectedBloques(originalBloques);
    setEditMode(false);
  };

  // Verificar si un bloque está disponible
  const isBloqueDisponible = (dia: number, bloqueId: number) => {
    const key = `${dia}-${bloqueId}`;
    return !!selectedBloques[key];
  };
  
  // Verificar si hay disponibilidad para un día
  const hayDisponibilidadParaDia = (dia: number) => {
    return Object.keys(selectedBloques).some(key => {
      const [diaStr] = key.split('-');
      return parseInt(diaStr) === dia && selectedBloques[key];
    });
  };

  // Renderizar espacio reservado mientras carga
  const renderLoading = () => (
    <div className="w-full py-10">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mt-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );

  // Renderizar vista del calendario para editar disponibilidad
  const renderCalendarioEdicion = () => {
    const bloquesPorDia = getBloquesPorDia();
    const dias = [1, 2, 3, 4, 5, 6]; // Lunes a Sábado
    
    return (
      <div>
        <div className="grid grid-cols-6 gap-4 mt-6">
          {dias.map(dia => (
            <Card key={dia} className="col-span-1">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg">{mapDayNumberToName(dia)}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-2">
                  {bloquesPorDia[dia]?.map(bloque => {
                    const isDisponible = isBloqueDisponible(dia, bloque.bloque_def_id);
                    return (
                      <div 
                        key={bloque.bloque_def_id}
                        onClick={() => toggleBloqueDisponibilidad(dia, bloque.bloque_def_id)}
                        className={`p-2 rounded-md flex items-center justify-between cursor-pointer transition-colors ${
                          isDisponible 
                            ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40' 
                            : 'bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/60'
                        }`}
                      >
                        <div className="text-sm">
                          {formatTime(bloque.hora_inicio)} - {formatTime(bloque.hora_fin)}
                        </div>
                        <div>
                          {isDisponible ? (
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {!bloquesPorDia[dia]?.length && (
                    <div className="text-center p-4 text-muted-foreground text-sm">
                      No hay bloques definidos
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline"
            onClick={cancelEdit}
          >
            Cancelar
          </Button>
          <Button 
            onClick={saveDisponibilidad}
          >
            Guardar disponibilidad
          </Button>
        </div>
      </div>
    );
  };

  // Renderizar vista del calendario para ver disponibilidad
  const renderCalendarioVisualizacion = () => {
    const bloquesPorDia = getBloquesPorDia();
    const dias = [1, 2, 3, 4, 5, 6]; // Lunes a Sábado
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dias.map(dia => {
          const tieneDisponibilidad = hayDisponibilidadParaDia(dia);
          return (
            <Card key={dia} className={!tieneDisponibilidad ? 'opacity-50' : ''}>
              <CardHeader>
                <CardTitle className="text-lg">{mapDayNumberToName(dia)}</CardTitle>
                <CardDescription>
                  {docenteDisponibilidades.filter(d => 
                    d.dia_semana === dia && d.esta_disponible
                  ).length} bloques disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {docenteDisponibilidades.filter(d => 
                  d.dia_semana === dia && d.esta_disponible
                ).length > 0 ? (
                  <ul className="space-y-2">
                    {docenteDisponibilidades
                      .filter(d => d.dia_semana === dia && d.esta_disponible)
                      .map(disp => {
                        const bloque = getBloqueHorario(disp.bloque_horario);
                        return (
                          <li key={disp.disponibilidad_id} className="p-2 bg-secondary/50 rounded flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {bloque 
                                ? `${formatTime(bloque.hora_inicio)} - ${formatTime(bloque.hora_fin)}`
                                : 'Horario no definido'}
                            </span>
                          </li>
                        );
                      })}
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
    );
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
        
        {/* Selector de periodo */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Select 
              value={selectedPeriodo?.toString() || ''} 
              onValueChange={(value) => setSelectedPeriodo(parseInt(value))}
              disabled={isLoadingPeriodos}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar período académico" />
              </SelectTrigger>
              <SelectContent>
                {periodos.map((periodo: PeriodoAcademico) => (
                  <SelectItem 
                    key={periodo.periodo_id} 
                    value={periodo.periodo_id.toString()}
                  >
                    {periodo.nombre_periodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
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
                      placeholder="Buscar docentes por nombre o email" 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDocentes ? (
                  renderLoading()
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocentes.map((docente: Docente) => (
                      <Card key={docente.docente_id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg truncate">{docente.nombres} {docente.apellidos}</CardTitle>
                          <CardDescription className="truncate">{docente.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm mb-3">
                            <p>Teléfono: <span className="font-medium">{docente.telefono || 'No disponible'}</span></p>
                            <p className="mt-2">
                              <strong>
                                {disponibilidadesPorDocente[docente.docente_id]?.filter(d => d.esta_disponible).length || 0}
                              </strong> bloques de disponibilidad
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
                )}
                
                {filteredDocentes.length === 0 && !isLoadingDocentes && (
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
                        {docentes.map((docente: Docente) => (
                          <SelectItem key={docente.docente_id} value={docente.docente_id.toString()}>
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
                        {[1, 2, 3, 4, 5, 6].map(dia => (
                          <SelectItem key={dia} value={dia.toString()}>
                            {mapDayNumberToName(dia)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDisponibilidades ? (
                  renderLoading()
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((dia, index) => (
                      <motion.div 
                        key={dia}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="col-span-1"
                      >
                        <Card className="h-full">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{mapDayNumberToName(dia)}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {filteredDisponibilidades
                                .filter(disp => disp.dia_semana === dia && disp.esta_disponible)
                                .sort((a, b) => {
                                  // Ordenar por hora de inicio si se tienen los datos de los bloques
                                  const bloqueA = getBloqueHorario(a.bloque_horario);
                                  const bloqueB = getBloqueHorario(b.bloque_horario);
                                  if (bloqueA && bloqueB) {
                                    return bloqueA.hora_inicio.localeCompare(bloqueB.hora_inicio);
                                  }
                                  return 0;
                                })
                                .map(disp => {
                                  const bloque = getBloqueHorario(disp.bloque_horario);
                                  const docente = docentes.find(d => d.docente_id === disp.docente);
                                  
                                  return (
                                    <Card key={disp.disponibilidad_id} className="p-3 bg-muted/30">
                                      <div className="font-medium text-sm truncate">
                                        {docente ? `${docente.nombres} ${docente.apellidos}` : 'Docente desconocido'}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1 flex gap-2 items-center">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {bloque 
                                            ? `${formatTime(bloque.hora_inicio)} - ${formatTime(bloque.hora_fin)}`
                                            : 'Horario no definido'}
                                        </span>
                                      </div>
                                    </Card>
                                  );
                                })}
                                
                              {filteredDisponibilidades.filter(disp => 
                                disp.dia_semana === dia && disp.esta_disponible
                              ).length === 0 && (
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
                )}
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
                  <div className="flex gap-2">
                    {!editMode ? (
                      <Button 
                        variant="outline"
                        onClick={() => setEditMode(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Editar disponibilidad
                      </Button>
                    ) : null}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setActiveTab('lista');
                        setSelectedDocente(null);
                        setEditMode(false);
                      }}
                    >
                      Volver a Lista
                    </Button>
                  </div>
                </div>
                
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedDocente.email || 'No disponible'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{selectedDocente.telefono || 'No disponible'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo contrato</p>
                        <p className="font-medium">{selectedDocente.tipo_contrato || 'No especificado'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <h4 className="text-lg font-medium mb-3">Disponibilidad semanal</h4>
                
                {isLoadingDocenteDisponibilidad ? (
                  renderLoading()
                ) : (
                  <>
                    {!editMode ? (
                      renderCalendarioVisualizacion()
                    ) : (
                      renderCalendarioEdicion()
                    )}
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DisponibilidadDocentesPage;
