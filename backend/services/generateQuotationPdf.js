import puppeteer from "puppeteer";

export const generateQuotationPdf = async (quotationId) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  const url = `${process.env.FRONTEND_URL}/finance-management/quotation/view/${quotationId}?print=true`;

  await page.goto(url, {
    waitUntil: "networkidle0",
  });

  // ✅ IMPORTANT: use correct container
  await page.waitForSelector("#quotation-print-container");

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
};
