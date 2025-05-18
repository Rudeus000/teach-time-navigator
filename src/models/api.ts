
// API models that reflect Django backend structure

// UnidadAcademica model
export interface UnidadAcademica {
  unidad_id: number;
  nombre_unidad: string;
  descripcion?: string;
}

// Carrera model
export interface Carrera {
  carrera_id: number;
  nombre_carrera: string;
  codigo_carrera?: string;
  horas_totales_curricula?: number;
  unidad: number; // Foreign key to UnidadAcademica
  unidad_nombre?: string; // Added from serializer
}

// PeriodoAcademico model
export interface PeriodoAcademico {
  periodo_id: number;
  nombre_periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

// TiposEspacio model
export interface TipoEspacio {
  tipo_espacio_id: number;
  nombre_tipo_espacio: string;
  descripcion?: string;
}

// EspaciosFisicos/Aula model
export interface Aula {
  espacio_id: number;
  nombre_espacio: string;
  tipo_espacio: number;
  tipo_espacio_nombre?: string;
  capacidad?: number;
  ubicacion?: string;
  recursos_adicionales?: string;
  unidad?: number;
  unidad_nombre?: string;
}

// Especialidades model
export interface Especialidad {
  especialidad_id: number;
  nombre_especialidad: string;
  descripcion?: string;
}

// Materias/Curso model
export interface Curso {
  materia_id: number;
  codigo_materia: string;
  nombre_materia: string;
  descripcion?: string;
  horas_academicas_teoricas: number;
  horas_academicas_practicas: number;
  horas_academicas_laboratorio: number;
  horas_totales?: number; // Read-only computed field
  requiere_tipo_espacio_especifico?: number;
  requiere_tipo_espacio_nombre?: string;
  estado: boolean;
  especialidades?: Especialidad[]; // Many-to-many relationship
}

// CarreraMaterias model
export interface CarreraMateria {
  id: number;
  carrera: number;
  carrera_nombre?: string;
  materia: number;
  materia_nombre?: string;
  materia_codigo?: string;
  ciclo_sugerido?: number;
}

// MateriaEspecialidadesRequeridas model
export interface MateriaEspecialidadRequerida {
  id: number;
  materia: number;
  materia_nombre?: string;
  especialidad: number;
  especialidad_nombre?: string;
}

// Roles model
export interface Rol {
  rol_id: number;
  nombre_rol: string;
}

// Docente model
export interface Docente {
  docente_id: number;
  usuario?: number;
  usuario_username?: string;
  codigo_docente?: string;
  nombres: string;
  apellidos: string;
  dni?: string;
  email: string;
  telefono: string;
  tipo_contrato?: string;
  max_horas_semanales?: number;
  unidad_principal?: number;
  unidad_principal_nombre?: string;
  especialidades?: Especialidad[]; // Many-to-many relationship
  especialidades_detalle?: Especialidad[]; // Serialized version
  estado?: 'Activo' | 'Inactivo'; // Not in the model but might be useful
}

// DocenteEspecialidades model
export interface DocenteEspecialidad {
  docente: number;
  especialidad: number;
  especialidad_id?: number;
  nombre_especialidad?: string;
}

// Grupo model
export interface Grupo {
  grupo_id: number;
  codigo_grupo: string;
  materia: number;
  carrera: number;
  periodo: number;
  numero_estudiantes_estimado?: number;
  turno_preferente?: 'M' | 'T' | 'N';
  docente_asignado_directamente?: number;
  // Additional frontend properties
  materiaObj?: Curso;
  carreraObj?: Carrera;
  periodoObj?: PeriodoAcademico;
  docenteObj?: Docente;
}

// BloquesHorariosDefinicion model
export interface BloqueHorario {
  bloque_def_id: number;
  nombre_bloque: string;
  hora_inicio: string;
  hora_fin: string;
  turno: 'M' | 'T' | 'N';
  dia_semana?: number; // Optional in the model
}

// DisponibilidadDocentes model
export interface DisponibilidadDocente {
  disponibilidad_id: number;
  docente: number;
  periodo: number;
  dia_semana: number;
  bloque_horario: number;
  esta_disponible: boolean;
  preferencia: number; // 0=Neutral, 1=Preferred, -1=Not preferred
  // Additional frontend properties
  docenteObj?: Docente;
  periodoObj?: PeriodoAcademico;
  bloqueObj?: BloqueHorario;
}

// HorariosAsignados model
export interface HorarioAsignado {
  horario_id: number;
  grupo: number;
  docente: number;
  espacio: number;
  periodo: number;
  dia_semana: number;
  bloque_horario: number;
  estado: 'Programado' | 'Confirmado' | 'Cancelado';
  observaciones?: string;
  // Additional frontend properties
  grupoObj?: Grupo;
  docenteObj?: Docente;
  espacioObj?: Aula;
  periodoObj?: PeriodoAcademico;
  bloqueObj?: BloqueHorario;
}

// ConfiguracionRestricciones model
export interface ConfiguracionRestriccion {
  restriccion_id: number;
  codigo_restriccion: string;
  descripcion: string;
  tipo_aplicacion: 'GLOBAL' | 'DOCENTE' | 'MATERIA' | 'AULA' | 'CARRERA' | 'PERIODO';
  entidad_id_1?: number;
  entidad_id_2?: number;
  valor_parametro?: string;
  periodo_aplicable?: number;
  esta_activa: boolean;
}

// Frontend model for generated schedule
export interface HorarioGenerado {
  id: number;
  nombre: string;
  fechaCreacion: string;
  estadoGeneracion: 'Completo' | 'Parcial' | 'Con Conflictos';
  conflictos: number;
  cursos: number;
  docentes: number;
  aulas: number;
  periodo: PeriodoAcademico;
  horarios?: HorarioAsignado[];
}

// User model for authentication
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  groups: Group[];
}

export interface Group {
  id: number;
  name: string;
}
