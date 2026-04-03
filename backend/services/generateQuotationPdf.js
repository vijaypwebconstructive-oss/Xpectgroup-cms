import html_to_pdf from "html-pdf-node";

export const generateQuotationPdf = async (quotation) => {
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
          <strong>${quotation.billBy?.companyName}</strong><br/>
          ${quotation.billBy?.companyAddress}<br/>
          ${quotation.billBy?.email}<br/>
          ${quotation.billBy?.phone}
        </div>

        <div class="title">QUOTATION</div>
      </div>

      <!-- META -->
      <div class="section">
        <strong>Quotation Number:</strong> ${quotation.quotationNumber || quotation.id}<br/>
        <strong>Issue Date:</strong> ${formatDate(quotation.issueDate)}<br/>
        <strong>Valid Until:</strong> ${formatDate(quotation.validUntil || quotation.dueDate)}
      </div>

      <!-- BILL -->
      <div class="section grid">
        <div class="box">
          <strong>BILL BY</strong><br/>
          ${quotation.billBy?.companyName}<br/>
          ${quotation.billBy?.companyAddress}<br/>
          ${quotation.billBy?.email}<br/>
          ${quotation.billBy?.phone}
        </div>

        <div class="box">
          <strong>BILL TO</strong><br/>
          ${quotation.billTo?.clientName}<br/>
          ${quotation.billTo?.clientAddress}<br/>
          Contact: ${quotation.billTo?.contactPerson}<br/>
          ${quotation.billTo?.email}<br/>
          ${quotation.billTo?.phone}
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
          ${quotation.serviceItems
            .map(
              (item, i) => `
            <tr>
              <td>${String(i + 1).padStart(2, "0")}</td>
              <td>${item.serviceDescription}</td>
              <td>${item.quantity}</td>
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
        <div><span>Subtotal</span><span>£${quotation.subtotal}</span></div>
        <div><span>Discount</span><span>£${quotation.discount}</span></div>
        <div class="bold"><span>Total</span><span>£${quotation.totalAmount}</span></div>
      </div>

      <div style="clear: both;"></div>

      <!-- NOTES -->
      <div class="card">
        <div class="card-title">NOTES</div>
        <div>${quotation.notes || ""}</div>
      </div>

    </body>
  </html>
  `;

  return await html_to_pdf.generatePdf({ content: html }, { format: "A4" });
};
