
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface ThankYouViewProps {
  onNavigate: (view: AppView) => void;
}

const ThankYouView: React.FC<ThankYouViewProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<any>(null);
  const [applicationRef, setApplicationRef] = useState<string>('');

  useEffect(() => {
    const stored = sessionStorage.getItem('lastSubmittedForm');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFormData(parsed);
        setApplicationRef(parsed.applicationRef || `XPG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
      } catch (e) {
        console.error('Error parsing form data:', e);
        setApplicationRef(`XPG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
      }
    } else {
      setApplicationRef(`XPG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    }
  }, []);

  const handleDownload = () => {
    if (!formData) {
      alert('Form data not found. Please submit the form again.');
      return;
    }

    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF');
      return;
    }

    const { applicationRef: storedRef, personalDetails, citizenshipStatus, visaType, visaOther, shareCode, uniName, courseName, termStart, termEnd, workPreference, employmentType, hasDBS, declarations, uploadedFiles, passportPhoto } = formData;
    const refToUse = storedRef || applicationRef;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Xpect Group - Employee Onboarding Form</title>
          <style>
            @page { margin: 1cm; }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              border-bottom: 3px solid #2e4150;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header-content {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 20px;
            }
            .header-text {
              flex: 1;
              text-align: left;
            }
            .header h1 {
              color: #2e4150;
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
              font-size: 14px;
            }
            .photo-container {
              flex-shrink: 0;
            }
            .photo-container img {
              width: 120px;
              height: 150px;
              object-fit: cover;
              border: 2px solid #2e4150;
              border-radius: 8px;
            }
            .photo-label {
              text-align: center;
              font-size: 10px;
              color: #666;
              margin-top: 5px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              background-color: #2e4150;
              color: white;
              padding: 10px 15px;
              font-weight: bold;
              margin-bottom: 15px;
              font-size: 18px;
              text-transform: uppercase;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #4c669a;
              font-size: 16px;
              text-transform: uppercase;
              margin-bottom: 3px;
            }
            .info-value {
              font-size: 14px;
              color: #333;
            }
            .full-width {
              grid-column: 1 / -1;
            }
            .declarations {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 15px;
            }
            .declaration-item {
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 5px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .check {
              color: #34d399;
              font-weight: bold;
            }
            .cross {
              color: #ef4444;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e7ebf3;
              text-align: center;
              font-size: 14px;
              color: #666;
            }
            .file-list {
              margin-top: 10px;
              padding-left: 20px;
            }
            .file-item {
              margin: 5px 0;
              font-size: 12px;
              color: #555;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-content">
              <div class="header-text">
                <h1>XPECT GROUP</h1>
                <p>Employee Onboarding Application Form</p>
                <p>Application Reference: ${refToUse}</p>
                <p>Submitted: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              ${passportPhoto ? `
              <div class="photo-container">
                <img src="${passportPhoto}" alt="Passport Photo" />
              </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${personalDetails.name || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date of Birth</div>
                <div class="info-value">${personalDetails.dob || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-value">${personalDetails.email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${personalDetails.phoneNumber || 'N/A'}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">Address</div>
                <div class="info-value">${personalDetails.address || 'N/A'}</div>
              </div>
              ${personalDetails.gender ? `
              <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${personalDetails.gender}</div>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Citizenship & Immigration Status</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Citizenship Status</div>
                <div class="info-value">${citizenshipStatus || 'N/A'}</div>
              </div>
              ${visaType ? `
              <div class="info-item">
                <div class="info-label">Visa Type</div>
                <div class="info-value">${visaType}${visaOther ? ` (${visaOther})` : ''}</div>
              </div>
              ` : ''}
              ${shareCode ? `
              <div class="info-item">
                <div class="info-label">RTW Share Code</div>
                <div class="info-value">${shareCode}</div>
              </div>
              ` : ''}
            </div>
            ${uniName ? `
            <div style="margin-top: 15px; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #135bec;">
              <div style="font-weight: bold; margin-bottom: 10px; color: #135bec;">Student Visa Details</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">University/College</div>
                  <div class="info-value">${uniName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Course</div>
                  <div class="info-value">${courseName || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Term Start</div>
                  <div class="info-value">${termStart || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Term End</div>
                  <div class="info-value">${termEnd || 'N/A'}</div>
                </div>
              </div>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Employment Details</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Employment Type</div>
                <div class="info-value">${employmentType || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Work Preference</div>
                <div class="info-value">${workPreference || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">DBS Status</div>
                <div class="info-value">${hasDBS ? 'Certificate Provided' : 'To be initiated'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Uploaded Documents</div>
            <div class="file-list">
              ${Object.keys(uploadedFiles).length > 0 ? 
                Object.entries(uploadedFiles).map(([key, file]: [string, any]) => 
                  `<div class="file-item">• ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)</div>`
                ).join('') 
                : '<div class="file-item">No documents uploaded</div>'
              }
            </div>
          </div>

          <div class="section">
            <div class="section-title">Declarations</div>
            <div class="declarations">
              <div class="declaration-item">
                <span class="${declarations.accuracy ? 'check' : 'cross'}">${declarations.accuracy ? '✓' : '✗'}</span>
                <span>Information Accuracy Confirmed</span>
              </div>
              <div class="declaration-item">
                <span class="${declarations.rtw ? 'check' : 'cross'}">${declarations.rtw ? '✓' : '✗'}</span>
                <span>Right-to-Work Verification Consent</span>
              </div>
              <div class="declaration-item">
                <span class="${declarations.approval ? 'check' : 'cross'}">${declarations.approval ? '✓' : '✗'}</span>
                <span>Employment Subject to Approval</span>
              </div>
              <div class="declaration-item">
                <span class="${declarations.gdpr ? 'check' : 'cross'}">${declarations.gdpr ? '✓' : '✗'}</span>
                <span>GDPR Data Storage Consent</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Confidential - Xpect Group Ltd</strong></p>
            <p>This document is a digital representation of the submitted onboarding application.</p>
            <p>Application Reference: ${refToUse} | Generated: ${new Date().toLocaleString('en-GB')}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 min-h-[calc(100vh-160px)] animate-in fade-in zoom-in-95 duration-700">
      <div className="max-w-[640px] w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100 p-4 sm:p-10 md:p-16 flex flex-col items-center text-center ">
        
        {/* Success Icon with Animation Container */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-40 animate-pulse"></div>
          <div className="relative size-16 bg-[#34d399] text-white rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl font-bold animate-in zoom-in duration-500 delay-200 fill-0">check_circle</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-black text-gray-900 mb-4">Application Submitted!</h1>
        <p className="text-base sm:text-lg text-[#4c669a] font-medium leading-relaxed mb-4">
          Thank you for applying to join <span className=" font-bold">Xpect Group</span>. Your profile has been sent to our compliance team for review.
        </p>

        {/* Action Area */}
        <div className="w-full space-y-4 mb-6 sm:mb-10">
          <button 
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-3 bg-[#2e4150] text-white h-12 rounded-2xl font-black text-base font-semibold hover:-translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined">download</span>
            Download Your Form (PDF)
          </button>
          
          {/* <button 
            onClick={() => onNavigate('DASHBOARD')}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-600 h-12 rounded-2xl font-bold text-base hover:bg-gray-50 hover:border-gray-200 transition-all"
          >
            Return to Dashboard
          </button> */}
        </div>

        {/* Physical Copy Notice Card */}
        <div className="w-full bg-amber-50 border-2 border-amber-100/50 rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row items-center md:items-start gap-4 text-left">
          <div className="size-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">description</span>
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider mb-1">Physical Copy Required</h4>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Before your official start date, you <span className="font-black underline">must</span> provide a <span className="font-black">physical copy</span> of all your documents (Passport, BRP, DBS Certificate, etc.) to your respective <span className="font-black">Xpect Group office</span> for final verification.
            </p>
          </div>
        </div>

        {/* Reference */}
        <div className="mt-8 pt-8 border-t border-gray-100 w-full flex flex-col items-center gap-2">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Application Reference</p>
          <code className="bg-gray-50 px-4 py-1.5 rounded-full text-xs font-black text-gray-500 tracking-widest border border-gray-100">{applicationRef || `XPG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`}</code>
        </div>
      </div>
      
      {/* Footer hint */}
      {/* <p className="mt-8 text-xs text-gray-400 font-medium italic">
        A confirmation email has been sent to your registered address.
      </p> */}
    </div>
  );
};

export default ThankYouView;
