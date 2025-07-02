
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
    
    // Campo para NOMBRE DEL PASAJERO en mácula
    doc.setFontSize(7);
    doc.text("Pasajero:", marginLeft + 2, top + 32);
    doc.rect(marginLeft + 2, top + 34, talonWidth - 4, 8);
    if (p) {
      const nombreCompleto = `${p.name} ${p.surname}`;
      const nombreCorto = nombreCompleto.length > 12 ? nombreCompleto.substring(0, 12) + "..." : nombreCompleto;
      doc.setFontSize(7);
      doc.text(nombreCorto, marginLeft + 3, top + 39);
    }
    
    // Teléfono en el talón
    if (p?.phone) {
      doc.setFontSize(6);
      doc.text("Tel:", marginLeft + 2, top + 46);
      const telefonoCorto = p.phone.length > 12 ? p.phone.substring(0, 12) : p.phone;
      doc.text(telefonoCorto, marginLeft + 2, top + 51);
    }
    
    // Excursión (reducido)
    if (excursionInfo?.name) {
      const excurCorta = excursionInfo.name.length > 10 ? excursionInfo.name.substring(0, 10) + "..." : excursionInfo.name;
      doc.setFontSize(7);
      doc.text(excurCorta, marginLeft + 2, top + 48, { maxWidth: talonWidth - 4 });
    }
    
    // Paradas adicionales en mácula (mejorado)
    const paradas = formatParadas();
    if (paradas) {
      doc.setFontSize(6);
      doc.text("Paradas:", marginLeft + 2, top + 54);
      const paradasCortas = paradas.length > 15 ? paradas.substring(0, 15) + "..." : paradas;
      doc.text(paradasCortas, marginLeft + 2, top + 59, { maxWidth: talonWidth - 4 });
    }
    
    // Precio
    if (excursionInfo?.price) {
      doc.setFontSize(9);
      doc.text(`${excursionInfo.price} €`, marginLeft + 2, top + 68);
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
        doc.addImage(logoDataURL, "PNG", reciboLeft + 5, top + 5, 15, 15);
      } catch (error) {
        console.log("Error al añadir logo al PDF");
      }
    }
    
    // Título "RECIBO EXCURSIÓN" en la esquina superior derecha (más pequeño)
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("RECIBO EXCURSIÓN", reciboLeft + reciboMainWidth - 5, top + 8, { align: "right" });
    
    // Nombre de asociación (REDUCIDO y junto al logo)
    const words = associationName.split(' ');
    const midPoint = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, midPoint).join(' ');
    const secondLine = words.slice(midPoint).join(' ');
    
    doc.setFontSize(10); // Reducido de 12 a 10
    doc.setTextColor(0, 0, 0);
    doc.text(firstLine, reciboLeft + 25, top + 12);
    if (secondLine) {
      doc.text(secondLine, reciboLeft + 25, top + 18);
    }
    
    // Información de contacto PEGADA al nombre de asociación
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const yContactStart = secondLine ? top + 22 : top + 16;
    
    // Dirección/lugar pegado al nombre
    if (association?.address) {
      doc.text(association.address, reciboLeft + 25, yContactStart, { maxWidth: reciboMainWidth - 30 });
    }
    // Teléfono debajo de la dirección
    if (association?.phone) {
      doc.text(`Tel: ${association.phone}`, reciboLeft + 25, yContactStart + 4);
    }
    
    // Número de recibo debajo de la información de contacto
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const yPosNumRecibo = yContactStart + (association?.phone ? 10 : 6);
    doc.text(`Recibo N°: ${numeroRecibo}`, reciboLeft + 25, yPosNumRecibo);
    
    // Información de la excursión
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    let yPos = top + 40;
    
    if (excursionInfo?.name) {
      doc.text(`Excursión: ${excursionInfo.name}`, reciboLeft + 5, yPos);
      yPos += 8;
    }
    
    doc.text(`Asiento: ${seatNum}`, reciboLeft + 5, yPos);
    yPos += 8;
    
    // Campo para el pasajero SIN RECUADRO - CON LÍNEA
    doc.setFontSize(10);
    if (p) {
      doc.text(`Pasajero: ${p.name} ${p.surname}`, reciboLeft + 5, yPos, { maxWidth: reciboMainWidth - 10 });
      yPos += 8;
      // Teléfono del pasajero en el recibo principal
      if (p.phone) {
        doc.setFontSize(9);
        doc.text(`Teléfono: ${p.phone}`, reciboLeft + 5, yPos);
        yPos += 8;
      }
    } else {
      doc.text(`Pasajero:`, reciboLeft + 5, yPos);
      // LÍNEA HORIZONTAL en lugar de recuadro
      doc.setDrawColor(100, 100, 100);
      doc.line(reciboLeft + 35, yPos - 1, reciboLeft + 120, yPos - 1);
      yPos += 8;
      // Campo para teléfono con línea
      doc.setFontSize(9);
      doc.text(`Teléfono:`, reciboLeft + 5, yPos);
      doc.line(reciboLeft + 25, yPos - 1, reciboLeft + 120, yPos - 1);
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
      
      // Paradas adicionales MEJORADAS - solo si existen
      if (paradas) {
        doc.setFontSize(9);
        doc.text(`Paradas adicionales:`, reciboLeft + 5, yPos);
        yPos += 6;
        doc.setFontSize(8);
        // Dividir paradas en múltiples líneas si es necesario
        const palabras = paradas.split(' ');
        let lineaActual = '';
        palabras.forEach((palabra, index) => {
          const lineaTest = lineaActual + (lineaActual ? ' ' : '') + palabra;
          if (lineaTest.length > 45) { // Límite por línea
            doc.text(lineaActual, reciboLeft + 8, yPos);
            yPos += 5;
            lineaActual = palabra;
          } else {
            lineaActual = lineaTest;
          }
          if (index === palabras.length - 1) {
            doc.text(lineaActual, reciboLeft + 8, yPos);
            yPos += 6;
          }
        });
      }
      
      if (excursionInfo.price) {
        doc.setFontSize(11);
        doc.text(`Precio: ${excursionInfo.price} €`, reciboLeft + 5, yPos);
        yPos += 8;
      }
    }
    
    // Fecha emisión AL FINAL DEL RECIBO para máximo espacio
    doc.setFontSize(9);
    doc.text("Fecha emisión:", reciboLeft + 5, top + recHeight - 10);
    doc.line(reciboLeft + 30, top + recHeight - 11, reciboLeft + 120, top + recHeight - 11);

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
