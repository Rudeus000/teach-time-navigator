
import { Docente, Especialidad, Curso } from '@/models/api';

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
    const docenteEspecialidadIds = docente.especialidades.map(esp => esp.id);
    const cursoEspecialidadIds = curso.especialidades.map(esp => esp.id);
    
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
    return this.filtrarDocentesParaCurso(docentes, curso).map(d => d.id);
  }
}

export default DocenteEspecialidadService;
