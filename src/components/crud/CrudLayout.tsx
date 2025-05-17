
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

interface CrudProps<T> {
  title: string;
  subtitle: string;
  items: T[];
  columns: { header: string; accessor: keyof T | ((item: T) => React.ReactNode) }[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  renderForm: React.ReactNode;
  showForm: boolean;
  icon: React.ReactNode;
  readOnly?: boolean;
}

export function CrudLayout<T extends { id: number | string }>({
  title,
  subtitle,
  items,
  columns,
  onAdd,
  onEdit,
  onDelete,
  renderForm,
  showForm,
  icon,
  readOnly = false
}: CrudProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {!readOnly && (
          <Button onClick={onAdd} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> 
            Agregar {title.slice(0, -1)}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            {renderForm}
          </CardContent>
        </Card>
      )}

      {items.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>{column.header}</TableHead>
                ))}
                {!readOnly && <TableHead>Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column, index) => (
                    <TableCell key={index}>
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item)
                        : item[column.accessor] as React.ReactNode}
                    </TableCell>
                  ))}
                  {!readOnly && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onEdit(item)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => onDelete(item)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-muted/20 border rounded-md">
          {icon}
          <h3 className="text-xl font-medium mt-4 mb-2">No hay {title.toLowerCase()} registrados</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {!readOnly ? `Agregue un nuevo registro utilizando el botón "Agregar ${title.slice(0, -1)}".` : `No hay ${title.toLowerCase()} disponibles para mostrar.`}
          </p>
          {!readOnly && (
            <Button onClick={onAdd} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> 
              Agregar {title.slice(0, -1)}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
