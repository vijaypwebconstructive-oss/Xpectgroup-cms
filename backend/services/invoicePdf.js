import { createRequire } from "module";
const require = createRequire(import.meta.url);

const PDFDocument = require("pdfkit");

export const generateInvoicePdf = async (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ===== HEADER =====
    doc
      .fontSize(10)
      .text(data.billBy?.companyName || "", 40, 40)
      .text(data.billBy?.companyAddress || "")
      .text(data.billBy?.email || "")
      .text(data.billBy?.phone || "");

    doc.fontSize(22).text("INVOICE", 400, 40, { align: "right" });

    doc.moveDown(2);

    // ===== META =====
    doc.fontSize(10);
    doc.text(`Invoice Number: ${data.invoiceNumber}`);
    doc.text(
      `Issue Date: ${new Date(data.issueDate).toLocaleDateString("en-GB")}`,
    );
    doc.text(`Due Date: ${new Date(data.dueDate).toLocaleDateString("en-GB")}`);
    doc.text(`CRN: ${data.billBy?.CRN || "-"}`);

    doc.moveDown();

    // ===== BILL =====
    const y = doc.y;

    doc.text("BILL BY", 40, y);
    doc.text("BILL TO", 300, y);

    doc.moveDown();

    doc.text(data.billBy?.companyName || "", 40);
    doc.text(data.billTo?.clientName || "", 300);

    doc.text(data.billBy?.companyAddress || "", 40);
    doc.text(data.billTo?.clientAddress || "", 300);

    doc.text(data.billBy?.email || "", 40);
    doc.text(data.billTo?.email || "", 300);

    doc.text(data.billBy?.phone || "", 40);
    doc.text(data.billTo?.phone || "", 300);

    doc.moveDown(2);

    // ===== TABLE =====
    const tableTop = doc.y;
    const col = [40, 80, 260, 320, 380, 450];

    const drawRow = (y, row) => {
      row.forEach((text, i) => doc.text(text, col[i], y));
    };

    drawRow(tableTop, ["No", "Service", "Qty", "Rate", "Disc", "Amount"]);
    doc
      .moveTo(40, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let yPos = tableTop + 25;

    data.serviceItems.forEach((item, i) => {
      drawRow(yPos, [
        String(i + 1).padStart(2, "0"),
        item.serviceDescription,
        item.quantity.toString(),
        `£${item.rate}`,
        `${item.discount}%`,
        `£${item.amount}`,
      ]);
      yPos += 20;
    });

    // ===== TOTALS =====
    const totalsY = yPos + 20;

    const totals = [
      ["Subtotal", data.subtotal],
      ["Discount", data.discount],
      ["VAT", data.vat],
      ["Service Charges", data.serviceCharges],
      ["Total", data.totalAmount],
      ["Payable", data.payableAmount],
    ];

    totals.forEach(([label, value], i) => {
      doc.text(label, 350, totalsY + i * 15);
      doc.text(`£${value}`, 500, totalsY + i * 15, { align: "right" });
    });

    // ===== RIGHT SIDE PANEL =====
    const rightX = 350;
    let rightY = totalsY + 120;

    doc
      .fontSize(12)
      .text("SERVICE DETAILS", rightX, rightY, { underline: true });

    rightY += 20;

    doc.fontSize(10);
    doc.text(`Service Period: ${data.servicePeriod || "-"}`, rightX, rightY);

    rightY += 15;

    doc.text(
      `Site Location: ${data.billTo?.clientAddress || "-"}`,
      rightX,
      rightY,
    );

    rightY += 25;

    doc.fontSize(12).text("NOTES", rightX, rightY, { underline: true });

    rightY += 20;

    doc
      .fontSize(10)
      .text(
        data.notes ||
          "Thank you for your business. Please make payment within the specified terms.",
        rightX,
        rightY,
        { width: 200 },
      );

    // ===== FOOTER =====
    doc
      .fontSize(9)
      .text(
        data.footer ||
          "This is a computer-generated invoice. For queries contact accounts.",
        350,
        750,
        { width: 200, align: "right" },
      );

    doc.end();
  });
};
