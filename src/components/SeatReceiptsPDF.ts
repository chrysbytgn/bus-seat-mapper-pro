
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import type { Passenger } from "./BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { getDataURL, formatFecha } from "@/utils/receiptsHelpers";
import { getAssociationConfig } from "@/utils/associationConfig";

/**
 * Genera el PDF de recibos con talón lateral - 3 recibos por página vertical
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
  const recHeight = 90; // Altura total del recibo
  const recWidth = 180; // Ancho total menos márgenes
  const talonWidth = 40; // Ancho del talón izquierdo
  const reciboMainWidth = 135; // Ancho del recibo principal
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

  function formatParadas() {
    if (!excursionInfo?.stops || excursionInfo.stops.length === 0) return "";
    return excursionInfo.stops.join(" → ");
  }

  seatRange.forEach((seatNum, idx) => {
    const posInPage = idx % recibosPorHoja;
    if (posInPage === 0 && idx !== 0) doc.addPage();
    
    const top = marginTop + posInPage * (recHeight + verticalGap);
    const p = getPassenger(seatNum);
    const numeroRecibo = siguienteNumeroRecibo(actualSeq + idx);

    // FONDO BLANCO COMPLETO
    doc.setFillColor(255, 255, 255);
    doc.rect(marginLeft, top, recWidth, recHeight, "F");
    
    // ====== TALÓN IZQUIERDO (40mm) ======
    // Marco del talón
    doc.setDrawColor(180, 180, 180);
    doc.rect(marginLeft, top, talonWidth, recHeight);
    
    // Contenido del talón (vertical y compacto)
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    
    // Nombre asociación (reducido)
    const associationName = association?.name || "Asociación";
    const shortName = associationName.length > 15 ? associationName.substring(0, 15) + "..." : associationName;
    doc.text(shortName, marginLeft + 2, top + 8, { maxWidth: talonWidth - 4 });
    
    // Número de recibo
    doc.setFontSize(9);
    doc.text(numeroRecibo, marginLeft + 2, top + 16);
    
    // Asiento
    doc.setFontSize(10);
    doc.text(`Asiento: ${seatNum}`, marginLeft + 2, top + 24);
    
    // Pasajero (reducido)
    if (p) {
      const nombreCompleto = `${p.name} ${p.surname}`;
      const nombreCorto = nombreCompleto.length > 12 ? nombreCompleto.substring(0, 12) + "..." : nombreCompleto;
      doc.setFontSize(8);
      doc.text(nombreCorto, marginLeft + 2, top + 32, { maxWidth: talonWidth - 4 });
    }
    
    // Excursión (reducido)
    if (excursionInfo?.name) {
      const excurCorta = excursionInfo.name.length > 10 ? excursionInfo.name.substring(0, 10) + "..." : excursionInfo.name;
      doc.setFontSize(7);
      doc.text(excurCorta, marginLeft + 2, top + 42, { maxWidth: talonWidth - 4 });
    }
    
    // Paradas (reducido)
    const paradas = formatParadas();
    if (paradas) {
      const paradasCortas = paradas.length > 12 ? paradas.substring(0, 12) + "..." : paradas;
      doc.setFontSize(6);
      doc.text(paradasCortas, marginLeft + 2, top + 50, { maxWidth: talonWidth - 4 });
    }
    
    // Precio
    if (excursionInfo?.price) {
      doc.setFontSize(9);
      doc.text(`${excursionInfo.price} €`, marginLeft + 2, top + 62);
    }
    
    // Fecha (campo para rellenar)
    doc.setFontSize(7);
    doc.text("Fecha:", marginLeft + 2, top + recHeight - 12);
    doc.text("___________", marginLeft + 2, top + recHeight - 6);

    // ====== LÍNEA PUNTEADA SEPARADORA ======
    const lineaX = marginLeft + talonWidth + 2;
    doc.setLineDashPattern([2, 2], 0);
    doc.setDrawColor(120, 120, 120);
    doc.line(lineaX, top + 5, lineaX, top + recHeight - 5);
    doc.setLineDashPattern([], 0);

    // ====== RECIBO PRINCIPAL (135mm) ======
    const reciboLeft = marginLeft + talonWidth + 5;
    
    // Logo en el recibo principal
    if (logoDataURL) {
      try {
        doc.addImage(logoDataURL, "PNG", reciboLeft + 5, top + 5, 20, 20);
      } catch (error) {
        console.log("Error al añadir logo al PDF");
      }
    }
    
    // Nombre de asociación en el recibo principal
    const words = associationName.split(' ');
    const midPoint = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, midPoint).join(' ');
    const secondLine = words.slice(midPoint).join(' ');
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(firstLine, reciboLeft + 30, top + 12);
    if (secondLine) {
      doc.text(secondLine, reciboLeft + 30, top + 20);
    }
    
    // Información de contacto
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    if (association?.address) {
      doc.text(association.address, reciboLeft + 30, top + 28, { maxWidth: reciboMainWidth - 35 });
    }
    if (association?.phone) {
      doc.text(`Tel: ${association.phone}`, reciboLeft + 30, top + 34);
    }
    
    // Título del recibo
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("RECIBO EXCURSIÓN", reciboLeft + reciboMainWidth - 10, top + 15, { align: "right" });
    
    // Número de recibo
    doc.setFontSize(12);
    doc.text(`Recibo N°: ${numeroRecibo}`, reciboLeft + reciboMainWidth - 10, top + 25, { align: "right" });
    
    // Información de la excursión
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    let yPos = top + 45;
    
    if (excursionInfo?.name) {
      doc.text(`Excursión: ${excursionInfo.name}`, reciboLeft + 5, yPos);
      yPos += 8;
    }
    
    doc.text(`Asiento: ${seatNum}`, reciboLeft + 5, yPos);
    yPos += 8;
    
    if (p) {
      doc.text(`Pasajero: ${p.name} ${p.surname}`, reciboLeft + 5, yPos, { maxWidth: reciboMainWidth - 10 });
      yPos += 8;
    } else {
      doc.text(`Pasajero: ______________________________`, reciboLeft + 5, yPos);
      yPos += 8;
    }
    
    if (excursionInfo) {
      const fechaHora = infoExcursionLinea();
      if (fechaHora) {
        doc.text(`Fecha/Hora: ${fechaHora}`, reciboLeft + 5, yPos);
        yPos += 8;
      }
      
      if (excursionInfo.place) {
        doc.text(`Salida: ${excursionInfo.place}`, reciboLeft + 5, yPos, { maxWidth: reciboMainWidth - 10 });
        yPos += 8;
      }
      
      // Paradas adicionales
      if (paradas) {
        doc.text(`Paradas: ${paradas}`, reciboLeft + 5, yPos, { maxWidth: reciboMainWidth - 10 });
        yPos += 8;
      }
      
      if (excursionInfo.price) {
        doc.text(`Precio: ${excursionInfo.price} €`, reciboLeft + 5, yPos);
        yPos += 8;
      }
    }
    
    // Fecha emisión (campo para rellenar)
    doc.setFontSize(9);
    doc.text("Fecha emisión: ________________________", reciboLeft + 5, top + recHeight - 8);

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
