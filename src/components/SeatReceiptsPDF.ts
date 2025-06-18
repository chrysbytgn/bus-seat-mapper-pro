
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import type { Passenger } from "./BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { getDataURL, formatFecha } from "@/utils/receiptsHelpers";
import { getAssociationConfig } from "@/utils/associationConfig";

/**
 * Genera el PDF de recibos estilo 'bloc antiguo' - 3 recibos por página horizontal, formato mejorado
 */
export async function generarPDFasientos(
  seatRange: number[],
  passengers: Passenger[],
  excursionInfo: ExcursionData | null,
  setGenerating?: (v: boolean) => void
) {
  setGenerating?.(true);

  const association = getAssociationConfig();

  // --- LOGO y datos asociación ---
  const logoURL = association?.logo || "https://www.pngmart.com/files/21/Travel-PNG-Image-HD.png";
  let logoDataURL = null;
  try {
    logoDataURL = await getDataURL(logoURL);
  } catch (error) {
    console.log("No se pudo cargar el logo, continuando sin él");
  }

  // 3 recibos por página (1 columna, 3 filas)
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const lastSeq = Number(localStorage.getItem("receipt_seq") || "1");
  let actualSeq = lastSeq;
  
  const recibosPorHoja = 3;
  const recHeight = 90; // Más espacio por recibo
  const recWidth = 180; // Ancho completo menos márgenes
  const marginLeft = 15;
  const marginTop = 10;
  const verticalGap = 8;

  function getPassenger(seat: number) {
    return passengers.find(p => p.seat === seat) || null;
  }
  
  function siguienteNumeroRecibo(baseNum: number) {
    return "REC-" + String(baseNum).padStart(3, "0");
  }
  
  function infoExcursionLinea() {
    let out = "";
    if (excursionInfo?.date || excursionInfo?.time) {
      out += (excursionInfo?.date ? formatFecha(excursionInfo.date) : "");
      out += (excursionInfo?.time ? " " + excursionInfo.time : "");
    }
    if (excursionInfo?.place) {
      out += " / " + excursionInfo.place;
    }
    return out.trim();
  }

  seatRange.forEach((seatNum, idx) => {
    const posInPage = idx % recibosPorHoja;
    if (posInPage === 0 && idx !== 0) doc.addPage();
    
    const top = marginTop + posInPage * (recHeight + verticalGap);
    const p = getPassenger(seatNum);

    // RECIBO COMPLETO (ancho completo)
    doc.setFillColor(255, 255, 255);
    doc.rect(marginLeft, top, recWidth, recHeight, "F");
    
    // Logo
    if (logoDataURL) {
      try {
        doc.addImage(logoDataURL, "PNG", marginLeft + 5, top + 5, 20, 20);
      } catch (error) {
        console.log("Error al añadir logo al PDF");
      }
    }
    
    // Nombre de asociación en dos líneas para mejor legibilidad
    const associationName = association?.name || "Asociación";
    const words = associationName.split(' ');
    const midPoint = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, midPoint).join(' ');
    const secondLine = words.slice(midPoint).join(' ');
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(firstLine, marginLeft + 30, top + 12);
    if (secondLine) {
      doc.text(secondLine, marginLeft + 30, top + 20);
    }
    
    // Información de contacto
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    if (association?.address) {
      doc.text(association.address, marginLeft + 30, top + 28, { maxWidth: recWidth - 35 });
    }
    if (association?.phone) {
      doc.text(`Tel: ${association.phone}`, marginLeft + 30, top + 34);
    }
    
    // Título del recibo
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("RECIBO EXCURSIÓN", marginLeft + recWidth - 10, top + 15, { align: "right" });
    
    // Número de recibo
    doc.setFontSize(12);
    doc.text(`Recibo N°: ${siguienteNumeroRecibo(actualSeq + idx)}`, marginLeft + recWidth - 10, top + 25,{ align: "right" });
    
    // Información de la excursión
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    let yPos = top + 45;
    
    if (excursionInfo?.name) {
      doc.text(`Excursión: ${excursionInfo.name}`, marginLeft + 5, yPos);
      yPos += 8;
    }
    
    doc.text(`Asiento: ${seatNum}`, marginLeft + 5, yPos);
    yPos += 8;
    
    if (p) {
      doc.text(`Pasajero: ${p.name} ${p.surname}`, marginLeft + 5, yPos, { maxWidth: recWidth - 10 });
      yPos += 8;
    } else {
      doc.text(`Pasajero: ______________________________`, marginLeft + 5, yPos);
      yPos += 8;
    }
    
    if (excursionInfo) {
      const fechaHora = infoExcursionLinea();
      if (fechaHora) {
        doc.text(`Fecha/Hora: ${fechaHora}`, marginLeft + 5, yPos);
        yPos += 8;
      }
      
      if (excursionInfo.place) {
        doc.text(`Salida: ${excursionInfo.place}`, marginLeft + 5, yPos, { maxWidth: recWidth - 10 });
        yPos += 8;
      }
      
      // INCLUIR PRECIO
      if (excursionInfo.price) {
        doc.text(`Precio: ${excursionInfo.price} €`, marginLeft + 5, yPos);
        yPos += 8;
      }
    }
    
    // Fecha emisión (campo para rellenar)
    doc.setFontSize(9);
    doc.text("Fecha emisión: ________________________", marginLeft + 5, top + recHeight - 8);
    
    // Marca de agua PAGADO al fondo, sin tapar datos importantes
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(45);
    doc.text("PAGADO", marginLeft + recWidth/2, top + recHeight - 25, { 
      align: "center", 
      angle: -15 
    });

    // Línea separadora entre recibos (excepto el último)
    if (posInPage < recibosPorHoja - 1) {
      doc.setLineDashPattern([3, 3], 0);
      doc.setDrawColor(180, 180, 180);
      doc.line(marginLeft, top + recHeight + verticalGap/2, marginLeft + recWidth, top + recHeight + verticalGap/2);
      doc.setLineDashPattern([], 0);
    }
  });

  localStorage.setItem("receipt_seq", String(lastSeq + seatRange.length));
  doc.save("recibos_excursion.pdf");
  setGenerating?.(false);
}
