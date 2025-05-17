
import React from 'react';
import { motion } from 'framer-motion';
import { School } from 'lucide-react';

const AulaPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto"
    >
      <h2 className="text-3xl font-bold mb-2">Aulas</h2>
      <p className="text-muted-foreground mb-8">
        Gestiona las aulas de la institución
      </p>
      
      <div className="flex flex-col items-center justify-center py-12">
        <School className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Módulo en construcción</h3>
        <p className="text-muted-foreground text-center max-w-md">
          El módulo de Aulas estará disponible próximamente.
        </p>
      </div>
    </motion.div>
  );
};

export default AulaPage;
