
import { Docente, Especialidad, Curso } from '@/models/api';
import axios from '@/lib/axios';

/**
 * Service to handle specialty assignments and validations
 */
export class DocenteEspecialidadService {
  /**
   * Check if a docente can teach a specific course
   * @param docente The docente to check
   * @param curso The course to check
   * @returns True if the docente can teach the course, false otherwise
   */
  static puedeEnsenyarCurso(docente: Docente, curso: Curso): boolean {
    // If the course doesn't have specialties required, anyone can teach it
    if (!curso.especialidades || curso.especialidades.length === 0) {
      return true;
    }

    // If the docente doesn't have specialties, they can't teach courses requiring specialties
    if (!docente.especialidades || docente.especialidades.length === 0) {
      return false;
    }

    // Check if the docente has at least one of the required specialties
    const docenteEspecialidadIds = docente.especialidades.map(esp => esp.especialidad_id);
    const cursoEspecialidadIds = curso.especialidades.map(esp => esp.especialidad_id);
    
    // Return true if there's at least one common specialty
    return docenteEspecialidadIds.some(id => cursoEspecialidadIds.includes(id));
  }

  /**
   * Find docentes that can teach a specific course based on their specialties
   * @param docentes List of all docentes
   * @param curso The course to teach
   * @returns Array of docentes that can teach the course
   */
  static filtrarDocentesParaCurso(docentes: Docente[], curso: Curso): Docente[] {
    return docentes.filter(docente => 
      this.puedeEnsenyarCurso(docente, curso)
    );
  }
  
  /**
   * Find courses that a docente can teach based on their specialties
   * @param cursos List of all courses
   * @param docente The docente
   * @returns Array of courses the docente can teach
   */
  static filtrarCursosParaDocente(cursos: Curso[], docente: Docente): Curso[] {
    return cursos.filter(curso => 
      this.puedeEnsenyarCurso(docente, curso)
    );
  }
  
  /**
   * Get the ids of docentes that can teach a specific course
   * @param docentes List of all docentes
   * @param curso The course to teach 
   * @returns Array of docente ids
   */
  static obtenerIdsDocentesParaCurso(docentes: Docente[], curso: Curso): number[] {
    return this.filtrarDocentesParaCurso(docentes, curso).map(d => d.docente_id);
  }

  /**
   * Load course specialties from the backend
   * @param cursoId The course ID
   * @returns Promise with the specialties
   */
  static async cargarEspecialidadesCurso(cursoId: number): Promise<Especialidad[]> {
    try {
      const response = await axios.get(`/api/academic/materia-especialidades-requeridas/?materia=${cursoId}`);
      if (response.data && response.data.length > 0) {
        // Get the specialties from the response
        const especialidadIds = response.data.map((item: any) => item.especialidad);
        
        // Get the details of each specialty
        const especialidades = await Promise.all(
          especialidadIds.map(async (id: number) => {
            const espResponse = await axios.get(`/api/academic/especialidades/${id}/`);
            return espResponse.data;
          })
        );
        
        return especialidades;
      }
      return [];
    } catch (error) {
      console.error('Error al cargar especialidades del curso:', error);
      return [];
    }
  }

  /**
   * Load docente specialties from the backend
   * @param docenteId The docente ID
   * @returns Promise with the specialties
   */
  static async cargarEspecialidadesDocente(docenteId: number): Promise<Especialidad[]> {
    try {
      const response = await axios.get(`/api/users/docentes/${docenteId}/`);
      if (response.data && response.data.especialidades_detalle) {
        return response.data.especialidades_detalle;
      }
      return [];
    } catch (error) {
      console.error('Error al cargar especialidades del docente:', error);
      return [];
    }
  }

  /**
   * Assign a specialty to a docente
   * @param docenteId The docente ID
   * @param especialidadId The specialty ID
   * @returns Promise with the response
   */
  static async asignarEspecialidadDocente(docenteId: number, especialidadId: number): Promise<any> {
    try {
      // Get current docente data
      const docente = await axios.get(`/api/users/docentes/${docenteId}/`);
      
      // Add the new specialty to the existing ones
      const especialidadIds = [...(docente.data.especialidad_ids || []), especialidadId];
      
      // Update the docente
      const response = await axios.patch(`/api/users/docentes/${docenteId}/`, {
        especialidad_ids: especialidadIds
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al asignar especialidad al docente:', error);
      throw error;
    }
  }

  /**
   * Remove a specialty from a docente
   * @param docenteId The docente ID
   * @param especialidadId The specialty ID
   * @returns Promise with the response
   */
  static async removerEspecialidadDocente(docenteId: number, especialidadId: number): Promise<any> {
    try {
      // Get current docente data
      const docente = await axios.get(`/api/users/docentes/${docenteId}/`);
      
      // Filter out the specialty to remove
      const especialidadIds = (docente.data.especialidad_ids || [])
        .filter((id: number) => id !== especialidadId);
      
      // Update the docente
      const response = await axios.patch(`/api/users/docentes/${docenteId}/`, {
        especialidad_ids: especialidadIds
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al remover especialidad del docente:', error);
      throw error;
    }
  }

  /**
   * Assign a specialty to a course
   * @param cursoId The course ID
   * @param especialidadId The specialty ID
   * @returns Promise with the response
   */
  static async asignarEspecialidadCurso(cursoId: number, especialidadId: number): Promise<any> {
    try {
      const response = await axios.post('/api/academic/materia-especialidades-requeridas/', {
        materia: cursoId,
        especialidad: especialidadId
      });
      return response.data;
    } catch (error) {
      console.error('Error al asignar especialidad al curso:', error);
      throw error;
    }
  }

  /**
   * Remove a specialty from a course
   * @param relacionId The relationship ID
   * @returns Promise with the response
   */
  static async removerEspecialidadCurso(relacionId: number): Promise<any> {
    try {
      const response = await axios.delete(`/api/academic/materia-especialidades-requeridas/${relacionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error al remover especialidad del curso:', error);
      throw error;
    }
  }
}

export default DocenteEspecialidadService;
