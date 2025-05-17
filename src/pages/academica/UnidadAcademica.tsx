
import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const UnidadAcademicaPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto"
    >
      <h2 className="text-3xl font-bold mb-2">Unidades Académicas</h2>
      <p className="text-muted-foreground mb-8">
        Gestiona las unidades académicas de la institución
      </p>
      
      <div className="flex flex-col items-center justify-center py-12">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Módulo en construcción</h3>
        <p className="text-muted-foreground text-center max-w-md">
          El módulo de Unidades Académicas estará disponible próximamente.
        </p>
      </div>
    </motion.div>
  );
};

export default UnidadAcademicaPage;
