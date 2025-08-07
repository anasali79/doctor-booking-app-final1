import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { type Prescription, type Patient, type Doctor } from "@/lib/api";
import { renderToString } from 'react-dom/server';
import { PrescriptionDetailView } from '@/components/PrescriptionDetailView';

export const generatePrescriptionPdf = async (
  prescription: Prescription,
  patient: Patient | undefined,
  doctor: Doctor | undefined
) => {
  const elementId = `prescription-card-${prescription.id}`;
  const filename = `prescription_${prescription.patientName.replace(/\s/g, '_')}_${prescription.datePrescribed}.pdf`;

  // Create a temporary div to render the component off-screen
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px'; // Move off-screen
  tempDiv.style.width = '800px'; // Set a reasonable width for PDF generation
  document.body.appendChild(tempDiv);

  // Render the PrescriptionDetailView component into the temporary div
  // Note: This is a simplified approach. In a real app, you might use ReactDOM.render
  // or a dedicated server-side rendering approach if this utility was used on the server.
  // For client-side, we'll just inject the HTML string.
  // However, since PrescriptionDetailView is a client component, we can't use renderToString directly here.
  // The best approach is to capture the *already rendered* dialog content.

  // Let's assume the dialog is open and the element with the ID exists.
  const input = document.getElementById(elementId);

  if (!input) {
    console.error(`Element with ID ${elementId} not found for PDF generation.`);
    // Fallback: try to render it temporarily if not found (more complex)
    // For now, we'll rely on the dialog being open.
    return;
  }

  try {
    const canvas = await html2canvas(input, {
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Enable CORS if images are from external sources
      logging: false, // Disable logging for cleaner console
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  } finally {
    // Clean up the temporary div if it was created (not needed with current approach)
    if (tempDiv.parentNode) {
      document.body.removeChild(tempDiv);
    }
  }
};

/**
 * Triggers the browser's print dialog for a specific element.
 */
export const printPrescription = (elementId: string) => {
  const printContent = document.getElementById(elementId);

  if (!printContent) {
    console.error(`Element with ID ${elementId} not found for printing.`);
    alert("Failed to prepare for printing. Please try again.");
    return;
  }

  const originalContents = document.body.innerHTML;
  const printArea = printContent.cloneNode(true) as HTMLElement;

  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert("Please allow pop-ups for printing.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Prescription</title>
        <link href="/globals.css" rel="stylesheet">
        <style>
          /* Add any specific print styles here */
          body { margin: 0; padding: 20px; }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            /* Ensure background colors and images are printed */
            .bg-slate-800 { background-color: #1e293b !important; }
            .bg-slate-700\\/50 { background-color: rgba(51, 65, 85, 0.5) !important; }
            .text-white { color: #fff !important; }
            .text-teal-300 { color: #5eead4 !important; }
            .text-slate-400 { color: #94a3b8 !important; }
            .text-slate-300 { color: #cbd5e1 !important; }
            .text-blue-400 { color: #60a5fa !important; }
            .text-purple-400 { color: #a78bfa !important; }
            .text-green-400 { color: #4ade80 !important; }
            .text-orange-400 { color: #fb923c !important; }
            .bg-slate-600 { background-color: #475569 !important; }
            /* Hide elements not needed for print, if any */
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${printArea.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus(); // Focus the new window
    printWindow.print(); // Open print dialog
    printWindow.close(); // Close the new window after printing
  };
};
