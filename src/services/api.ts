
import axios from '@/lib/axios';
import { 
  UnidadAcademica, 
  Carrera, 
  Curso, 
  Docente, 
  Especialidad, 
  PeriodoAcademico, 
  Aula, 
  Grupo, 
  HorarioAsignado, 
  DisponibilidadDocente,
  BloqueHorario, 
  MateriaEspecialidadRequerida
} from '@/models/api';

/**
 * Service to handle API calls to the backend
 */
export class ApiService {
  // UnidadAcademica
  static async getUnidadesAcademicas(): Promise<UnidadAcademica[]> {
    const response = await axios.get('/api/academic/unidades-academicas/');
    return response.data;
  }

  static async getUnidadAcademica(id: number): Promise<UnidadAcademica> {
    const response = await axios.get(`/api/academic/unidades-academicas/${id}/`);
    return response.data;
  }

  // Carrera
  static async getCarreras(unidadId?: number): Promise<Carrera[]> {
    const url = unidadId 
      ? `/api/academic/carreras/?unidad=${unidadId}`
      : '/api/academic/carreras/';
    const response = await axios.get(url);
    return response.data;
  }

  static async getCarrera(id: number): Promise<Carrera> {
    const response = await axios.get(`/api/academic/carreras/${id}/`);
    return response.data;
  }

  // Curso/Materia
  static async getCursos(carreraId?: number): Promise<Curso[]> {
    if (carreraId) {
      // CarreraMaterias contains the relationship between carrera and materia
      const response = await axios.get(`/api/academic/carrera-materias/?carrera=${carreraId}`);
      // Get the materia ids from the response
      const materiaIds = response.data.map((item: any) => item.materia);
      
      // Get the details of each materia
      const materias = await Promise.all(
        materiaIds.map(async (id: number) => {
          const materiaResponse = await axios.get(`/api/academic/materias/${id}/`);
          return materiaResponse.data;
        })
      );
      
      return materias;
    } else {
      const response = await axios.get('/api/academic/materias/');
      return response.data;
    }
  }

  static async getCurso(id: number): Promise<Curso> {
    const response = await axios.get(`/api/academic/materias/${id}/`);
    return response.data;
  }

  // Especialidades
  static async getEspecialidades(): Promise<Especialidad[]> {
    const response = await axios.get('/api/academic/especialidades/');
    return response.data;
  }

  static async getEspecialidad(id: number): Promise<Especialidad> {
    const response = await axios.get(`/api/academic/especialidades/${id}/`);
    return response.data;
  }

  // Docentes
  static async getDocentes(): Promise<Docente[]> {
    const response = await axios.get('/api/users/docentes/');
    return response.data;
  }

  static async getDocente(id: number): Promise<Docente> {
    const response = await axios.get(`/api/users/docentes/${id}/`);
    return response.data;
  }

  // Periodos
  static async getPeriodosAcademicos(): Promise<PeriodoAcademico[]> {
    const response = await axios.get('/api/academic/periodos-academicos/');
    return response.data;
  }

  // Aulas / Espacios físicos
  static async getAulas(): Promise<Aula[]> {
    const response = await axios.get('/api/academic/espacios-fisicos/');
    return response.data;
  }

  // Grupos
  static async getGrupos(periodoId?: number): Promise<Grupo[]> {
    const url = periodoId 
      ? `/api/scheduling/grupos/?periodo=${periodoId}`
      : '/api/scheduling/grupos/';
    const response = await axios.get(url);
    return response.data;
  }

  // Horarios
  static async getHorarios(periodoId?: number): Promise<HorarioAsignado[]> {
    const url = periodoId 
      ? `/api/scheduling/horarios-asignados/?periodo=${periodoId}`
      : '/api/scheduling/horarios-asignados/';
    const response = await axios.get(url);
    return response.data;
  }

  // Bloques horarios
  static async getBloquesHorarios(): Promise<BloqueHorario[]> {
    const response = await axios.get('/api/scheduling/bloques-horarios/');
    return response.data;
  }

  // Disponibilidad docentes
  static async getDisponibilidadDocentes(docenteId: number, periodoId: number): Promise<DisponibilidadDocente[]> {
    const response = await axios.get(`/api/scheduling/disponibilidad-docentes/?docente=${docenteId}&periodo=${periodoId}`);
    return response.data;
  }

  // Especialidades requeridas por curso
  static async getEspecialidadesRequeridasPorCurso(cursoId: number): Promise<MateriaEspecialidadRequerida[]> {
    const response = await axios.get(`/api/academic/materia-especialidades-requeridas/?materia=${cursoId}`);
    return response.data;
  }

  // Generar horario
  static async generarHorarioAutomatico(periodoId: number): Promise<any> {
    const response = await axios.post('/api/scheduling/acciones-horario/generar-horario-automatico/', {
      periodo_id: periodoId
    });
    return response.data;
  }
}

export default ApiService;
