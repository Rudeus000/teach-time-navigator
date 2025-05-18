
/**
 * Map day number (from backend) to day name
 * Django uses 1-7 for Monday-Sunday
 */
export const mapDayNumberToName = (dayNumber: number): string => {
  const days = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
  };
  return days[dayNumber as keyof typeof days] || '';
};

/**
 * Map day name to number (for backend)
 */
export const mapDayNameToNumber = (dayName: string): number => {
  const days: Record<string, number> = {
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6,
    'Domingo': 7
  };
  return days[dayName] || 0;
};

/**
 * Format time from backend (HH:MM:SS) to HH:MM
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  return time.substring(0, 5);
};
