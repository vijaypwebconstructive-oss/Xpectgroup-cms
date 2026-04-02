import puppeteer from "puppeteer";

export const generateInvoicePdf = async (invoiceId) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  const url = `${process.env.FRONTEND_URL}/finance-management/invoice/view/${invoiceId}?print=true`;

  await page.goto(url, {
    waitUntil: "networkidle0",
  });

  // wait for your UI
  await page.waitForSelector("#invoice-print-container");

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
};
