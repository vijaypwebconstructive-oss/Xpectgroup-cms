import { createRequire } from "module";
const require = createRequire(import.meta.url);

const PDFDocument = require("pdfkit");

export const generateInvoicePdf = async (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ===== HEADER =====
    doc
      .fontSize(10)
      .text(invoice.billBy?.companyName || "", 40, 40)
      .text(invoice.billBy?.companyAddress || "")
      .text(invoice.billBy?.email || "")
      .text(invoice.billBy?.phone || "");

    doc.fontSize(22).text("INVOICE", 400, 40, { align: "right" });

    doc.moveDown(2);

    // ===== META =====
    doc.fontSize(10);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(
      `Issue Date: ${new Date(invoice.issueDate).toLocaleDateString("en-GB")}`,
    );
    doc.text(
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString("en-GB")}`,
    );
    doc.text(`CRN: ${invoice.billBy?.CRN || "-"}`);

    doc.moveDown();

    // ===== BILL SECTION =====
    const y = doc.y;

    doc.text("BILL BY", 40, y);
    doc.text("BILL TO", 300, y);

    doc.moveDown();

    doc.text(invoice.billBy?.companyName || "", 40);
    doc.text(invoice.billTo?.clientName || "", 300);

    doc.text(invoice.billBy?.companyAddress || "", 40);
    doc.text(invoice.billTo?.clientAddress || "", 300);

    doc.text(invoice.billBy?.email || "", 40);
    doc.text(invoice.billTo?.email || "", 300);

    doc.text(invoice.billBy?.phone || "", 40);
    doc.text(invoice.billTo?.phone || "", 300);

    doc.moveDown(2);

    // ===== TABLE =====
    const tableTop = doc.y;
    const col = [40, 80, 260, 320, 380, 450, 520];

    const drawRow = (y, row) => {
      row.forEach((text, i) => {
        doc.text(text, col[i], y);
      });
    };

    // Header
    drawRow(tableTop, ["No", "Service", "Qty", "Rate", "Disc", "Amount"]);

    doc
      .moveTo(40, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Rows
    let yPos = tableTop + 25;

    invoice.serviceItems.forEach((item, i) => {
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

    doc.moveDown();

    // ===== TOTALS BOX =====
    const totalsY = yPos + 20;

    const totals = [
      ["Subtotal", invoice.subtotal],
      ["Discount", invoice.discount],
      ["VAT", invoice.vat],
      ["Service Charges", invoice.serviceCharges],
      ["Total", invoice.totalAmount],
      ["Payable", invoice.payableAmount],
    ];

    totals.forEach(([label, value], i) => {
      doc.text(label, 350, totalsY + i * 15);
      doc.text(`£${value}`, 500, totalsY + i * 15, {
        align: "right",
      });
    });

    // ===== SERVICE DETAILS =====
    doc.moveDown(6);

    doc.fontSize(12).text("SERVICE DETAILS", { underline: true });

    doc.fontSize(10);
    doc.text(`Service Period: ${invoice.servicePeriod || "-"}`);
    doc.text(`Site Location: ${invoice.billTo?.clientAddress || "-"}`);

    // ===== NOTES =====
    doc.moveDown();

    doc.fontSize(12).text("NOTES", { underline: true });
    doc.fontSize(10).text(invoice.notes || "");

    // ===== FOOTER =====
    doc.moveDown();
    doc.fontSize(9).text(invoice.footer || "");

    doc.end();
  });
};
