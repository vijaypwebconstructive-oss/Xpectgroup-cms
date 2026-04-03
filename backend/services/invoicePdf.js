import html_to_pdf from "html-pdf-node";

export const generateInvoicePdf = async (invoice) => {
  const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");

  const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          padding: 30px;
          color: #000;
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .company {
          line-height: 1.5;
        }

        .title {
          font-size: 28px;
          font-weight: bold;
        }

        .section {
          margin-top: 20px;
        }

        .grid {
          display: flex;
          justify-content: space-between;
        }

        .box {
          width: 48%;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          border: 1px solid #000;
          padding: 8px;
        }

        th {
          background: #f2f2f2;
        }

        .totals {
          margin-top: 15px;
          width: 300px;
          float: right;
        }

        .totals div {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
        }

        .bold {
          font-weight: bold;
        }

        .card {
          margin-top: 30px;
          background: #f3f5f9;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 20px;
        }

        .card-title {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 15px;
          color: #4b5563;
        }

        .row {
          margin-bottom: 12px;
        }

        .row.two {
          display: flex;
          justify-content: space-between;
        }

        .row.two > div {
          width: 48%;
        }

        .label {
          font-size: 11px;
          color: #6b7280;
        }

        .value {
          font-size: 13px;
          font-weight: 500;
        }

      </style>
    </head>

    <body>

      <!-- HEADER -->
      <div class="header">
        <div class="company">
          <strong>${invoice.billBy?.companyName}</strong><br/>
          ${invoice.billBy?.companyAddress}<br/>
          ${invoice.billBy?.email}<br/>
          ${invoice.billBy?.phone}
        </div>

        <div class="title">INVOICE</div>
      </div>

      <!-- META -->
      <div class="section">
        <strong>Invoice Number:</strong> ${invoice.invoiceNumber}<br/>
        <strong>Issue Date:</strong> ${formatDate(invoice.issueDate)}<br/>
        <strong>Due Date:</strong> ${formatDate(invoice.dueDate)}<br/>
        <strong>CRN:</strong> ${invoice.billBy?.CRN || "-"}
      </div>

      <!-- BILL -->
      <div class="section grid">
        <div class="box">
          <strong>BILL BY</strong><br/>
          ${invoice.billBy?.companyName}<br/>
          ${invoice.billBy?.companyAddress}<br/>
          ${invoice.billBy?.email}<br/>
          ${invoice.billBy?.phone}
        </div>

        <div class="box">
          <strong>BILL TO</strong><br/>
          ${invoice.billTo?.clientName}<br/>
          ${invoice.billTo?.clientAddress}<br/>
          Contact: ${invoice.billTo?.contactPerson}<br/>
          ${invoice.billTo?.email}<br/>
          ${invoice.billTo?.phone}
        </div>
      </div>

      <!-- TABLE -->
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Service Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Discount</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          ${invoice.serviceItems
            .map(
              (item, i) => `
            <tr>
              <td>${String(i + 1).padStart(2, "0")}</td>
              <td>${item.serviceDescription}</td>
              <td>${item.quantity} visits</td>
              <td>£${item.rate}</td>
              <td>${item.discount}%</td>
              <td>£${item.amount}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <!-- TOTAL -->
      <div class="totals">
        <div><span>Subtotal</span><span>£${invoice.subtotal}</span></div>
        <div><span>Discount</span><span>£${invoice.discount}</span></div>
        <div><span>VAT</span><span>£${invoice.vat}</span></div>
        <div><span>Service Charges</span><span>£${invoice.serviceCharges}</span></div>
        <div class="bold"><span>Total</span><span>£${invoice.totalAmount}</span></div>
        <div class="bold"><span>Payable</span><span>£${invoice.payableAmount}</span></div>
      </div>

      <div style="clear: both;"></div>

      <!-- SERVICE DETAILS -->
      <div class="card">
        <div class="card-title">SERVICE DETAILS</div>

        <div class="row">
          <div class="label">Service Period</div>
          <div class="value">${invoice.servicePeriod || "-"}</div>
        </div>

        <div class="row two">
          <div>
            <div class="label">Site Location</div>
            <div class="value">${invoice.billTo?.clientAddress || "-"}</div>
          </div>

          <div>
            <div class="label">Site Type</div>
            <div class="value">-</div>
          </div>
        </div>

        <div class="row">
          <div class="label">Supervisor Name</div>
          <div class="value">-</div>
        </div>
      </div>

      <!-- NOTES -->
      <div class="card">
        <div class="card-title">NOTES</div>
        <div>${invoice.notes || ""}</div>
      </div>

      <!-- FOOTER -->
      <div class="section" style="margin-top: 30px; font-size: 11px;">
        ${invoice.footer || ""}
      </div>

    </body>
  </html>
  `;

  return await html_to_pdf.generatePdf({ content: html }, { format: "A4" });
};
