
// API models that reflect Django backend structure

// PeriodoAcademico model
export interface PeriodoAcademico {
  id: number;
  nombre_periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

// Unidad Académica model
export interface UnidadAcademica {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
}

// Carrera model
export interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  unidad_academica: number; // Foreign key to UnidadAcademica
  unidadAcademica?: UnidadAcademica; // Object relationship (frontend)
}

// Especialidad model
export interface Especialidad {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  area: string;
}

// Docente model
export interface Docente {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  estado: 'Activo' | 'Inactivo';
  especialidades?: Especialidad[]; // Many-to-many relationship
}

// Materia/Curso model
export interface Curso {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  creditos: number;
  horas_teoricas: number;
  horas_practicas: number;
  carrera: number; // Foreign key to Carrera
  carreraObj?: Carrera; // Object relationship (frontend)
  especialidades?: Especialidad[]; // Many-to-many relationship
}

// EspaciosFisicos/Aula model
export interface Aula {
  id: number;
  nombre: string;
  codigo: string;
  capacidad: number;
  tipo: string;
  edificio: string;
  piso: number;
  disponible: boolean;
}

// Grupo model from Django
export interface Grupo {
  grupo_id: number;
  codigo_grupo: string;
  materia: number; // Foreign key
  materiaObj?: Curso; // Object relationship (frontend)
  carrera: number;
  carreraObj?: Carrera;
  periodo: number;
  periodoObj?: PeriodoAcademico;
  numero_estudiantes_estimado?: number;
  turno_preferente?: 'M' | 'T' | 'N';
  docente_asignado_directamente?: number;
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
  docente: number; // Foreign key
  docenteObj?: Docente;
  periodo: number;
  periodoObj?: PeriodoAcademico;
  dia_semana: number;
  bloque_horario: number;
  bloqueObj?: BloqueHorario;
  esta_disponible: boolean;
  preferencia: number; // 0=Neutral, 1=Preferred, -1=Not preferred
}

// HorariosAsignados model
export interface HorarioAsignado {
  horario_id: number;
  grupo: number; // Foreign key
  grupoObj?: Grupo;
  docente: number;
  docenteObj?: Docente;
  espacio: number;
  espacioObj?: Aula;
  periodo: number;
  periodoObj?: PeriodoAcademico;
  dia_semana: number;
  bloque_horario: number;
  bloqueObj?: BloqueHorario;
  estado: 'Programado' | 'Confirmado' | 'Cancelado';
  observaciones?: string;
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
