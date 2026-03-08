import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PayslipSettings from '../models/PayslipSettings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(path.dirname(__dirname), 'uploads', 'salary-slips');

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const DEFAULT_SETTINGS = {
  payType: 'Hourly',
  company: {
    companyName: 'Xpect Group',
    companyAddress: 'Address Line 1, City, Postcode',
    payeReference: '123/AB45678',
  },
  earningsRows: [
    { description: 'Basic Pay', hours: '160', rate: '10.00', amount: '1600.00' },
    { description: 'Overtime Pay', hours: '0', rate: '15.00', amount: '0.00' },
    { description: 'Holiday Pay', hours: '0', rate: '10.00', amount: '0.00' },
    { description: 'Bonus', hours: '0', rate: '0.00', amount: '0.00' },
    { description: 'Allowance', hours: '0', rate: '0.00', amount: '0.00' },
  ],
  deductionsRows: [
    { description: 'PAYE Tax', amount: '150.00' },
    { description: 'National Insurance', amount: '85.00' },
    { description: 'Pension Contribution', amount: '75.00' },
    { description: 'Student Loan', amount: '0.00' },
    { description: 'Other Deductions', amount: '0.00' },
  ],
  leaveRows: [
    { leaveType: 'Annual Leave', entitled: '28', used: '5', balance: '23' },
    { leaveType: 'Sick Leave', entitled: '10', used: '0', balance: '10' },
  ],
  ytdSummary: {
    grossPayYTD: '19200.00',
    taxPaidYTD: '1800.00',
    niPaidYTD: '1020.00',
    pensionYTD: '900.00',
  },
};

/**
 * Build template data from payroll record + settings (mirrors frontend buildPayslipTemplateData).
 * Ensures PDF and email attachments match PayslipTemplate layout.
 */
function buildTemplateData(record, settings) {
  const s = settings || DEFAULT_SETTINGS;
  const payType = record.payType === 'Monthly' ? 'Monthly' : (s.payType || 'Hourly');
  const isMonthly = payType === 'Monthly';

  const monthLabel = MONTHS[record.month] || String(record.month);
  const year = record.year || '';
  const payPeriod = `${monthLabel} ${year}`;
  const payDate = record.paymentDate || '—';
  const payslipNumber = `PS-${record.id}`;

  const company = s.company || DEFAULT_SETTINGS.company;
  const totalSalary = record.totalSalary ?? 0;
  const grossPay = totalSalary.toFixed(2);

  const earningsTemplate = s.earningsRows || DEFAULT_SETTINGS.earningsRows;
  const earningsRows = earningsTemplate.map((row, i) => {
    if (i === 0 && row.description === 'Basic Pay') {
      if (isMonthly) {
        const amt = record.monthlySalary ?? record.totalSalary ?? 0;
        return { description: 'Basic Pay', hours: '—', rate: '—', amount: amt.toFixed(2) };
      }
      return {
        description: 'Basic Pay',
        hours: String(record.hoursWorked ?? 160),
        rate: (record.hourlyRate ?? 0).toFixed(2),
        amount: (record.totalSalary ?? 0).toFixed(2),
      };
    }
    return { ...row };
  });

  const deductionsRows = s.deductionsRows || DEFAULT_SETTINGS.deductionsRows;
  const totalDeductions = deductionsRows
    .reduce((sum, r) => sum + (parseFloat(String(r.amount).replace(/,/g, '')) || 0), 0)
    .toFixed(2);
  const netPay = (parseFloat(grossPay) - parseFloat(totalDeductions)).toFixed(2);

  const ytd = s.ytdSummary || DEFAULT_SETTINGS.ytdSummary;

  return {
    company: {
      companyName: company.companyName || 'Xpect Group',
      companyAddress: company.companyAddress || 'Address Line 1, City, Postcode',
      payeReference: company.payeReference || '123/AB45678',
      payPeriod,
      payDate,
      payslipNumber,
    },
    employee: {
      employeeId: record.workerId || '—',
      employeeName: record.workerName || '—',
      department: 'Operations',
      jobTitle: record.role || 'Cleaner',
      niNumber: '',
      taxCode: '',
    },
    earningsRows,
    deductionsRows,
    grossPay,
    totalDeductions,
    netPay,
    ytdSummary: ytd,
    leaveRows: s.leaveRows || DEFAULT_SETTINGS.leaveRows,
  };
}

/**
 * Generate a salary slip PDF matching the PayslipTemplate layout.
 * Uses PayslipSettings for company, structure; payroll record for employee data.
 * @param {object} record - Payroll record
 * @param {object} [settings] - Optional PayslipSettings document (loads from DB if not provided)
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateSalarySlipPdf(record, settings = null) {
  let s = settings;
  if (!s) {
    const doc = await PayslipSettings.findOne({ id: 'default' }).lean();
    s = doc || DEFAULT_SETTINGS;
  }

  const data = buildTemplateData(record, s);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const gray = rgb(0.42, 0.48, 0.6);
  const dark = rgb(0.05, 0.07, 0.11);
  const darkBg = rgb(0.18, 0.25, 0.31); // #2e4150
  const white = rgb(1, 1, 1);

  let y = 800;
  const margin = 50;
  const colWidth = 240;

  const drawText = (text, x, size = 10, useBold = false, color = dark) => {
    const f = useBold ? fontBold : font;
    const lines = String(text || '').split('\n');
    for (const line of lines) {
      page.drawText(line.substring(0, 80), { x, y, size, font: f, color });
      y -= size + 2;
    }
  };

  // Header
  drawText(data.company.companyName, margin, 14, true);
  drawText(data.company.companyAddress, margin, 9, false, gray);
  drawText(`PAYE Reference: ${data.company.payeReference}`, margin, 9, false, gray);
  y -= 8;

  const rightX = margin + colWidth + 60;
  let headerY = 800;
  page.drawText('PAYSLIP', { x: rightX, y: headerY, size: 16, font: fontBold, color: dark });
  headerY -= 22;
  page.drawText(`Pay Period: ${data.company.payPeriod}`, { x: rightX, y: headerY, size: 10, font, color: dark });
  headerY -= 14;
  page.drawText(`Pay Date: ${data.company.payDate}`, { x: rightX, y: headerY, size: 10, font, color: dark });
  headerY -= 14;
  page.drawText(`Payslip Number: ${data.company.payslipNumber}`, { x: rightX, y: headerY, size: 10, font, color: dark });

  y = Math.min(y, headerY) - 20;

  // Employee Information
  drawText('EMPLOYEE INFORMATION', margin, 9, true, gray);
  y -= 14;

  const empRows = [
    ['Employee ID', data.employee.employeeId],
    ['Employee Name', data.employee.employeeName],
    ['Department', data.employee.department],
    ['Job Title', data.employee.jobTitle],
    ['NI Number', data.employee.niNumber || '—'],
    ['Tax Code', data.employee.taxCode || '—'],
  ];
  for (const [label, value] of empRows) {
    page.drawText(label, { x: margin, y, size: 9, font, color: gray });
    page.drawText(String(value), { x: margin + 140, y, size: 9, font, color: dark });
    y -= 16;
  }
  y -= 12;

  // Earnings & Deductions (side by side conceptually; we draw earnings then deductions)
  drawText('EARNINGS', margin, 9, true, gray);
  y -= 10;
  page.drawText('Description', { x: margin, y, size: 8, font: fontBold, color: gray });
  page.drawText('Hours', { x: margin + 140, y, size: 8, font: fontBold, color: gray });
  page.drawText('Rate', { x: margin + 180, y, size: 8, font: fontBold, color: gray });
  page.drawText('Amount', { x: margin + 230, y, size: 8, font: fontBold, color: gray });
  y -= 10;

  for (const row of data.earningsRows) {
    page.drawText(row.description, { x: margin, y, size: 8, font, color: dark });
    page.drawText(row.hours, { x: margin + 140, y, size: 8, font, color: dark });
    page.drawText(row.rate, { x: margin + 180, y, size: 8, font, color: dark });
    page.drawText(row.amount, { x: margin + 230, y, size: 8, font, color: dark });
    y -= 12;
  }
  page.drawText('Gross Pay', { x: margin, y, size: 8, font: fontBold, color: dark });
  page.drawText(`£${data.grossPay}`, { x: margin + 230, y, size: 8, font: fontBold, color: dark });
  y -= 18;

  page.drawText('DEDUCTIONS', { x: margin, y, size: 9, font: fontBold, color: gray });
  y -= 10;
  page.drawText('Description', { x: margin, y, size: 8, font: fontBold, color: gray });
  page.drawText('Amount', { x: margin + 200, y, size: 8, font: fontBold, color: gray });
  y -= 10;

  for (const row of data.deductionsRows) {
    page.drawText(row.description, { x: margin, y, size: 8, font, color: dark });
    page.drawText(`£${row.amount}`, { x: margin + 200, y, size: 8, font, color: dark });
    y -= 12;
  }
  page.drawText('Total Deductions', { x: margin, y, size: 8, font: fontBold, color: dark });
  page.drawText(`£${data.totalDeductions}`, { x: margin + 200, y, size: 8, font: fontBold, color: dark });
  y -= 20;

  // Net Pay Summary (dark box)
  page.drawRectangle({
    x: margin,
    y: y - 70,
    width: 495,
    height: 70,
    color: darkBg,
  });
  page.drawText('Gross Pay', { x: margin + 8, y: y - 12, size: 9, font, color: white });
  page.drawText(`£${data.grossPay}`, { x: margin + 400, y: y - 12, size: 9, font, color: white });
  page.drawText('Total Deductions', { x: margin + 8, y: y - 26, size: 9, font, color: white });
  page.drawText(`£${data.totalDeductions}`, { x: margin + 400, y: y - 26, size: 9, font, color: white });
  page.drawText('Net Pay', { x: margin + 8, y: y - 44, size: 10, font: fontBold, color: white });
  page.drawText(`£${data.netPay}`, { x: margin + 400, y: y - 44, size: 10, font: fontBold, color: white });
  y -= 90;

  // YTD Summary
  drawText('YEAR TO DATE SUMMARY', margin, 9, true, gray);
  y -= 10;
  const ytd = data.ytdSummary || {};
  const ytdRows = [
    ['Gross Pay YTD', ytd.grossPayYTD || '0.00'],
    ['Tax Paid YTD', ytd.taxPaidYTD || '0.00'],
    ['NI Paid YTD', ytd.niPaidYTD || '0.00'],
    ['Pension YTD', ytd.pensionYTD || '0.00'],
  ];
  for (const [label, val] of ytdRows) {
    page.drawText(label, { x: margin, y, size: 8, font, color: gray });
    page.drawText(`£${val}`, { x: margin + 200, y, size: 8, font, color: dark });
    y -= 12;
  }
  y -= 12;

  // Leave Summary
  if (data.leaveRows && data.leaveRows.length > 0) {
    page.drawText('LEAVE SUMMARY', { x: margin, y, size: 9, font: fontBold, color: gray });
    y -= 10;
    page.drawText('Leave Type', { x: margin, y, size: 8, font: fontBold, color: gray });
    page.drawText('Entitled', { x: margin + 120, y, size: 8, font: fontBold, color: gray });
    page.drawText('Used', { x: margin + 180, y, size: 8, font: fontBold, color: gray });
    page.drawText('Balance', { x: margin + 230, y, size: 8, font: fontBold, color: gray });
    y -= 10;
    for (const row of data.leaveRows) {
      page.drawText(row.leaveType, { x: margin, y, size: 8, font, color: dark });
      page.drawText(row.entitled, { x: margin + 120, y, size: 8, font, color: dark });
      page.drawText(row.used, { x: margin + 180, y, size: 8, font, color: dark });
      page.drawText(row.balance, { x: margin + 230, y, size: 8, font, color: dark });
      y -= 12;
    }
    y -= 12;
  }

  // Footer
  y = Math.max(y, 80);
  page.drawText('This is a computer generated payslip and does not require a signature.', {
    x: margin,
    y,
    size: 8,
    font,
    color: gray,
  });
  y -= 12;
  page.drawText('For any discrepancies please contact HR department within 7 days.', {
    x: margin,
    y,
    size: 8,
    font,
    color: gray,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Save PDF to disk and return paths
 */
export async function saveSalarySlipPdf(buffer, slipId) {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  const filename = `salary-slip-${slipId}.pdf`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(fullPath, buffer);
  const relativePath = path.join('uploads', 'salary-slips', filename).replace(/\\/g, '/');
  return { fullPath, relativePath };
}
