
import axios from '@/lib/axios';
import { DisponibilidadDocente, PeriodoAcademico, BloqueHorario, Docente } from '@/models/api';

export class DisponibilidadService {
  /**
   * Get available blocks for a specific period
   */
  static async getBloqueHorarios(): Promise<BloqueHorario[]> {
    try {
      const response = await axios.get('/api/scheduling/bloques-horarios/');
      return response.data;
    } catch (error) {
      console.error('Error fetching bloques horarios:', error);
      return [];
    }
  }

  /**
   * Get disponibilidad for a specific docente and period
   */
  static async getDisponibilidadDocente(docenteId: number, periodoId: number): Promise<DisponibilidadDocente[]> {
    try {
      const response = await axios.get('/api/scheduling/disponibilidad-docentes/', {
        params: {
          docente: docenteId,
          periodo: periodoId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching disponibilidad:', error);
      return [];
    }
  }

  /**
   * Get all docentes disponibilidad for a specific period
   */
  static async getAllDocentesDisponibilidad(periodoId: number): Promise<DisponibilidadDocente[]> {
    try {
      const response = await axios.get('/api/scheduling/disponibilidad-docentes/', {
        params: {
          periodo: periodoId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all disponibilidad:', error);
      return [];
    }
  }

  /**
   * Create or update disponibilidad for a docente
   */
  static async saveDisponibilidad(disponibilidad: Partial<DisponibilidadDocente>): Promise<DisponibilidadDocente> {
    try {
      let response;
      if (disponibilidad.disponibilidad_id) {
        // Update
        response = await axios.patch(
          `/api/scheduling/disponibilidad-docentes/${disponibilidad.disponibilidad_id}/`, 
          disponibilidad
        );
      } else {
        // Create
        response = await axios.post('/api/scheduling/disponibilidad-docentes/', disponibilidad);
      }
      return response.data;
    } catch (error) {
      console.error('Error saving disponibilidad:', error);
      throw error;
    }
  }

  /**
   * Delete disponibilidad entry
   */
  static async deleteDisponibilidad(disponibilidadId: number): Promise<void> {
    try {
      await axios.delete(`/api/scheduling/disponibilidad-docentes/${disponibilidadId}/`);
    } catch (error) {
      console.error('Error deleting disponibilidad:', error);
      throw error;
    }
  }
  
  /**
   * Get active periods
   */
  static async getPeriodosActivos(): Promise<PeriodoAcademico[]> {
    try {
      const response = await axios.get('/api/academic/periodos-academicos/', {
        params: {
          activo: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching periodos:', error);
      return [];
    }
  }
}

export default DisponibilidadService;
