
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://www.pngmart.com/files/21/Travel-PNG-Image-HD.png"; // puedes poner tu URL o importar una imagen local

/**
 * data debería tener:
 * {
 *   cliente: string,
 *   destino: string,
 *   fecha_excursion: string (YYYY-MM-DD),
 *   monto: string|number,
 *   forma_pago: string,
 *   numero: string,
 *   fecha_emision: string (DD/MM/YYYY)
 * }
 */
export default function ReceiptPDFPreview({
  data,
  getNextReceiptNum,
}: {
  data: {
    cliente: string;
    destino: string;
    fecha_excursion: string;
    monto: string | number;
    forma_pago: string;
    numero: string;
    fecha_emision: string;
  };
  getNextReceiptNum: () => number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Genera el PDF como blob para vista previa
    crearPDF(true).then(blobUrl => setPdfUrl(blobUrl));
    // eslint-disable-next-line
  }, [data]);

  // Crea PDF, blobUrl si preview, descarga si !preview
  async function crearPDF(preview: boolean) {
    const logoDataURL = await getDataURL(LOGO_URL);
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    for (let i = 0; i < 2; i++) {
      const etiqueta = i === 0 ? "ORIGINAL" : "COPIA";

      // Borde de recibo
      doc.setDrawColor(200);
      doc.rect(10, 10 + 145 * i, 190, 130, "S");

      // LOGO y encabezado
      if (logoDataURL) {
        doc.addImage(logoDataURL, "PNG", 15, 14 + 145 * i, 18, 18);
      }
      doc.setFontSize(16);
      doc.setTextColor(33,33,33);
      doc.text("Excursiones ABC", 35, 21 + 145 * i);

      doc.setFontSize(9);
      doc.text("Av. Principal 123, Ciudad", 35, 26 + 145 * i);
      doc.text("Tel: 555-123-4567    info@excursionesabc.com", 35, 30 + 145 * i);

      // Número recibo y fecha emisión/adicionales
      doc.setFontSize(12);
      doc.setTextColor(0,0,180);
      doc.text(`Recibo N°: ${data.numero}`, 153, 21 + 145 * i);
      doc.setTextColor(100,100,100);
      doc.text(`Fecha emisión: ${data.fecha_emision}`, 153, 26 + 145 * i);

      // Etiqueta ORIGINAL/COPIA
      doc.setFontSize(10);
      doc.setTextColor(75,75,75);
      doc.text(`(${etiqueta})`, 169, 34 + 145 * i, { align: "right", maxWidth: 22 });

      // Línea divisoria
      doc.setDrawColor(210);
      doc.line(15, 36 + 145 * i, 195, 36 + 145 * i);

      // Detalles de cliente y excursión
      doc.setFontSize(11);
      doc.setTextColor(40,40,40);
      doc.text(`Cliente:`, 17, 43 + 145 * i);
      doc.text(`Concepto: Excursión a ${data.destino}`, 17, 52 + 145 * i);
      doc.text(`Fecha excursión: ${formateaFecha(data.fecha_excursion)}`, 17, 60 + 145 * i);
      doc.text(`Forma de pago: ${capitalizeF(data.forma_pago)}`, 17, 68 + 145 * i);

      doc.setFontSize(11);
      doc.text(`${data.cliente}`, 42, 43 + 145 * i);

      // Tabla de monto
      autoTable(doc, {
        theme: "striped",
        styles: {
          cellPadding: 2,
          fontSize: 12,
          halign: "center",
        },
        margin: { top: 73 + 145 * i, left: 35 },
        startY: 73 + 145 * i,
        head: [["MONTO (€)"]],
        body: [[String(data.monto)]],
        tableWidth: 50,
      });

      // Marca de agua PAGADO
      doc.saveGraphicsState();
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(46);
      doc.setGState(new doc.GState({ opacity: 0.3 }));
      doc.text("PAGADO", 105, 125 + 145 * i, { align: "center", angle: 0 });
      doc.restoreGraphicsState();
    }

    if (preview) {
      // Show as base64 blob (for preview)
      const blob = doc.output("blob");
      return URL.createObjectURL(blob);
    } else {
      doc.save(`${data.numero}.pdf`);
      return null;
    }
  }

  // Previsualización y descarga
  return (
    <div>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-3">Previsualización del Recibo PDF</h2>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            className="border shadow w-full min-h-[410px] max-w-[420px] mb-4 print:hidden"
            style={{ height: "410px" }}
          />
        ) : (
          <div className="text-center text-gray-400 my-20">Generando PDF...</div>
        )}
        <Button className="mb-2" onClick={() => crearPDF(false)}>
          Descargar PDF
        </Button>
      </div>
      <p className="text-xs mt-2 text-gray-500 text-center print:hidden">
        El recibo contendrá dos copias <b>(ORIGINAL y COPIA)</b> para impresión, con marca de agua e información de la empresa.
      </p>
    </div>
  );
}

// Helpers
async function getDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}
function formateaFecha(fecha: string) {
  if (!fecha) return "";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-ES");
}
function capitalizeF(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
