
import React, { useState, useEffect } from 'react';
import { Cleaner, AppView, VerificationStatus, Document, DocumentStatus } from '../types';
import { useCleaners } from '../context/CleanersContext';
import EmploymentAllocationCard, { PayType, ShiftType, ContractStatus, EmploymentDetails } from '../components/EmploymentAllocationCard';

interface CleanerDetailProps {
  cleaner?: Cleaner;
  onNavigate: (view: AppView, cleaner?: Cleaner) => void;
}

const CleanerDetail: React.FC<CleanerDetailProps> = ({ cleaner, onNavigate }) => {
  const { cleaners, updateCleaner, deleteCleaner } = useCleaners();
  
  // Early return if cleaner is not provided
  if (!cleaner) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-4 text-[#4c669a]">
          <button onClick={() => onNavigate('DASHBOARD')} className="hover:text-[#135bec] text-sm">Dashboard</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <button onClick={() => onNavigate('CLEANERS_LIST')} className="hover:text-[#135bec] text-sm">Staff</button>
        </div>
        <div className="bg-white border border-[#e7ebf3] rounded-2xl p-8 text-center">
          <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-gray-400 text-4xl animate-spin">hourglass_empty</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }
  
  // Get the latest cleaner data from context
  const currentCleaner = cleaners.find(c => c.id === cleaner.id) || cleaner;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedCleaner, setEditedCleaner] = useState(currentCleaner);
  const [verificationStatus, setVerificationStatus] = useState(currentCleaner.verificationStatus);
  const [auditorNotes, setAuditorNotes] = useState('');
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [documentStatusUpdates, setDocumentStatusUpdates] = useState<Record<string, DocumentStatus>>({});
  const [uploadingDocument, setUploadingDocument] = useState<{ docId: string; file: File } | null>(null);
  const [isEditingEmployment, setIsEditingEmployment] = useState(false);
  
  // Helper function to map preferredShiftPattern to shiftType
  const mapPreferredShiftPatternToShiftType = (preferredShiftPattern?: string): ShiftType | undefined => {
    if (!preferredShiftPattern) return undefined;
    if (preferredShiftPattern === 'Mornings Only') return ShiftType.MORNING;
    if (preferredShiftPattern === 'Afternoons Only') return ShiftType.EVENING;
    if (preferredShiftPattern === 'Evenings / Weekends') return ShiftType.EVENING;
    return undefined;
  };

  // Helper function to get employment details from cleaner
  const getEmploymentDetailsFromCleaner = (cleaner: Cleaner): EmploymentDetails => {
    const locationParts = cleaner.location?.split(', ') || [];
    // Use shiftType if available, otherwise map from preferredShiftPattern
    const shiftType = cleaner.shiftType as ShiftType | undefined || 
                      mapPreferredShiftPatternToShiftType(cleaner.preferredShiftPattern);
    
    return {
      hourlyPayRate: cleaner.hourlyPayRate,
      payType: cleaner.payType as PayType | undefined,
      workLocation: {
        siteName: locationParts[0] || 'Main Office',
        city: locationParts[1] || 'London'
      },
      shiftType: shiftType,
      contractStatus: cleaner.contractStatus as ContractStatus | undefined,
      startDate: cleaner.startDate,
      endDate: cleaner.endDate
    };
  };
  
  const [employmentDetails, setEmploymentDetails] = useState<EmploymentDetails>(
    getEmploymentDetailsFromCleaner(currentCleaner)
  );

  useEffect(() => {
    const updated = cleaners.find(c => c.id === cleaner.id) || cleaner;
    setEditedCleaner(updated);
    setVerificationStatus(updated.verificationStatus);
    // Update employment details when cleaner changes
    setEmploymentDetails(getEmploymentDetailsFromCleaner(updated));
  }, [cleaners, cleaner.id]);

  const handleSave = async () => {
    try {
      await updateCleaner(currentCleaner.id, { ...editedCleaner, verificationStatus });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCopyShareCode = async () => {
    if (currentCleaner.shareCode) {
      try {
        await navigator.clipboard.writeText(currentCleaner.shareCode);
        alert('Share code copied to clipboard!');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentCleaner.shareCode!;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Share code copied to clipboard!');
      }
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateCleaner(currentCleaner.id, { verificationStatus });
      alert('Verification status updated successfully!');
    } catch (error: any) {
      console.error('Failed to update verification status:', error);
      alert(`Failed to update verification status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRevokeVerification = async () => {
    if (confirm('Are you sure you want to revoke verification for this staff member?')) {
      try {
        await updateCleaner(currentCleaner.id, { verificationStatus: VerificationStatus.REJECTED });
        setVerificationStatus(VerificationStatus.REJECTED);
        alert('Verification revoked.');
      } catch (error: any) {
        console.error('Failed to revoke verification:', error);
        alert(`Failed to revoke verification: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${currentCleaner.name}? This action cannot be undone and will permanently remove all their data.`)) {
      try {
        await deleteCleaner(currentCleaner.id);
        alert('Staff member deleted successfully.');
        // Navigate back to staff list after deletion
        onNavigate('CLEANERS_LIST');
      } catch (error: any) {
        console.error('Failed to delete cleaner:', error);
        alert(`Failed to delete staff member: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Calculate these before useEffect to avoid initialization errors
  const isStudent = currentCleaner.visaType === 'Student Visa';
  const hasVisa = !!currentCleaner.visaType;
  const needsShareCode = currentCleaner.citizenshipStatus !== 'UK Citizen' && currentCleaner.citizenshipStatus !== 'Irish Citizen';

  // Initialize documents if they don't exist
  useEffect(() => {
    if (!currentCleaner.documents || currentCleaner.documents.length === 0) {
      const defaultDocuments: Document[] = [
        { 
          id: '1', 
          name: 'Identity Document', 
          type: 'PDF', 
          uploadDate: new Date().toISOString().split('T')[0], 
          status: DocumentStatus.PENDING 
        },
        { 
          id: '2', 
          name: 'DBS Certificate', 
          type: 'IMG', 
          uploadDate: new Date().toISOString().split('T')[0], 
          status: currentCleaner.dbsStatus === 'Cleared' ? DocumentStatus.VERIFIED : DocumentStatus.PENDING 
        },
        { 
          id: '3', 
          name: 'Proof of Address', 
          type: 'PDF', 
          uploadDate: new Date().toISOString().split('T')[0], 
          status: DocumentStatus.PENDING 
        },
        ...(needsShareCode ? [{
          id: '4', 
          name: 'RTW Share Code Screenshot', 
          type: 'IMG' as const, 
          uploadDate: new Date().toISOString().split('T')[0], 
          status: DocumentStatus.PENDING 
        }] : []),
        ...(isStudent ? [{
          id: '5', 
          name: 'Official Term Dates', 
          type: 'PDF' as const, 
          uploadDate: new Date().toISOString().split('T')[0], 
          status: DocumentStatus.PENDING 
        }] : [])
      ];
      updateCleaner(currentCleaner.id, { documents: defaultDocuments });
    }
  }, [currentCleaner.id, currentCleaner.documents, needsShareCode, isStudent, updateCleaner]);

  const handleViewDocument = (doc: Document) => {
    // Get the latest document data from currentCleaner to ensure we have the latest fileUrl
    const latestDoc = currentCleaner.documents?.find(d => d.id === doc.id) || doc;
    
    if (latestDoc.fileUrl) {
      setViewingDocument(latestDoc);
    } else {
      // If no fileUrl, check if we can upload
      const shouldUpload = confirm(`Document "${latestDoc.name}" does not have a file uploaded. Would you like to upload it now?`);
      if (shouldUpload) {
        handleUploadToDocument(latestDoc.id);
      }
    }
  };

  const handleCloseDocumentViewer = () => {
    setViewingDocument(null);
  };

  const handleDocumentStatusChange = (docId: string, newStatus: DocumentStatus) => {
    setDocumentStatusUpdates(prev => ({ ...prev, [docId]: newStatus }));
  };

  const handleSaveDocumentStatuses = async () => {
    if (currentCleaner.documents) {
      try {
        const updatedDocuments = currentCleaner.documents.map(doc => ({
          ...doc,
          status: documentStatusUpdates[doc.id] || doc.status
        }));
        await updateCleaner(currentCleaner.id, { documents: updatedDocuments });
        setDocumentStatusUpdates({});
        alert('Document statuses updated successfully!');
      } catch (error: any) {
        console.error('Failed to update document statuses:', error);
        alert(`Failed to update document statuses: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleSaveEmployment = async (details: EmploymentDetails) => {
    try {
      setEmploymentDetails(details);
      setIsEditingEmployment(false);
      // Save all employment details to the cleaner
      await updateCleaner(currentCleaner.id, {
        location: details.workLocation ? `${details.workLocation.siteName}, ${details.workLocation.city}` : currentCleaner.location,
        startDate: details.startDate || currentCleaner.startDate,
        endDate: details.endDate,
        hourlyPayRate: details.hourlyPayRate,
        payType: details.payType,
        shiftType: details.shiftType,
        contractStatus: details.contractStatus
      });
      alert('Employment details updated successfully!');
    } catch (error: any) {
      console.error('Failed to update employment details:', error);
      alert(`Failed to update employment details: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancelEmployment = () => {
    setIsEditingEmployment(false);
    // Reset to current cleaner's values
    setEmploymentDetails(getEmploymentDetailsFromCleaner(currentCleaner));
  };

  const handleDownloadDocument = (doc: Document) => {
    if (doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName || doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Document file not available for download.');
    }
  };

  const handleFileUpload = async (docId: string, file: File) => {
    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const fileUrl = reader.result as string;
      if (currentCleaner.documents) {
        const updatedDocuments = currentCleaner.documents.map(doc => 
          doc.id === docId 
            ? { ...doc, fileUrl, fileName: file.name, uploadDate: new Date().toISOString().split('T')[0] }
            : doc
        );
        updateCleaner(currentCleaner.id, { documents: updatedDocuments }).then(() => {
          setUploadingDocument(null);
          alert('Document uploaded successfully!');
        }).catch((error: any) => {
          console.error('Failed to upload document:', error);
          alert(`Failed to upload document: ${error.message || 'Unknown error'}`);
          setUploadingDocument(null);
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const docName = prompt('Enter document name:');
        if (docName) {
          const newDoc: Document = {
            id: 'doc-' + Date.now(),
            name: docName,
            type: file.type.includes('pdf') ? 'PDF' : file.type.includes('image') ? 'IMG' : 'DOC',
            uploadDate: new Date().toISOString().split('T')[0],
            status: DocumentStatus.PENDING,
            fileName: file.name
          };
          
          // Convert to base64 and add
          const reader = new FileReader();
          reader.onloadend = () => {
            newDoc.fileUrl = reader.result as string;
            const updatedDocuments = [...(currentCleaner.documents || []), newDoc];
            updateCleaner(currentCleaner.id, { documents: updatedDocuments }).then(() => {
              alert('Document added successfully!');
            }).catch((error: any) => {
              console.error('Failed to add document:', error);
              alert(`Failed to add document: ${error.message || 'Unknown error'}`);
            });
          };
          reader.readAsDataURL(file);
        }
      }
    };
    input.click();
  };

  const handleUploadToDocument = (docId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadingDocument({ docId, file });
        handleFileUpload(docId, file);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4 text-[#4c669a]">
        <button onClick={() => onNavigate('DASHBOARD')} className="hover:text-[#135bec] text-sm">Dashboard</button>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <button onClick={() => onNavigate('CLEANERS_LIST')} className="hover:text-[#135bec] text-sm">Staff</button>
        <span className="material-symbols-outlined text-sm text-[#0d121b]">chevron_right</span>
        <span className="text-[#0d121b] text-sm font-semibold">{cleaner.name} Profile</span>
      </div>

      <div className="bg-white border border-[#e7ebf3] rounded-2xl p-[16px] mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-4 items-start">
            <div className="size-14 sm:size-16 rounded-full  border border-[#e7ebf3] overflow-hidden shadow-inner">
              <img src={cleaner.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col w-[60%]">
              <div className="flex  gap-3 flex-col sm:items-start">
                <h1 className="text-[#0d121b] text-2xl font-bold font-black">{cleaner.name}</h1>
                <span className={`px-3 py-1 text-[10px] w-fit font-black rounded-full uppercase tracking-widest ${
                  cleaner.verificationStatus === VerificationStatus.VERIFIED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {cleaner.verificationStatus}
                </span>
              </div>
              <div className="flex gap-x-6 sm:flex-row flex-col gap-y-1 mt-2">
                <div className="flex items-center gap-2 text-[#4c669a] text-sm font-medium">
                  <span className="material-symbols-outlined text-base">mail</span>
                  <span>{cleaner.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#4c669a] text-sm font-medium">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  <span>{cleaner.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[#4c669a] text-sm font-medium">
                  <span className="material-symbols-outlined text-base">work</span>
                  <span className="text-[] ">{cleaner.employmentType}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row w-full md:w-auto">
            {/* <button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-full h-12 px-6 py-2 bg-[#e7ebf3] text-[#0d121b] text-sm font-bold tracking-[0.015em] hover:bg-[#dce1eb] transition-all">
              <span className="material-symbols-outlined font-[12px]">chat</span>
              <span>Message</span>
            </button> */}
            <button 
              onClick={handleDelete}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-full h-12 px-6 py-2 text-black text-sm font-bold tracking-[0.015em] hover:bg-[#2e4150] hover:text-white transition-all cursor-pointer border-[#2e4150] border"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
              <span>Delete Staff</span>
            </button>
            <button 
              onClick={() => onNavigate('REPORT', cleaner)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-full h-12 px-6 py-2 bg-[#2e4150] text-white text-sm font-bold tracking-[0.015em] hover:opacity-90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
              <span>Compliance Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* PERSONAL DETAILS SECTION */}
          <div className="bg-white border border-[#e7ebf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-[#e7ebf3] flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center w-[70%] gap-2">
                <span className="material-symbols-outlined text-[#000] text-xl">person</span>
                <h2 className="text-sm sm:text-base font-black font-bold tracking-widest text-gray-900">Personal & Contact Details</h2>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[#000] text-xs font-bold cursor-pointer hover:text-[#135bec]"
              >
                {isEditing ? 'Cancel' : 'Edit Details'}
              </button>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
              <div>
                <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">Full Legal Name</p>
                {isEditing ? (
                  <input 
                    type="text"
                    className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
                    value={editedCleaner.name}
                    onChange={(e) => setEditedCleaner(prev => ({ ...prev, name: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-900">{currentCleaner.name}</p>
                )}
              </div>
              <div>
                <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">Date of Birth</p>
                {isEditing ? (
                  <input 
                    type="date"
                    className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
                    value={editedCleaner.dob}
                    onChange={(e) => setEditedCleaner(prev => ({ ...prev, dob: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-900">{currentCleaner.dob || 'Not provided'}</p>
                )}
              </div>
              <div>
                <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">Phone Number</p>
                {isEditing ? (
                  <input 
                    type="tel"
                    className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
                    value={editedCleaner.phoneNumber}
                    onChange={(e) => setEditedCleaner(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-900">{currentCleaner.phoneNumber || 'Not provided'}</p>
                )}
              </div>
              <div>
                <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">Email Address</p>
                {isEditing ? (
                  <input 
                    type="email"
                    className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
                    value={editedCleaner.email}
                    onChange={(e) => setEditedCleaner(prev => ({ ...prev, email: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-900">{currentCleaner.email}</p>
                )}
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">Current Residential Address</p>
                {isEditing ? (
                  <textarea 
                    className="w-full rounded-lg border-[#e7ebf3] bg-gray-50 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec] min-h-[80px]"
                    value={editedCleaner.address}
                    onChange={(e) => setEditedCleaner(prev => ({ ...prev, address: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-900 leading-relaxed">{currentCleaner.address || 'No address on file'}</p>
                )}
              </div>
              {isEditing && (
                <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-full border border-gray-300 text-sm font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:opacity-90"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* IMMIGRATION & RIGHT TO WORK SECTION */}
          <div className="bg-white border border-[#e7ebf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-[#e7ebf3] bg-gray-50/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#000] text-xl">gavel</span>
              <h2 className="text-sm font-bold font-black uppercase tracking-widest text-gray-900">Right to Work & Immigration</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-12">
                <div>
                  <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">Citizenship Status</p>
                  <p className="text-sm font-bold text-gray-900">{currentCleaner.citizenshipStatus}</p>
                </div>
                {hasVisa && (
                  <div>
                    <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">Visa Type</p>
                    <p className="text-sm font-bold text-[#135bec]">{currentCleaner.visaType}{currentCleaner.visaOther ? ` (${currentCleaner.visaOther})` : ''}</p>
                  </div>
                )}
                {needsShareCode && (
                  <div>
                    <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">RTW Share Code</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-black tracking-widest text-gray-700">{currentCleaner.shareCode || 'PENDING'}</code>
                      {currentCleaner.shareCode && (
                        <button 
                          onClick={handleCopyShareCode}
                          className="material-symbols-outlined text-sm text-gray-400 hover:text-[#135bec] cursor-pointer"
                          title="Copy share code"
                        >
                          content_copy
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">Work Preference</p>
                  <p className="text-sm font-bold text-gray-900">{currentCleaner.workPreference || 'Standard'}</p>
                </div>
              </div>

              {/* Conditional Student Section */}
              {isStudent && (
                <div className="mt-4 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4">
                  <h3 className="text-[12px] font-black uppercase tracking-widest text-[#135bec]">Academic Details & Hours Compliance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12px] text-blue-900/60 font-black uppercase tracking-tight">Institution</p>
                      <p className="text-xs font-bold text-blue-900">{currentCleaner.uniName}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-blue-900/60 font-black uppercase tracking-tight">Course</p>
                      <p className="text-xs font-bold text-blue-900">{currentCleaner.courseName}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-blue-900/60 font-black uppercase tracking-tight">Current Term</p>
                      <p className="text-xs font-bold text-blue-900">{currentCleaner.termStart} to {currentCleaner.termEnd}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                      <p className="text-[12px] font-black text-green-700 uppercase tracking-tight">20HR Max Limit Agreed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* EMPLOYMENT & ALLOCATION DETAILS SECTION */}
          <EmploymentAllocationCard
            employmentDetails={employmentDetails}
            employmentType={currentCleaner.employmentType}
            isEditing={isEditingEmployment}
            onEdit={() => setIsEditingEmployment(true)}
            onCancel={handleCancelEmployment}
            onSave={handleSaveEmployment}
          />

          {/* DOCUMENTS SECTION */}
          <div className="bg-white border border-[#e7ebf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-[#e7ebf3] flex flex-col sm:flex-row gap-4 align-start sm:align-center justify-start sm:justify-between bg-gray-50/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#000] text-xl">folder</span>
                <h2 className="text-[14px] font-bold font-black uppercase tracking-widest text-gray-900">Uploaded Compliance Documents</h2>
              </div>
              <button 
                onClick={handleAddNewFile}
                className="flex items-center justify-center gap-1 bg-[#2e4150] text-white text-[10px] font-black uppercase tracking-widest px-[30px] py-[15px] h-10 rounded-full hover:opacity-90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-bold">upload</span>
                Add New File
              </button>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {(currentCleaner.documents || []).map((doc) => {
                const currentStatus = documentStatusUpdates[doc.id] || doc.status;
                const statusColors = {
                  [DocumentStatus.VERIFIED]: 'bg-green-100 text-green-700',
                  [DocumentStatus.PENDING]: 'bg-amber-100 text-amber-700',
                  [DocumentStatus.REJECTED]: 'bg-red-100 text-red-700'
                };
                return (
                  <div key={doc.id} className="border border-[#e7ebf3] rounded-2xl p-4 flex flex-col gap-4 hover:border-[#c7c7c7] transition-all bg-white group shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-[#000] transition-colors">
                          <span className="material-symbols-outlined">{doc.type === 'PDF' ? 'picture_as_pdf' : 'image'}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold font-black text-gray-700 leading-tight group-hover:text-[#000] transition-colors">{doc.name}</h3>
                          <p className="text-[12px] font-bold text-[#4c669a] mt-0.5">
                            {new Date(doc.uploadDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold font-black rounded ${statusColors[currentStatus]}`}>
                          {currentStatus}
                        </span>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleDocumentStatusChange(doc.id, e.target.value as DocumentStatus)}
                          className="text-[10px] font-bold px-2 py-1 rounded border border-gray-200 bg-white focus:ring-[#135bec] focus:border-[#135bec]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value={DocumentStatus.PENDING}>Pending</option>
                          <option value={DocumentStatus.VERIFIED}>Verified</option>
                          <option value={DocumentStatus.REJECTED}>Rejected</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewDocument(doc)}
                        className={`flex-1 h-9 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                          doc.fileUrl 
                            ? 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 cursor-pointer' 
                            : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                        title={doc.fileUrl ? "View document" : "No file uploaded - click to upload"}
                        disabled={!doc.fileUrl}
                      >
                        <span className="material-symbols-outlined text-sm">{doc.fileUrl ? 'visibility' : 'visibility_off'}</span>
                        {doc.fileUrl ? 'View' : 'No File'}
                      </button>
                      {doc.fileUrl ? (
                        <button 
                          onClick={() => handleDownloadDocument(doc)}
                          className="w-10 h-9 rounded-xl border border-gray-100 text-gray-400 hover:text-[#135bec] hover:border-[#135bec]/30 flex items-center justify-center transition-all cursor-pointer"
                          title="Download document"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUploadToDocument(doc.id)}
                          className="w-10 h-9 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center transition-all cursor-pointer"
                          disabled={uploadingDocument?.docId === doc.id}
                          title="Upload document file"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {uploadingDocument?.docId === doc.id ? 'hourglass_empty' : 'upload'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!currentCleaner.documents || currentCleaner.documents.length === 0) && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <p>No documents uploaded yet.</p>
                </div>
              )}
            </div>
            {Object.keys(documentStatusUpdates).length > 0 && (
              <div className="px-4 sm:px-6 pb-4 flex justify-end">
                <button
                  onClick={handleSaveDocumentStatuses}
                  className="px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Document Statuses
                </button>
              </div>
            )}
          </div>

          {/* DECLARATIONS SECTION */}
          <div className="bg-white border border-[#e7ebf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 w-full py-4 border-b border-[#e7ebf3] bg-gray-50/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#000] text-xl">history_edu</span>
              <h2 className="text-[15px]  w-full sm:text-[16px] font-bold font-black uppercase tracking-widest text-gray-900">Onboarding Declarations</h2>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Accuracy', val: currentCleaner.declarations.accuracy },
                { label: 'RTW Consent', val: currentCleaner.declarations.rtw },
                { label: 'Approval Sub.', val: currentCleaner.declarations.approval },
                { label: 'GDPR Consent', val: currentCleaner.declarations.gdpr }
              ].map((dec) => (
                <div key={dec.label} className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 ${dec.val ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                  <span className={`material-symbols-outlined ${dec.val ? 'text-green-600' : 'text-red-600'}`}>
                    {dec.val ? 'check_circle' : 'cancel'}
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-tight text-gray-600">{dec.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#e7ebf3] rounded-2xl p-6 shadow-sm sticky top-[90px]">
            <h2 className="text-[14px] font-bold font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#000]">admin_panel_settings</span>
              Verification Control
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#4c669a] mb-2">Change Verification Status</label>
                <select 
                  className="w-full h-12 p-2 bg-gray-50 border-[#e7ebf3] rounded-xl text-sm font-bold text-gray-900 outline-none"
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                >
                  <option value={VerificationStatus.VERIFIED}>Verified / Active</option>
                  <option value={VerificationStatus.PENDING}>Pending Review</option>
                  <option value={VerificationStatus.DOCS_REQUIRED}>Docs Required</option>
                  <option value={VerificationStatus.REJECTED}>Rejected / Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-black  tracking-widest text-[#4c669a] mb-2">Internal Auditor Notes</label>
                <textarea 
                  className="outline-none w-full bg-gray-50 border-[#e7ebf3] rounded-xl text-sm font-medium focus:ring-[#135bec] focus:border-[#135bec] placeholder:text-gray-400 p-4" 
                  rows={4} 
                  placeholder="Note findings from RTW check, interview outcomes, or missing document requests..."
                  value={auditorNotes}
                  onChange={(e) => setAuditorNotes(e.target.value)}
                ></textarea>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={handleStatusUpdate}
                  className="w-full h-10 sm:h-12 bg-[#2e4150] text-white font-black text-base font-semibold rounded-full   hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 mb-3"
                >
                  <span className="material-symbols-outlined">save</span>
                  Update Profile Status
                </button>
                <button 
                  type="button"
                  onClick={handleRevokeVerification}
                  className="w-full h-10 sm:h-12 bg-white border-2 border-red-50 text-red-600 font-black text-xs uppercase tracking-widest rounded-full hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">block</span>
                  Revoke Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" 
          onClick={handleCloseDocumentViewer}
          style={{ zIndex: 9999 }}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{viewingDocument.name}</h3>
              <button
                onClick={handleCloseDocumentViewer}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50 min-h-[400px]">
              {viewingDocument.fileUrl ? (
                viewingDocument.type === 'PDF' ? (
                  <iframe
                    src={viewingDocument.fileUrl}
                    className="w-full h-full min-h-[500px] border border-gray-200 rounded-lg bg-white"
                    title={viewingDocument.name}
                    style={{ minHeight: '500px' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={viewingDocument.fileUrl}
                      alt={viewingDocument.name}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                      style={{ maxHeight: '70vh' }}
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'text-center py-12';
                        errorDiv.innerHTML = `
                          <span class="material-symbols-outlined text-6xl text-gray-300 mb-4 block">description</span>
                          <p class="text-gray-500 font-semibold">Document preview not available</p>
                          <p class="text-sm text-gray-400 mt-2">Unable to load document image. The file may be corrupted or in an unsupported format.</p>
                        `;
                        target.parentElement?.replaceChild(errorDiv, target);
                      }}
                    />
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">description</span>
                  <p className="text-gray-500 font-semibold">Document preview not available</p>
                  <p className="text-sm text-gray-400 mt-2">The document file has not been uploaded yet.</p>
                  <button
                    onClick={() => {
                      handleCloseDocumentViewer();
                      handleUploadToDocument(viewingDocument.id);
                    }}
                    className="mt-4 px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span>
                    Upload Document
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCloseDocumentViewer}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {viewingDocument.fileUrl && (
                <button
                  onClick={() => handleDownloadDocument(viewingDocument!)}
                  className="px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanerDetail;
