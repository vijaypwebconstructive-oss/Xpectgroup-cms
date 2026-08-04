import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface GenerateContractProps {
  pdfUrl: string;
  overlayFields: any[];
  overlayData: Record<string, any>;
  previewWidth: number;
}

export async function generateContract({
  pdfUrl,
  overlayFields,
  overlayData,
  previewWidth,
}: GenerateContractProps) {
  // Load original PDF
  const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());

  const PDF_Y_OFFSET = 10;

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Built-in font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();

  let employeeSignatureImage = null;

  const signature = overlayData.employeeSignature;

  if (signature) {
    if (signature.startsWith("data:image/png")) {
      employeeSignatureImage = await pdfDoc.embedPng(signature);
    } else if (signature.startsWith("data:image/jpeg")) {
      employeeSignatureImage = await pdfDoc.embedJpg(signature);
    } else {
      console.error("Unsupported signature format");
    }
  }
  // ===============================================
  // DEBUG ONLY - Employee Name (Page 3)
  // ===============================================

  for (const field of overlayFields) {
    const page = pages[field.page - 1];

    if (!page) continue;

    const value = overlayData[field.id];

    if (!value) continue;

    const pdfWidth = page.getWidth();
    const pdfHeight = page.getHeight();

    const scale = pdfWidth / previewWidth;

    let x = field.x * scale;
    let y = pdfHeight - field.y * scale;

    const fontSize = 14 * scale;

    console.log(overlayData.employeeSignature);

    if (field.id === "employeeSignature") {
      if (field.id === "employeeSignature") {
        if (!employeeSignatureImage) continue;

        page.drawImage(employeeSignatureImage, {
          x,
          y: y - 10,
          width: (field.width ?? 100) * scale,
          height: (field.height ?? 40) * scale,
        });

        continue;
      }
      if (!value) continue;

      // Base64 signature
      let image;

      if (value.startsWith("data:image/png")) {
        image = await pdfDoc.embedPng(value);
      } else {
        console.error("Unsupported image format");
        continue;
      }

      page.drawImage(image, {
        x,
        y: y - 10,
        width: (field.width ?? 100) * scale,
        height: (field.height ?? 50) * scale,
      });

      continue;
    }

    page.drawText(String(value), {
      x,
      y: y - 10, // Your calibrated Y adjustment
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  }

  if (employeeSignatureImage) {
    for (const page of pages) {
      const pdfWidth = page.getWidth();

      const scale = pdfWidth / previewWidth;

      const signatureWidth = 90 * scale;
      const signatureHeight = 35 * scale;

      const marginRight = 25 * scale;
      const marginBottom = 20 * scale;

      page.drawImage(employeeSignatureImage, {
        x: pdfWidth - signatureWidth - marginRight,
        y: marginBottom,
        width: signatureWidth,
        height: signatureHeight,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();

  //   const blob = new Blob([pdfBytes], {
  //     type: "application/pdf",
  //   });

  //   const url = URL.createObjectURL(blob);

  //   const a = document.createElement("a");

  //   a.href = url;

  //   a.download = "EmploymentContract.pdf";

  //   a.click();

  //   URL.revokeObjectURL(url);

  return pdfBytes;
}
