import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function downloadContract(container: HTMLDivElement) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const canvas = await html2canvas(container, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,

    onclone: (doc) => {
      doc.querySelectorAll("*").forEach((el) => {
        const element = el as HTMLElement;

        const style = window.getComputedStyle(element);

        if (style.backgroundColor.includes("oklch")) {
          element.style.backgroundColor = "#ffffff";
        }

        if (style.color.includes("oklch")) {
          element.style.color = "#000000";
        }

        if (style.borderColor.includes("oklch")) {
          element.style.borderColor = "#d1d5db";
        }
      });
    },
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;

    pdf.addPage();

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pdfHeight;
  }

  pdf.save("EmploymentContract.pdf");
}
