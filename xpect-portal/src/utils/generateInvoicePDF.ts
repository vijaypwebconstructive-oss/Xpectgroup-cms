import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateInvoicePDF = async (): Promise<Blob> => {
  const element = document.getElementById("invoice-print-container");

  if (!element) {
    throw new Error("Invoice element not found");
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  return pdf.output("blob");
};
