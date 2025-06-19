
import React from "react";
import { Button } from "@/components/ui/button";
import { AssociationConfig } from "@/utils/associationConfig";
import { Edit, ArrowRight } from "lucide-react";

interface Props {
  config: AssociationConfig;
  onModify: () => void;
  onContinue: () => void;
}

export default function AssociationDocumentPreview({ config, onModify, onContinue }: Props) {
  return (
    <div className="flex min-h-screen justify-center items-center bg-background">
      <div className="bg-white border rounded-xl shadow px-7 py-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Vista previa en documentos</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 text-center mb-4">
            Así es como aparecerán los datos de tu asociación en los documentos:
          </p>
        </div>

        {/* Preview del encabezado como aparece en los PDFs */}
        <div className="border-2 border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
          <div className="flex items-center gap-4 mb-4">
            {config.logo && (
              <img
                src={config.logo}
                alt="Logo Asociación"
                className="h-16 w-16 object-cover rounded-full border border-gray-300"
              />
            )}
            <div className="flex flex-col">
              <span className="text-xl font-bold text-black mb-1">
                {config.name || "Nombre de la asociación"}
              </span>
              {config.address && (
                <span className="text-sm text-gray-700">{config.address}</span>
              )}
              {config.phone && (
                <span className="text-sm text-gray-700">Tel: {config.phone}</span>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Ejemplo de recibo:</h3>
            <div className="bg-white border border-gray-200 rounded p-4 text-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-gray-600">
                  <div>{config.name}</div>
                  <div>{config.address}</div>
                  <div>Tel: {config.phone}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">RECIBO EXCURSIÓN</div>
                  <div className="text-xs">Recibo N°: REC-001</div>
                </div>
              </div>
              <div className="text-xs space-y-1 text-gray-700">
                <div>Excursión: Viaje de ejemplo</div>
                <div>Asiento: 1</div>
                <div>Pasajero: Juan Pérez</div>
                <div>Fecha/Hora: 15/06/2025 08:00</div>
                <div>Precio: 25 €</div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">¿Dónde aparecen estos datos?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• En los recibos PDF de las excursiones</li>
            <li>• En los informes de impresión de pasajeros</li>
            <li>• En todos los documentos oficiales generados</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onModify}
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Modificar datos
          </Button>
          <Button
            onClick={onContinue}
            className="flex items-center gap-2"
          >
            Continuar
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
