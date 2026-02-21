import React, { useState, useEffect } from 'react';
import { useCleaners } from '../context/CleanersContext';
import { Cleaner, EmploymentType, VerificationStatus, DBSStatus, Document, DocumentStatus, AppView } from '../types';
import api from '../services/api';
import { clearEmployeeSession } from '../utils/auth';

interface OnboardingFlowProps {
  onComplete: () => void;
  onCancel: () => void;
  onNavigate: (view: AppView) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onCancel, onNavigate }) => {
  const { addCleaner } = useCleaners();
  
  // ALL HOOKS MUST BE DECLARED FIRST - before any conditional returns
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [step, setStep] = useState(1); // Start at step 1 - Citizenship/Immigration Status
  
  // Personal details state
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dob: '',
    address: '',
    gender: ''
  });
  
  const [citizenshipStatus, setCitizenshipStatus] = useState<string | null>(null);
  const [visaType, setVisaType] = useState<string | null>(null);
  const [visaOther, setVisaOther] = useState('');
  
  // Passport photo state
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [passportPhotoFile, setPassportPhotoFile] = useState<File | null>(null);
  
  // Right to Work state
  const [shareCode, setShareCode] = useState('');
  
  // Student Visa specific state
  const [uniName, setUniName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');
  const [hasAgreedToHours, setHasAgreedToHours] = useState(false);

  // Work Preference state
  const [workPreference, setWorkPreference] = useState<'Full-Time' | 'Part-Time' | null>(null);

  // Employment Preferences state (Step 9)
  const [availabilityToStart, setAvailabilityToStart] = useState('');
  const [preferredShiftPattern, setPreferredShiftPattern] = useState('');

  // Employment type state
  const [employmentType, setEmploymentType] = useState<EmploymentType | null>(null);

  // DBS state
  const [hasDBS, setHasDBS] = useState<boolean | null>(null);

  // Declarations state
  const [declarations, setDeclarations] = useState({
    accuracy: false,
    rtw: false,
    approval: false,
    gdpr: false
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<{
    shareCodeScreenshot?: File;
    passport?: File;
    brp?: File;
    residenceCard?: File;
    drivingLicence?: File;
    termDatesDocument?: File;
    dbsCertificate?: File;
    salarySlip?: File;
  }>({});

  // Track if this is initial load (to prevent autosave during progress restoration)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Track if form is currently being submitted
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to convert File to base64 (for autosave)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Collect all form data into a serializable object for autosave
  const collectFormData = async (): Promise<any> => {
    // Convert files to base64 for storage (so they can be restored on resume)
    const fileData: any = {};
    if (uploadedFiles.shareCodeScreenshot) {
      try {
        fileData.shareCodeScreenshot = await fileToBase64(uploadedFiles.shareCodeScreenshot);
        fileData.shareCodeScreenshotName = uploadedFiles.shareCodeScreenshot.name;
      } catch (err) {
        console.warn('Failed to convert shareCodeScreenshot to base64:', err);
      }
    }
    if (uploadedFiles.passport) {
      try {
        fileData.passport = await fileToBase64(uploadedFiles.passport);
        fileData.passportName = uploadedFiles.passport.name;
      } catch (err) {
        console.warn('Failed to convert passport to base64:', err);
      }
    }
    if (uploadedFiles.brp) {
      try {
        fileData.brp = await fileToBase64(uploadedFiles.brp);
        fileData.brpName = uploadedFiles.brp.name;
      } catch (err) {
        console.warn('Failed to convert brp to base64:', err);
      }
    }
    if (uploadedFiles.residenceCard) {
      try {
        fileData.residenceCard = await fileToBase64(uploadedFiles.residenceCard);
        fileData.residenceCardName = uploadedFiles.residenceCard.name;
      } catch (err) {
        console.warn('Failed to convert residenceCard to base64:', err);
      }
    }
    if (uploadedFiles.drivingLicence) {
      try {
        fileData.drivingLicence = await fileToBase64(uploadedFiles.drivingLicence);
        fileData.drivingLicenceName = uploadedFiles.drivingLicence.name;
      } catch (err) {
        console.warn('Failed to convert drivingLicence to base64:', err);
      }
    }
    if (uploadedFiles.termDatesDocument) {
      try {
        fileData.termDatesDocument = await fileToBase64(uploadedFiles.termDatesDocument);
        fileData.termDatesDocumentName = uploadedFiles.termDatesDocument.name;
      } catch (err) {
        console.warn('Failed to convert termDatesDocument to base64:', err);
      }
    }
    if (uploadedFiles.dbsCertificate) {
      try {
        fileData.dbsCertificate = await fileToBase64(uploadedFiles.dbsCertificate);
        fileData.dbsCertificateName = uploadedFiles.dbsCertificate.name;
      } catch (err) {
        console.warn('Failed to convert dbsCertificate to base64:', err);
      }
    }
    if (uploadedFiles.salarySlip) {
      try {
        fileData.salarySlip = await fileToBase64(uploadedFiles.salarySlip);
        fileData.salarySlipName = uploadedFiles.salarySlip.name;
      } catch (err) {
        console.warn('Failed to convert salarySlip to base64:', err);
      }
    }

    return {
      personalDetails,
      citizenshipStatus,
      visaType,
      visaOther,
      passportPhoto, // Already base64
      shareCode,
      uniName,
      courseName,
      termStart,
      termEnd,
      hasAgreedToHours,
      workPreference,
      availabilityToStart,
      preferredShiftPattern,
      employmentType,
      hasDBS,
      declarations,
      ...fileData // Include all file base64 data
    };
  };

  // Save progress when moving to next step
  const saveProgressOnStepChange = async (currentStep: number, isStepCompleted: boolean = false) => {
    if (!inviteToken) {
      console.log('[OnboardingFlow] Save skipped - no inviteToken');
      return;
    }

    try {
      const formData = await collectFormData();
      await api.invitations.saveProgress(inviteToken, currentStep, formData, isStepCompleted);
      console.log(`[OnboardingFlow] Progress saved for step ${currentStep} (completed: ${isStepCompleted})`);
    } catch (err: any) {
      console.error('[OnboardingFlow] Failed to save progress:', err);
      // Don't block user flow if save fails
    }
  };

  // Removed debounced autosave - now only saves on step transitions

  // Load saved progress and resume from last completed step
  const loadSavedProgress = async (token?: string): Promise<number> => {
    // Use provided token or fall back to state
    const tokenToUse = token || inviteToken;
    
    if (!tokenToUse) {
      console.log('[OnboardingFlow] No inviteToken, starting from step 1');
      return 1;
    }

    try {
      console.log(`[OnboardingFlow] Loading progress for inviteToken: ${tokenToUse}`);
      const response: any = await api.invitations.loadProgress(tokenToUse);
      console.log('[OnboardingFlow] Progress response:', response);
      
      if (response.success && response.hasProgress && response.progress) {
        const saved = response.progress;
        const formData = saved.formData || {};

        // Get the step to resume from FIRST (before restoring form data)
        const savedCurrentStep = saved.currentStep || saved.lastCompletedStep || 1;
        console.log(`[OnboardingFlow] Loading saved progress - currentStep: ${saved.currentStep}, lastCompletedStep: ${saved.lastCompletedStep}, savedCurrentStep: ${savedCurrentStep}`);

        // Restore citizenshipStatus FIRST (needed for step calculation)
        if (formData.citizenshipStatus !== undefined) {
          setCitizenshipStatus(formData.citizenshipStatus);
        }

        // Restore all other form state
        if (formData.personalDetails) {
          setPersonalDetails(formData.personalDetails);
        }
        if (formData.visaType !== undefined) {
          setVisaType(formData.visaType);
        }
        if (formData.visaOther !== undefined) {
          setVisaOther(formData.visaOther);
        }
        if (formData.passportPhoto) {
          setPassportPhoto(formData.passportPhoto);
        }
        if (formData.shareCode !== undefined) {
          setShareCode(formData.shareCode);
        }
        if (formData.uniName !== undefined) {
          setUniName(formData.uniName);
        }
        if (formData.courseName !== undefined) {
          setCourseName(formData.courseName);
        }
        if (formData.termStart !== undefined) {
          setTermStart(formData.termStart);
        }
        if (formData.termEnd !== undefined) {
          setTermEnd(formData.termEnd);
        }
        if (formData.hasAgreedToHours !== undefined) {
          setHasAgreedToHours(formData.hasAgreedToHours);
        }
        if (formData.workPreference !== undefined) {
          setWorkPreference(formData.workPreference);
        }
        if (formData.availabilityToStart !== undefined) {
          setAvailabilityToStart(formData.availabilityToStart);
        }
        if (formData.preferredShiftPattern !== undefined) {
          setPreferredShiftPattern(formData.preferredShiftPattern);
        }
        if (formData.employmentType !== undefined) {
          setEmploymentType(formData.employmentType);
        }
        if (formData.hasDBS !== undefined) {
          setHasDBS(formData.hasDBS);
        }
        if (formData.declarations) {
          setDeclarations(formData.declarations);
        }

        // Restore uploaded files from base64
        const restoredFiles: any = {};
        
        // Helper to convert base64 data URL to File object
        const base64ToFile = (base64: string, filename: string): File | null => {
          try {
            // base64 is already a data URL (data:image/png;base64,...)
            const arr = base64.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
          } catch (err) {
            console.warn(`Failed to convert base64 to File for ${filename}:`, err);
            return null;
          }
        };

        if (formData.shareCodeScreenshot && formData.shareCodeScreenshotName) {
          const file = base64ToFile(formData.shareCodeScreenshot, formData.shareCodeScreenshotName);
          if (file) restoredFiles.shareCodeScreenshot = file;
        }
        if (formData.passport && formData.passportName) {
          const file = base64ToFile(formData.passport, formData.passportName);
          if (file) restoredFiles.passport = file;
        }
        if (formData.brp && formData.brpName) {
          const file = base64ToFile(formData.brp, formData.brpName);
          if (file) restoredFiles.brp = file;
        }
        if (formData.residenceCard && formData.residenceCardName) {
          const file = base64ToFile(formData.residenceCard, formData.residenceCardName);
          if (file) restoredFiles.residenceCard = file;
        }
        if (formData.drivingLicence && formData.drivingLicenceName) {
          const file = base64ToFile(formData.drivingLicence, formData.drivingLicenceName);
          if (file) restoredFiles.drivingLicence = file;
        }
        if (formData.termDatesDocument && formData.termDatesDocumentName) {
          const file = base64ToFile(formData.termDatesDocument, formData.termDatesDocumentName);
          if (file) restoredFiles.termDatesDocument = file;
        }
        if (formData.dbsCertificate && formData.dbsCertificateName) {
          const file = base64ToFile(formData.dbsCertificate, formData.dbsCertificateName);
          if (file) restoredFiles.dbsCertificate = file;
        }
        if (formData.salarySlip && formData.salarySlipName) {
          const file = base64ToFile(formData.salarySlip, formData.salarySlipName);
          if (file) restoredFiles.salarySlip = file;
        }
        setUploadedFiles(restoredFiles);

        // Restore step - resume from currentStep (where user was, even if not completed)
        // Calculate active steps based on restored citizenshipStatus (already set above)
        // This MUST match the getActiveSteps() logic exactly
        const restoredCitizenship = formData.citizenshipStatus;
        const restoredIsBritishOrIrish = restoredCitizenship === 'UK Citizen' || restoredCitizenship === 'Irish Citizen';
        const restoredIsNonEU = restoredCitizenship === 'Non-EU Citizen (Visa / BRP holder)';
        const restoredIsStudentVisa = formData.visaType === 'Student Visa';
        
        // Build active steps array - MUST match getActiveSteps() logic
        const restoredActiveSteps = [1, 2];
        if (!restoredIsBritishOrIrish) restoredActiveSteps.push(3);
        if (restoredIsNonEU) restoredActiveSteps.push(4);
        if (restoredIsStudentVisa) restoredActiveSteps.push(5);
        restoredActiveSteps.push(6, 7, 8, 9, 10);

        // Determine resume step based on saved progress
        let resumeStep = savedCurrentStep;
        
        // If saved step is not in active steps (e.g., user changed citizenship status),
        // find the appropriate step to resume from
        if (!restoredActiveSteps.includes(savedCurrentStep)) {
          // Find the last completed step in the restored active steps
          const lastCompleted = saved.lastCompletedStep || 1;
          
          // Find the index of lastCompleted in restoredActiveSteps
          const lastCompletedIndex = restoredActiveSteps.indexOf(lastCompleted);
          
          if (lastCompletedIndex >= 0 && lastCompletedIndex < restoredActiveSteps.length - 1) {
            // Resume from the step after last completed (if available)
            resumeStep = restoredActiveSteps[lastCompletedIndex + 1];
          } else if (lastCompletedIndex >= 0) {
            // Last step was completed, stay on it
            resumeStep = restoredActiveSteps[lastCompletedIndex];
          } else {
            // Last completed step not in active steps, find closest
            const closestIndex = restoredActiveSteps.findIndex(s => s >= lastCompleted);
            resumeStep = closestIndex >= 0 ? restoredActiveSteps[closestIndex] : restoredActiveSteps[0];
          }
        }
        
        // Ensure resumeStep is valid
        if (!restoredActiveSteps.includes(resumeStep)) {
          resumeStep = restoredActiveSteps[0] || 1;
        }
        
        // Set step immediately (don't wait for timeout - this ensures it happens before render)
        console.log(`[OnboardingFlow] Resuming to step ${resumeStep} (saved currentStep: ${savedCurrentStep}, lastCompletedStep: ${saved.lastCompletedStep}, activeSteps: [${restoredActiveSteps.join(', ')}])`);
        setStep(resumeStep);
        return resumeStep; // Return the step to resume from
      } else {
        console.log('[OnboardingFlow] No saved progress found, starting from step 1');
        return 1;
      }
    } catch (err: any) {
      console.error('[OnboardingFlow] Failed to load saved progress:', err);
      // If loading fails, start from step 1 (no resume)
      return 1;
    }
  };

  // Check for invitation token and JWT on mount
  // Note: EmployeeRouteGuard handles token verification, so we just need to load invitation data
  useEffect(() => {
    const loadInvitationData = async () => {
      // Get invite token from sessionStorage (EmployeeRouteGuard ensures it exists)
      const tokenFromStorage = sessionStorage.getItem('onboardingToken');
      const jwtToken = sessionStorage.getItem('employeeJWT');

      if (!tokenFromStorage || !jwtToken) {
        // No tokens - EmployeeRouteGuard will handle redirect
        setCheckingToken(false);
        setIsVerified(false);
        return;
      }

      setInviteToken(tokenFromStorage);

      try {
        // Get invitation details to pre-fill form
        const data: any = await api.invitations.getByToken(tokenFromStorage);
        setInvitation(data);

        // Accept VERIFIED or PENDING status (PENDING means OTP verified, form in progress)
        if (data.status === 'VERIFIED' || data.status === 'PENDING') {
          setIsVerified(true);
          // Pre-fill email and name from invitation
          if (data.email && !personalDetails.email) {
            setPersonalDetails(prev => ({ ...prev, email: data.email }));
          }
          if (data.employeeName && !personalDetails.name) {
            setPersonalDetails(prev => ({ ...prev, name: data.employeeName }));
          }

          // Load saved progress to resume from last step - MUST complete before setting checkingToken to false
          // Pass tokenFromStorage directly to avoid state timing issues
          const resumeStep = await loadSavedProgress(tokenFromStorage);
          // Always set the step (even if it's 1) to ensure it's set before component renders
          console.log(`[OnboardingFlow] Setting step to ${resumeStep} before rendering form (current step state: ${step})`);
          setStep(resumeStep);
          
          // Wait a bit longer to ensure state update is processed and prevent autosave from triggering
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (data.status === 'COMPLETED') {
          // Invitation already completed - redirect to thank you page
          onNavigate('THANK_YOU');
        } else if (data.status === 'EXPIRED') {
          alert('This invitation has expired. Please contact your administrator.');
          onNavigate('DASHBOARD');
        } else {
          // For other statuses, still allow access if EmployeeRouteGuard verified the token
          setIsVerified(true);
        }
      } catch (err: any) {
        console.error('Failed to load invitation:', err);
        // Even if invitation fetch fails, if EmployeeRouteGuard allowed access, proceed
        setIsVerified(true);
      } finally {
        setCheckingToken(false);
      }
    };

    loadInvitationData();
  }, []);

  // Removed cleanup for debounced autosave (no longer needed)

  // EmployeeRouteGuard handles token verification, so if we reach here, access is granted
  // If EmployeeRouteGuard allowed access, we should show the form regardless of invitation status
  // Use useEffect to handle the verification check (must be before conditional returns)
  useEffect(() => {
    if (inviteToken && !isVerified && !checkingToken) {
      // If EmployeeRouteGuard allowed access but invitation check failed, still allow form access
      // This can happen if there's a network issue but the JWT token is valid
      console.warn('[OnboardingFlow] Invitation check failed but EmployeeRouteGuard allowed access. Proceeding with form.');
      setIsVerified(true);
    }
  }, [inviteToken, isVerified, checkingToken]);

  // Mark initial load as complete after progress is loaded
  useEffect(() => {
    if (isVerified && !checkingToken) {
      // Delay to ensure step restoration completes
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
        console.log('[OnboardingFlow] Initial load complete. Current step:', step);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVerified, checkingToken, step]);

  // Removed continuous autosave - now only saves on step transitions (handleNext)

  // Show auth page if token exists but not verified
  // ALL HOOKS MUST BE DECLARED BEFORE THIS POINT
  if (checkingToken) {
    return (
      <div className="min-h-screen bg-[#f2f6f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-sm">
          <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-gray-400 text-4xl animate-spin">hourglass_empty</span>
          </div>
          <p className="text-gray-600 font-semibold">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({ ...prev, passportPhoto: 'Please upload an image file (JPG, PNG)' }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({ ...prev, passportPhoto: 'Image size should be less than 5MB' }));
        return;
      }
      // Clear any previous errors
      setValidationErrors(prev => ({ ...prev, passportPhoto: '' }));
      setPassportPhotoFile(file);
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPhoto(reader.result as string);
      };
      reader.onerror = () => {
        setValidationErrors(prev => ({ ...prev, passportPhoto: 'Error reading file. Please try again.' }));
      };
      reader.readAsDataURL(file);
    } else {
      // Clear photo and file when null is passed
      setPassportPhoto(null);
      setPassportPhotoFile(null);
    }
  };

  const handleFileUpload = (type: 'shareCodeScreenshot' | 'passport' | 'brp' | 'residenceCard' | 'drivingLicence' | 'termDatesDocument' | 'dbsCertificate' | 'salarySlip', file: File | null) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const isBritishOrIrish = citizenshipStatus === 'UK Citizen' || citizenshipStatus === 'Irish Citizen';
  const isNonEU = citizenshipStatus === 'Non-EU Citizen (Visa / BRP holder)';
  const isStudentVisa = visaType === 'Student Visa';
  
  /**
   * Internal Logic Mapping:
   * 1: Citizenship
   * 2: Personal Details
   * 3: Right to Work (Skip if UK/Irish)
   * 4: Visa Type (Only if Non-EU)
   * 5: Student Visa Details (Only if Student Visa selected)
   * 6: Identity Proof
   * 7: Employment Type Choice
   * 8: DBS Check
   * 9: Employment Preferences (Availability)
   * 10: Declarations (FINAL STEP)
   */
  
  const getActiveSteps = () => {
    const steps = [1, 2];
    if (!isBritishOrIrish) steps.push(3);
    if (isNonEU) steps.push(4);
    if (isStudentVisa) steps.push(5);
    steps.push(6, 7, 8, 9, 10);
    return steps;
  };

  const activeSteps = getActiveSteps();
  const totalSteps = activeSteps.length;
  const currentStepIndex = activeSteps.indexOf(step);
  const displayStep = currentStepIndex + 1;

  const handleNext = async () => {
    // First check if step is valid (without setting errors)
    if (!checkStepValidity()) {
      // If invalid, run validateStep to show errors
      validateStep();
      return;
    }
    
    // Save progress for current step (marking it as completed) before moving to next step
    if (inviteToken) {
      await saveProgressOnStepChange(step, true); // Mark current step as completed
    }
    
    if (currentStepIndex < totalSteps - 1) {
      setValidationErrors({}); // Clear errors when moving to next step
      const nextStep = activeSteps[currentStepIndex + 1];
      setStep(nextStep);
      
      // Save progress for the new step (not completed yet, just starting)
      if (inviteToken) {
        await saveProgressOnStepChange(nextStep, false);
      }
    } else {
      // Final step "Submit Application" - create new cleaner
      submitApplication();
    }
  };

  const submitApplication = async () => {
    setIsSubmitting(true);
    const applicationRef = `XPG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Helper function to convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    };

    // Create documents array from uploaded files
    const documents: Document[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Process all files asynchronously
    const filePromises: Promise<void>[] = [];
    
    if (uploadedFiles.passport) {
      filePromises.push(
        fileToBase64(uploadedFiles.passport).then(fileUrl => {
          documents.push({
            id: 'passport-' + Date.now(),
            name: 'Passport',
            type: 'IMG',
            uploadDate: today,
            status: DocumentStatus.PENDING,
            fileName: uploadedFiles.passport!.name,
            fileUrl
          });
        })
      );
    }
    if (uploadedFiles.brp) {
      filePromises.push(
        fileToBase64(uploadedFiles.brp).then(fileUrl => {
          documents.push({
            id: 'brp-' + Date.now(),
            name: 'Biometric Residence Permit (BRP)',
            type: 'IMG',
            uploadDate: today,
            status: DocumentStatus.PENDING,
            fileName: uploadedFiles.brp!.name,
            fileUrl
          });
        })
      );
    }
    if (uploadedFiles.residenceCard) {
      filePromises.push(
        fileToBase64(uploadedFiles.residenceCard).then(fileUrl => {
          documents.push({
            id: 'residence-' + Date.now(),
            name: 'UK Residence Card / Frontier Worker Permit',
            type: 'IMG',
            uploadDate: today,
            status: DocumentStatus.PENDING,
            fileName: uploadedFiles.residenceCard!.name,
            fileUrl
          });
        })
      );
    }
    if (uploadedFiles.drivingLicence) {
      filePromises.push(
        fileToBase64(uploadedFiles.drivingLicence).then(fileUrl => {
          documents.push({
            id: 'licence-' + Date.now(),
            name: 'Driving Licence',
            type: 'IMG',
            uploadDate: today,
            status: DocumentStatus.PENDING,
            fileName: uploadedFiles.drivingLicence!.name,
            fileUrl
          });
        })
      );
    }
    if (uploadedFiles.shareCodeScreenshot) {
      filePromises.push(
        fileToBase64(uploadedFiles.shareCodeScreenshot).then(fileUrl => {
          documents.push({
            id: 'sharecode-' + Date.now(),
            name: 'RTW Share Code Screenshot',
            type: 'IMG',
            uploadDate: today,
            status: DocumentStatus.PENDING,
            fileName: uploadedFiles.shareCodeScreenshot!.name,
            fileUrl
          });
        })
      );
    }
    if (uploadedFiles.termDatesDocument) {
      filePromises.push(
        fileToBase64(uploadedFiles.termDatesDocument).then(fileUrl => {
          documents.push({
            id: 'termdates-' + Date.now(),
            name: 'Official Term Dates',
            type: 'PDF',
            uploadDate: today,
            status: DocumentStatus.PENDING,
            fileName: uploadedFiles.termDatesDocument!.name,
            fileUrl
          });
        })
      );
    }
    if (uploadedFiles.dbsCertificate) {
      filePromises.push(
        fileToBase64(uploadedFiles.dbsCertificate).then(fileUrl => {
          documents.push({
            id: 'dbs-' + Date.now(),
            name: 'DBS Certificate',
            type: 'IMG',
            uploadDate: today,
            status: hasDBS ? DocumentStatus.VERIFIED : DocumentStatus.PENDING,
            fileName: uploadedFiles.dbsCertificate!.name,
            fileUrl
          });
        })
      );
    }
    if (uploadedFiles.salarySlip) {
      filePromises.push(
        fileToBase64(uploadedFiles.salarySlip).then(fileUrl => {
          documents.push({
            id: 'salaryslip-' + Date.now(),
            name: 'Last 3 Month Salary Slip',
            type: 'PDF',
            uploadDate: today,
            status: DocumentStatus.PENDING,
            fileName: uploadedFiles.salarySlip!.name,
            fileUrl
          });
        })
      );
    }
    
    // Wait for all files to be processed
    await Promise.all(filePromises);
    
    const newCleaner: Cleaner = {
      id: Date.now().toString(),
      name: personalDetails.name,
      email: personalDetails.email,
      phoneNumber: personalDetails.phoneNumber,
      dob: personalDetails.dob,
      address: personalDetails.address,
      gender: personalDetails.gender || 'Not specified',
      startDate: new Date().toISOString().split('T')[0],
      employmentType: employmentType || EmploymentType.CONTRACTOR,
      verificationStatus: VerificationStatus.PENDING,
      dbsStatus: hasDBS ? DBSStatus.CLEARED : DBSStatus.NOT_STARTED,
      location: 'TBD',
      onboardingProgress: 100,
      citizenshipStatus: citizenshipStatus || '',
      visaType: visaType || undefined,
      visaOther: visaOther || undefined,
      shareCode: shareCode || undefined,
      uniName: uniName || undefined,
      courseName: courseName || undefined,
      termStart: termStart || undefined,
      termEnd: termEnd || undefined,
      workPreference: workPreference || undefined,
      preferredShiftPattern: preferredShiftPattern || undefined,
      // Map preferredShiftPattern to shiftType
      shiftType: preferredShiftPattern === 'Mornings Only' ? 'Morning' :
                 preferredShiftPattern === 'Afternoons Only' ? 'Evening' :
                 preferredShiftPattern === 'Evenings / Weekends' ? 'Night' :
                 undefined, // If 'Any' or not set, leave as undefined for admin to set
      declarations: declarations,
      avatar: passportPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(personalDetails.name)}&background=2e4150&color=fff&size=150`,
      documents: documents
    };

    try {
      await addCleaner(newCleaner);
      
      // Mark invitation as completed if token exists
      if (inviteToken && invitation) {
        try {
          await api.invitations.complete(invitation.id, 100);
          
          // Clear saved progress after successful submission
          if (inviteToken) {
            try {
              await api.invitations.clearProgress(inviteToken);
              console.log('[OnboardingFlow] Progress cleared after successful submission');
            } catch (err) {
              console.warn('[OnboardingFlow] Failed to clear progress:', err);
              // Don't block completion if clearing fails
            }
          }
        } catch (err) {
          console.error('Failed to mark invitation as complete:', err);
          // Don't block submission if this fails
        }
      }
      
      // Clear employee session after successful submission
      clearEmployeeSession();
      
      // Store form data for PDF generation
      const formData = {
        applicationRef,
        cleaner: newCleaner,
        personalDetails,
        citizenshipStatus,
        visaType,
        visaOther,
        shareCode,
        uniName,
        courseName,
        termStart,
        termEnd,
        workPreference,
        employmentType,
        hasDBS,
        declarations,
        uploadedFiles: Object.keys(uploadedFiles).reduce((acc, key) => {
          const file = uploadedFiles[key as keyof typeof uploadedFiles];
          if (file) {
            acc[key] = { name: file.name, size: file.size, type: file.type };
          }
          return acc;
        }, {} as Record<string, { name: string; size: number; type: string }>),
        passportPhoto: passportPhoto || null
      };
      
      sessionStorage.setItem('lastSubmittedForm', JSON.stringify(formData));
      
      // Redirect to thank you page after successful submission
      setIsSubmitting(false);
      onNavigate('THANK_YOU');
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      setIsSubmitting(false);
      const errorMessage = error.message || 'Unknown error';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Cannot connect to server')) {
        alert(`❌ Backend server is not running!\n\n${errorMessage}\n\nPlease start the backend server:\n1. Open terminal in the 'backend' folder\n2. Run: npm install (if not done)\n3. Run: npm run dev\n4. Make sure MongoDB is running`);
      } else {
        alert(`Failed to submit application: ${errorMessage}`);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(activeSteps[currentStepIndex - 1]);
    } else {
      onCancel();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-l font-semibold border-b pb-2 sm:pb-4 capitalize tracking-wider text-gray-500 text-base">Step 1: Citizenship / Immigration Status</h2>
            <div className="space-y-4">
              <p className="text-base font-semibold text-gray-700">What is your citizenship / immigration status? <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'UK Citizen',
                  'Irish Citizen',
                  'EU / EEA Citizen',
                  'Non-EU Citizen (Visa / BRP holder)',
                  'Overseas Contractor (not working inside UK)'
                ].map((status) => (
                  <label 
                    key={status} 
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
                      citizenshipStatus === status ? 'border-[#000] bg-blue-50/50' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="citizenship" 
                      className="size-5 text-[#135bec] focus:ring-[#000] border-gray-300"
                      checked={citizenshipStatus === status}
                      onChange={() => {
                        setCitizenshipStatus(status);
                        if (validationErrors.citizenshipStatus) {
                          setValidationErrors(prev => ({ ...prev, citizenshipStatus: '' }));
                        }
                        if (status !== 'Non-EU Citizen (Visa / BRP holder)') {
                          setVisaType(null);
                          setVisaOther('');
                        }
                      }}
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-900">{status}</span>
                  </label>
                ))}
              </div>
              {validationErrors.citizenshipStatus && (
                <p className="text-sm text-red-500">{validationErrors.citizenshipStatus}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">Step 2: Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
           
            {/* Passport Size Photo Upload */}
            <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                <label className="text-base font-semibold text-gray-700">Passport Size Photo <span className="text-red-500">*</span></label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0">
                    <label className={`flex flex-col items-center justify-center w-32 h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${
                      validationErrors.passportPhoto 
                        ? 'border-red-500 bg-red-50' 
                        : passportPhoto
                        ? 'border-green-500 bg-green-50'
                        : 'border-[#e7ebf3] bg-[#f6f6f8] hover:border-[#000]'
                    }`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handlePhotoUpload(file || null);
                        }}
                      />
                      {passportPhoto ? (
                        <img src={passportPhoto} alt="Passport photo" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">add_photo_alternate</span>
                          <span className="text-xs text-gray-500 text-center px-2">Click to upload</span>
                        </>
                      )}
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Please upload a recent passport-size photograph (JPG, PNG, max 5MB)
                    </p>
                    {passportPhotoFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="material-symbols-outlined text-base text-green-600">check_circle</span>
                        <span className="text-gray-700 font-medium">{passportPhotoFile.name} ({(passportPhotoFile.size / 1024).toFixed(2)} KB)</span>
                        <button
                          type="button"
                          onClick={() => {
                            handlePhotoUpload(null);
                            // Reset file input
                            const fileInput = document.getElementById('passport-photo-input') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.value = '';
                            }
                          }}
                          className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                          title="Remove photo"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    )}
                    {validationErrors.passportPhoto && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.passportPhoto}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                <label className="text-base font-semibold text-gray-700">Full Name (as per passport) <span className="text-red-500">*</span></label>
                <input 
                  className={`form-input h-12 rounded-xl border px-4 py-2 outline-none ${
                    validationErrors.name ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8]'
                  }`}
                  placeholder="Enter your full legal name"
                  value={personalDetails.name}
                  onChange={(e) => {
                    setPersonalDetails(prev => ({ ...prev, name: e.target.value }));
                    if (validationErrors.name) {
                      setValidationErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  required
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-semibold text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
                <input 
                  className={`form-input h-12 rounded-xl border px-4 py-2 outline-none ${
                    validationErrors.dob ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8]'
                  }`}
                  type="date"
                  value={personalDetails.dob}
                  onChange={(e) => {
                    setPersonalDetails(prev => ({ ...prev, dob: e.target.value }));
                    if (validationErrors.dob) {
                      setValidationErrors(prev => ({ ...prev, dob: '' }));
                    }
                  }}
                  required
                />
                {validationErrors.dob && (
                  <p className="text-sm text-red-500">{validationErrors.dob}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-semibold text-gray-700">Gender <span className="text-red-500">*</span></label>
                <select 
                  className={`form-input h-12 rounded-xl border px-4 py-2 outline-none ${
                    validationErrors.gender ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8]'
                  }`}
                  value={personalDetails.gender}
                  onChange={(e) => {
                    setPersonalDetails(prev => ({ ...prev, gender: e.target.value }));
                    if (validationErrors.gender) {
                      setValidationErrors(prev => ({ ...prev, gender: '' }));
                    }
                  }}
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {validationErrors.gender && (
                  <p className="text-sm text-red-500">{validationErrors.gender}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                <input 
                  className={`form-input h-12 rounded-xl border px-4 py-2 outline-none ${
                    validationErrors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8]'
                  } focus:ring-[#135bec]`}
                  type="tel" 
                  placeholder="+44 7000 000000"
                  value={personalDetails.phoneNumber}
                  onChange={(e) => {
                    setPersonalDetails(prev => ({ ...prev, phoneNumber: e.target.value }));
                    if (validationErrors.phoneNumber) {
                      setValidationErrors(prev => ({ ...prev, phoneNumber: '' }));
                    }
                  }}
                  required
                />
                {validationErrors.phoneNumber && (
                  <p className="text-sm text-red-500">{validationErrors.phoneNumber}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                <label className="text-base font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                <input 
                  className={`form-input h-12 rounded-xl border px-4 py-2 outline-none ${
                    validationErrors.email ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8]'
                  } focus:ring-[#135bec]`}
                  type="email" 
                  placeholder="email@example.com"
                  value={personalDetails.email}
                  onChange={(e) => {
                    setPersonalDetails(prev => ({ ...prev, email: e.target.value }));
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  required
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                <label className="text-base font-semibold text-gray-700">Current Address <span className="text-red-500">*</span></label>
                <textarea 
                  className={`form-textarea rounded-xl border px-4 py-2 outline-none p-4 min-h-[100px] ${
                    validationErrors.address ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8]'
                  } focus:ring-[#135bec]`}
                  placeholder="Street name, house number, city, and postcode" 
                  rows={3}
                  value={personalDetails.address}
                  onChange={(e) => {
                    setPersonalDetails(prev => ({ ...prev, address: e.target.value }));
                    if (validationErrors.address) {
                      setValidationErrors(prev => ({ ...prev, address: '' }));
                    }
                  }}
                  required
                ></textarea>
                {validationErrors.address && (
                  <p className="text-sm text-red-500">{validationErrors.address}</p>
                )}
              </div>
              
              {/* Passport Size Photo Upload */}
              {/* <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                <label className="text-base font-semibold text-gray-700">Passport Size Photo <span className="text-red-500">*</span></label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0">
                    <label className={`flex flex-col items-center justify-center w-32 h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${
                      validationErrors.passportPhoto 
                        ? 'border-red-500 bg-red-50' 
                        : passportPhoto
                        ? 'border-green-500 bg-green-50'
                        : 'border-[#e7ebf3] bg-[#f6f6f8] hover:border-[#000]'
                    }`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handlePhotoUpload(file || null);
                        }}
                      />
                      {passportPhoto ? (
                        <img src={passportPhoto} alt="Passport photo" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">add_photo_alternate</span>
                          <span className="text-xs text-gray-500 text-center px-2">Click to upload</span>
                        </>
                      )}
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Please upload a recent passport-size photograph (JPG, PNG, max 5MB)
                    </p>
                    {passportPhotoFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="material-symbols-outlined text-base text-green-600">check_circle</span>
                        <span className="text-gray-700 font-medium">{passportPhotoFile.name} ({(passportPhotoFile.size / 1024).toFixed(2)} KB)</span>
                        <button
                          type="button"
                          onClick={() => {
                            handlePhotoUpload(null);
                            // Reset file input
                            const fileInput = document.getElementById('passport-photo-input') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.value = '';
                            }
                          }}
                          className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                          title="Remove photo"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    )}
                    {validationErrors.passportPhoto && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.passportPhoto}</p>
                    )}
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-l font-semibold border-b pb-2 sm:pb-4 uppercase tracking-wider text-gray-500 text-base">Step {displayStep}: Right to Work Verification</h2>
            <div className="border-2 border-[#425361]/20 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[#425361] px-4 py-2.5 sm:p-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined font-bold text-2xl">verified_user</span>
                  <div>
                    <h3 className="font-black font-bold tracking-widest text-sm text-white">Right to Work – Share Code</h3>
                    <p className="text-[10px] text-white/80 font-bold uppercase tracking-tight">(How to get it)</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-8 space-y-6 bg-white">
                <div className="bg-blue-50 border border-[#c7c7c7] p-2 sm:p-5 rounded-xl text-[14px] text-black font-medium leading-relaxed">
                  <p className="font-bold mb-1">Since you are not a UK or Irish citizen, you must provide a Share Code from the UK Government website.</p>
                  <p className="text-[14px] font-semibold font-black uppercase tracking-tight text-gray-600">This is required by the UK Home Office</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8  ">
                  <div className="space-y-6">
                    <h4 className="text-sm font-semibold font-black text-[#000] uppercase tracking-widest mb-4 flex items-center gap-2">Required Steps</h4>
                    <div className="space-y-4 text-[11px] text-gray-500 leading-normal">
                      <p>1. Go to <a href="https://www.gov.uk/prove-right-to-work" target="_blank" className="text-blue-500 underline font-bold">gov.uk/prove-right-to-work</a></p>
                      <p>2. Sign in with BRP/UKVI details</p>
                      <p>3. Generate a Share Code (e.g. AB12CDE3)</p>
                      <p>4. Take a screenshot showing your photo and code</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-700">9-Character Share Code *</label>
                      <input 
                        className={`form-input h-11 rounded-lg border text-sm font-mono font-black tracking-widest px-4 py-2 outline-none ${
                          validationErrors.shareCode ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3] bg-gray-50'
                        }`}
                        placeholder="AB12CDE3" 
                        maxLength={9}
                        value={shareCode}
                        onChange={(e) => {
                          setShareCode(e.target.value.toUpperCase());
                          if (validationErrors.shareCode) {
                            setValidationErrors(prev => ({ ...prev, shareCode: '' }));
                          }
                        }}
                        required
                      />
                      {validationErrors.shareCode && (
                        <p className="text-sm text-red-500">{validationErrors.shareCode}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-700">Screenshot Upload *</label>
                      <label className={`flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                        validationErrors.shareCodeScreenshot 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-[#e7ebf3] bg-gray-50 text-gray-400 hover:border-[#000]'
                      }`}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload('shareCodeScreenshot', file);
                              if (validationErrors.shareCodeScreenshot) {
                                setValidationErrors(prev => ({ ...prev, shareCodeScreenshot: '' }));
                              }
                            }
                          }}
                        />
                        <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                        <span className="text-xs font-bold">
                          {uploadedFiles.shareCodeScreenshot ? uploadedFiles.shareCodeScreenshot.name : 'Upload Screenshot'}
                        </span>
                      </label>
                      {validationErrors.shareCodeScreenshot && (
                        <p className="text-sm text-red-500">{validationErrors.shareCodeScreenshot}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">Step {displayStep}: Visa Type</h2>
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700">What is your visa type? <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Student Visa',
                  'Skilled Worker Visa',
                  'Graduate Visa',
                  'Dependant Visa',
                  'Other'
                ].map((type) => (
                  <label 
                    key={type} 
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
                      visaType === type ? 'border-[#000] bg-blue-50/50' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="visaType" 
                      className="size-5 text-[#135bec] focus:ring-[#135bec] border-gray-300"
                      checked={visaType === type}
                      onChange={() => {
                        setVisaType(type);
                        if (validationErrors.visaType) {
                          setValidationErrors(prev => ({ ...prev, visaType: '' }));
                        }
                      }}
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-900">{type}</span>
                  </label>
                ))}
              </div>
              {validationErrors.visaType && (
                <p className="text-sm text-red-500">{validationErrors.visaType}</p>
              )}
              {visaType === 'Other' && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Please Specify Visa Type</label>
                  <input 
                    className={`form-input w-full px-4 py-2 outline-none h-12 rounded-xl border bg-gray-50 focus:ring-[#135bec] ${
                      validationErrors.visaOther ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3]'
                    }`}
                    placeholder="Enter visa category"
                    value={visaOther}
                    onChange={(e) => {
                      setVisaOther(e.target.value);
                      if (validationErrors.visaOther) {
                        setValidationErrors(prev => ({ ...prev, visaOther: '' }));
                      }
                    }}
                  />
                  {validationErrors.visaOther && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.visaOther}</p>
                  )}
                </div>
              )}
              {validationErrors.visaType && (
                <p className="text-sm text-red-500 mt-2">{validationErrors.visaType}</p>
              )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">Step {displayStep}: Student Visa Section</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#135bec]">school</span>
                <div className="text-xs text-blue-900 font-medium leading-relaxed">
                  <p className="font-bold">University Details Required</p>
                  <p className="opacity-80">As a Student Visa holder, we must verify your term dates to ensure compliance with UKVI working hour restrictions.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700">University / College Name *</label>
                  <input 
                    className={`form-input h-12 rounded-xl border bg-white focus:ring-[#135bec] text-sm font-semibold ${
                      validationErrors.uniName ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3]'
                    }`}
                    placeholder="e.g. University of London"
                    value={uniName}
                    onChange={(e) => {
                      setUniName(e.target.value);
                      if (validationErrors.uniName) {
                        setValidationErrors(prev => ({ ...prev, uniName: '' }));
                      }
                    }}
                  />
                  {validationErrors.uniName && (
                    <p className="text-sm text-red-500">{validationErrors.uniName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700">Course Name *</label>
                  <input 
                    className={`form-input h-12 rounded-xl border bg-white focus:ring-[#135bec] text-sm font-semibold ${
                      validationErrors.courseName ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3]'
                    }`}
                    placeholder="e.g. BSc Computer Science"
                    value={courseName}
                    onChange={(e) => {
                      setCourseName(e.target.value);
                      if (validationErrors.courseName) {
                        setValidationErrors(prev => ({ ...prev, courseName: '' }));
                      }
                    }}
                  />
                  {validationErrors.courseName && (
                    <p className="text-sm text-red-500">{validationErrors.courseName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 text-[#135bec]">Term Start Date *</label>
                  <input 
                    type="date"
                    className={`form-input h-12 rounded-xl border bg-white focus:ring-[#135bec] text-sm font-semibold ${
                      validationErrors.termStart ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3]'
                    }`}
                    value={termStart}
                    onChange={(e) => {
                      setTermStart(e.target.value);
                      if (validationErrors.termStart) {
                        setValidationErrors(prev => ({ ...prev, termStart: '' }));
                      }
                    }}
                  />
                  {validationErrors.termStart && (
                    <p className="text-sm text-red-500">{validationErrors.termStart}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 text-[#135bec]">Term End Date *</label>
                  <input 
                    type="date"
                    className={`form-input h-12 rounded-xl border bg-white focus:ring-[#135bec] text-sm font-semibold ${
                      validationErrors.termEnd ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3]'
                    }`}
                    value={termEnd}
                    onChange={(e) => {
                      setTermEnd(e.target.value);
                      if (validationErrors.termEnd) {
                        setValidationErrors(prev => ({ ...prev, termEnd: '' }));
                      }
                    }}
                  />
                  {validationErrors.termEnd && (
                    <p className="text-sm text-red-500">{validationErrors.termEnd}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-gray-700">Upload Official Term Dates Document *</label>
                <label className={`p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer group flex flex-col items-center justify-center text-center ${
                  validationErrors.termDatesDocument 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-[#e7ebf3] bg-gray-50/50 hover:bg-gray-50 hover:border-[#135bec]'
                }`}>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload('termDatesDocument', file);
                        if (validationErrors.termDatesDocument) {
                          setValidationErrors(prev => ({ ...prev, termDatesDocument: '' }));
                        }
                      }
                    }}
                  />
                  <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-[#135bec] transition-colors mb-2">upload_file</span>
                  <p className="text-sm font-bold text-gray-600 group-hover:text-gray-900">
                    {uploadedFiles.termDatesDocument ? uploadedFiles.termDatesDocument.name : 'Click to upload document'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">Letter / Timetable / Official Email (PDF, JPG, PNG)</p>
                </label>
                {validationErrors.termDatesDocument && (
                  <p className="text-sm text-red-500">{validationErrors.termDatesDocument}</p>
                )}
              </div>

              <label className={`flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all group ${
                validationErrors.hasAgreedToHours 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-[#135bec]/10 bg-[#135bec]/5 hover:bg-[#135bec]/10'
              }`}>
                <input 
                  type="checkbox" 
                  className="size-6 rounded-lg text-[#135bec] focus:ring-[#135bec] mt-0.5" 
                  checked={hasAgreedToHours}
                  onChange={(e) => {
                    setHasAgreedToHours(e.target.checked);
                    if (validationErrors.hasAgreedToHours) {
                      setValidationErrors(prev => ({ ...prev, hasAgreedToHours: '' }));
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900 leading-tight">Working Hours Declaration</p>
                  <p className="text-xs text-[#135bec] font-bold mt-1">I understand I can work a maximum of 20 hours per week during term time.</p>
                </div>
              </label>
              {validationErrors.hasAgreedToHours && (
                <p className="text-sm text-red-500">{validationErrors.hasAgreedToHours}</p>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">Step {displayStep}: Identity Proof</h2>
            <div className="space-y-6">
              <div className="p-4 bg-[#f2f6f9] rounded-xl border border-gray-100">
                <p className="text-base font-bold text-gray-800">Upload one (Required):</p>
                <p className="text-base text-gray-500 mt-1">Please provide a clear photo or scan of one of the following documents to verify your identity.</p>
              </div>
              {validationErrors.identityProof && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-semibold">{validationErrors.identityProof}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Passport', sub: 'Standard identity document', icon: 'menu_book', key: 'passport' as const },
                  { title: 'Biometric Residence Permit (BRP)', sub: 'Issued to non-UK nationals', icon: 'badge', key: 'brp' as const },
                  { title: 'UK Residence Card / Frontier Worker Permit', sub: 'For eligible non-UK residents', icon: 'perm_identity', key: 'residenceCard' as const },
                  { title: 'Driving Licence', sub: 'Full or Provisional', icon: 'directions_car', key: 'drivingLicence' as const }
                ].map((doc) => (
                  <div key={doc.title} className="p-4 sm:p-5 border-2 border-[#e7ebf3] rounded-2xl bg-white hover:border-[#000] transition-all cursor-pointer group shadow-sm flex items-start gap-4">
                    <div className="size-12 bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-[#000] rounded-xl flex items-center justify-center shrink-0 transition-colors">
                      <span className="material-symbols-outlined text-2xl">{doc.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold font-black text-gray-900 leading-tight group-hover:text-[#000] transition-colors">{doc.title}</p>
                      <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">{doc.sub}</p>
                      <label className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#000] cursor-pointer">
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png" 
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(doc.key, file);
                              if (validationErrors.identityProof) {
                                setValidationErrors(prev => ({ ...prev, identityProof: '' }));
                              }
                            }
                          }}
                        />
                        <span className="material-symbols-outlined text-sm font-bold">cloud_upload</span>
                        {uploadedFiles[doc.key] ? uploadedFiles[doc.key]!.name : 'Upload File'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Salary Slip Section - Required */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-4">
                  <p className="text-base font-bold text-gray-800">Last 3 Month Salary Slip <span className="text-red-500">*</span></p>
                  <p className="text-base text-gray-500 mt-1">Please upload your last 3 months of salary slips. This is a required document for verification.</p>
                </div>
                {validationErrors.salarySlip && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                    <p className="text-sm text-red-600 font-semibold">{validationErrors.salarySlip}</p>
                  </div>
                )}
                <label className={`p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer group flex flex-col items-center justify-center text-center ${
                  validationErrors.salarySlip 
                    ? 'border-red-500 bg-red-50' 
                    : uploadedFiles.salarySlip
                    ? 'border-green-500 bg-green-50/30'
                    : 'border-[#e7ebf3] bg-gray-50/50 hover:bg-gray-50 hover:border-[#000]'
                }`}>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload('salarySlip', file);
                        if (validationErrors.salarySlip) {
                          setValidationErrors(prev => ({ ...prev, salarySlip: '' }));
                        }
                      }
                    }}
                  />
                  <div className={`size-14 sm:size-16 ${uploadedFiles.salarySlip ? 'bg-green-100 text-green-600' : 'bg-[#425361] text-white'} rounded-full flex items-center justify-center mb-4 transition-colors`}>
                    <span className="material-symbols-outlined text-3xl">{uploadedFiles.salarySlip ? 'check_circle' : 'upload_file'}</span>
                  </div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                    {uploadedFiles.salarySlip ? 'Salary Slip Uploaded' : 'Upload Last 3 Month Salary Slip'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    {uploadedFiles.salarySlip 
                      ? `${uploadedFiles.salarySlip.name} (${(uploadedFiles.salarySlip.size / 1024).toFixed(2)} KB)`
                      : 'Click to upload or drag and drop (PDF, JPG, PNG)'
                    }
                  </p>
                  {uploadedFiles.salarySlip && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileUpload('salarySlip', null);
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = '';
                        }
                      }}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 font-bold transition-colors"
                    >
                      Remove File
                    </button>
                  )}
                </label>
                {validationErrors.salarySlip && (
                  <p className="text-sm text-red-500 mt-2">{validationErrors.salarySlip}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4 sm:space-y-8">
            <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">Step {displayStep}: Employment Type</h2>
            <div className="space-y-6">
              <p className="text-base font-bold text-gray-800">What type of employment are you applying for? <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(EmploymentType).map((type) => (
                  <label 
                    key={type} 
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      employmentType === type ? 'border-[#000] bg-blue-50/50' : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="employmentType" 
                      className="size-5 text-[#135bec] focus:ring-[#000] border-gray-300"
                      checked={employmentType === type}
                      onChange={() => {
                        setEmploymentType(type);
                        if (validationErrors.employmentType) {
                          setValidationErrors(prev => ({ ...prev, employmentType: '' }));
                        }
                      }}
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-900">{type}</span>
                  </label>
                ))}
              </div>
              {validationErrors.employmentType && (
                <p className="text-sm text-red-500">{validationErrors.employmentType}</p>
              )}
              <p className="text-base font-bold text-gray-800 mt-6">Are you applying for Full-Time or Part-Time work? <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'Full-Time', icon: 'schedule', desc: 'Typical 35-40 hours per week' },
                  { id: 'Part-Time', icon: 'calendar_today', desc: 'Flexible or reduced hours' }
                ].map((pref) => (
                  <label 
                    key={pref.id} 
                    className={`flex flex-col items-center p-4 sm:p-8 border-2 rounded-2xl cursor-pointer transition-all text-center gap-4 ${
                      workPreference === pref.id ? 'border-[#000] ' : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="workPreference" 
                      className="hidden"
                      checked={workPreference === pref.id}
                      onChange={() => {
                        setWorkPreference(pref.id as any);
                        if (validationErrors.workPreference) {
                          setValidationErrors(prev => ({ ...prev, workPreference: '' }));
                        }
                      }}
                    />
                    <div className={`size-12 sm:size-14 rounded-full flex items-center justify-center transition-colors ${
                      workPreference === pref.id ? 'bg-[#425361] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <span className="material-symbols-outlined text-3xl">{pref.icon}</span>
                    </div>
                    <div>
                      <p className={`text-base font-semibold font-black ${workPreference === pref.id ? 'text-[#000]' : 'text-gray-900'}`}>{pref.id}</p>
                      <p className="text-[14px] text-gray-500 font-medium mt-1">{pref.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {validationErrors.workPreference && (
                <p className="text-sm text-red-500">{validationErrors.workPreference}</p>
              )}
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4 sm:space-y-8">
            <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">Step {displayStep}: DBS Check</h2>
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-base font-bold text-gray-800">Do you currently hold a DBS certificate? <span className="text-red-500">*</span></p>
                {validationErrors.hasDBS && (
                  <p className="text-sm text-red-500">{validationErrors.hasDBS}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: true, label: 'Yes', icon: 'check_circle' },
                    { val: false, label: 'No', icon: 'cancel' }
                  ].map((option) => (
                    <label 
                      key={option.label}
                      className={`flex items-center justify-center gap-3 p-2 sm:p-4 sm:p-6 border-2 rounded-full cursor-pointer transition-all ${
                        hasDBS === option.val ? 'border-[#000] bg-[#f2f6f9] text-[#000]' : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <input 
                        type="radio" 
                        className="hidden"
                        checked={hasDBS === option.val}
                        onChange={() => {
                          setHasDBS(option.val);
                          if (validationErrors.hasDBS || validationErrors.dbsCertificate) {
                            setValidationErrors(prev => ({ ...prev, hasDBS: '', dbsCertificate: '' }));
                          }
                        }}
                      />
                      <span className="material-symbols-outlined">{option.icon}</span>
                      <span className="font-black uppercase tracking-widest text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {validationErrors.hasDBS && (
                <p className="text-sm text-red-500">{validationErrors.hasDBS}</p>
              )}

              {hasDBS === true && (
                <div className="animate-in slide-in-from-top-4 duration-500 space-y-6">
                  <label className={`p-4 sm:p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center group transition-all cursor-pointer ${
                    validationErrors.dbsCertificate 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-[#c7c7c7c7] bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#000]'
                  }`}>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload('dbsCertificate', file);
                          if (validationErrors.dbsCertificate) {
                            setValidationErrors(prev => ({ ...prev, dbsCertificate: '' }));
                          }
                        }
                      }}
                    />
                    <div className="size-14 sm:size-16 bg-[#425361] text-white rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-3xl">upload_file</span>
                    </div>
                    <h3 className="text-sm font-black font-bold text-gray-900 uppercase tracking-widest">Upload DBS Certificate</h3>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      {uploadedFiles.dbsCertificate ? uploadedFiles.dbsCertificate.name : 'Please upload a clear scan or photo of your certificate.'}
                    </p>
                    <p className="text-[14px] text-[#444] font-black mt-4 font-semibold ">Authority: Disclosure and Barring Service</p>
                  </label>
                  {validationErrors.dbsCertificate && (
                    <p className="text-sm text-red-500 mt-2">{validationErrors.dbsCertificate}</p>
                  )}
                </div>
              )}
              
              {hasDBS === false && (
                <div className="animate-in fade-in duration-500 p-6 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-4">
                  <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#135bec]">
                    <span className="material-symbols-outlined">history_edu</span>
                  </div>
                  <p className="text-xs font-medium text-gray-600 leading-relaxed">
                    Xpect Group will initiate a <span className="font-bold text-gray-900">Enhanced DBS Check</span> for you upon successful completion of your profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">Step {displayStep}: Employment Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-base font-semibold text-gray-700">Availability to Start <span className="text-red-500">*</span></label>
                <select 
                  className={`form-select px-4 py-2 h-12 rounded-xl border bg-gray-50 focus:ring-[#135bec] text-sm font-semibold outline-none ${
                    validationErrors.availabilityToStart ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3]'
                  }`}
                  value={availabilityToStart}
                  onChange={(e) => {
                    setAvailabilityToStart(e.target.value);
                    if (validationErrors.availabilityToStart) {
                      setValidationErrors(prev => ({ ...prev, availabilityToStart: '' }));
                    }
                  }}
                  required
                >
                  <option value="">Select Availability</option>
                  <option value="Immediate">Immediate</option>
                  <option value="1 Week Notice">1 Week Notice</option>
                  <option value="2 Weeks Notice">2 Weeks Notice</option>
                  <option value="4 Weeks Notice">4 Weeks Notice</option>
                </select>
                {validationErrors.availabilityToStart && (
                  <p className="text-sm text-red-500">{validationErrors.availabilityToStart}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-semibold text-gray-700">Preferred Shift Pattern <span className="text-red-500">*</span></label>
                <select 
                  className={`form-select px-4 py-2 h-12 rounded-xl border bg-gray-50 focus:ring-[#135bec] text-sm font-semibold outline-none ${
                    validationErrors.preferredShiftPattern ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3]'
                  }`}
                  value={preferredShiftPattern}
                  onChange={(e) => {
                    setPreferredShiftPattern(e.target.value);
                    if (validationErrors.preferredShiftPattern) {
                      setValidationErrors(prev => ({ ...prev, preferredShiftPattern: '' }));
                    }
                  }}
                  required
                >
                  <option value="">Select Shift Pattern</option>
                  <option value="Mornings Only">Mornings Only</option>
                  <option value="Afternoons Only">Afternoons Only</option>
                  <option value="Evenings / Weekends">Evenings / Weekends</option>
                  <option value="Any">Any</option>
                </select>
                {validationErrors.preferredShiftPattern && (
                  <p className="text-sm text-red-500">{validationErrors.preferredShiftPattern}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-6 animate-in fade-in duration-700">
            <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">Step {displayStep}: Final Declarations</h2>
            
            <div className="bg-blue-50/30 p-4 sm:p-6 rounded-2xl border border-black-100 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#34d399]">verified</span>
                <h3 className="text-sm font-black text-[#34d399] uppercase tracking-widest">Confirmation Required</h3>
              </div>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                By submitting this application, you agree to the following mandatory statements. This is the final step in your registration process.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'accuracy', text: 'I confirm the information provided is accurate' },
                  { id: 'rtw', text: 'I consent to Right-to-Work verification' },
                  { id: 'approval', text: 'I understand employment is subject to approval' },
                  { id: 'gdpr', text: 'I consent to secure storage of my data under UK GDPR' }
                ].map((item) => (
                  <label 
                    key={item.id} 
                    className={`flex items-start gap-4 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      declarations[item.id as keyof typeof declarations] 
                        ? 'border-[#000] bg-blue-50/50' 
                        : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="size-4 rounded-lg text-[#34d399] focus:ring-[#135bec] mt-0.5" 
                      checked={declarations[item.id as keyof typeof declarations]}
                      onChange={(e) => setDeclarations(prev => ({ ...prev, [item.id]: e.target.checked }))}
                    />
                    <span className={`text-base font-semibold ${
                      declarations[item.id as keyof typeof declarations] ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mt-8 flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-lg">policy</span>
                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">Authority</span>
              </div>
              <span className="text-[12px] text-gray-900 font-black font-bold">Information Commissioner's Office (ICO)</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Email validation helper
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check step validity without updating state (for isNextDisabled)
  const checkStepValidity = (): boolean => {
    if (step === 1) {
      return !!citizenshipStatus;
    } else if (step === 2) {
      return !!(personalDetails.name.trim() && 
                personalDetails.email.trim() && 
                isValidEmail(personalDetails.email) &&
                personalDetails.phoneNumber.trim() && 
                personalDetails.dob && 
                personalDetails.address.trim() && 
                personalDetails.gender.trim() &&
                (passportPhoto || passportPhotoFile));
    } else if (step === 3 && !isBritishOrIrish) {
      return !!(shareCode.trim() && shareCode.trim().length === 9 && uploadedFiles.shareCodeScreenshot);
    } else if (step === 4) {
      if (!visaType) return false;
      if (visaType === 'Other' && !visaOther.trim()) return false;
      return true;
    } else if (step === 5) {
      return !!(uniName.trim() && 
                courseName.trim() && 
                termStart && 
                termEnd && 
                new Date(termStart) < new Date(termEnd) &&
                uploadedFiles.termDatesDocument && 
                hasAgreedToHours);
    } else if (step === 6) {
      const hasIdentityDoc = uploadedFiles.passport || uploadedFiles.brp || uploadedFiles.residenceCard || uploadedFiles.drivingLicence;
      const hasSalarySlip = !!uploadedFiles.salarySlip;
      return !!hasIdentityDoc && hasSalarySlip;
    } else if (step === 7) {
      return !!(employmentType && workPreference);
    } else if (step === 8) {
      if (hasDBS === null) return false;
      if (hasDBS === true && !uploadedFiles.dbsCertificate) return false;
      return true;
    } else if (step === 9) {
      return !!(availabilityToStart && availabilityToStart !== 'Select Availability' && 
                preferredShiftPattern && preferredShiftPattern !== 'Any');
    } else if (step === 10) {
      return !!(declarations.accuracy && declarations.rtw && declarations.approval && declarations.gdpr);
    }
    return true;
  };

  // Validate current step and set errors (for handleNext)
  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!citizenshipStatus) {
        errors.citizenshipStatus = 'Please select your citizenship status';
        isValid = false;
      }
    } else if (step === 2) {
      if (!personalDetails.name.trim()) {
        errors.name = 'Full name is required';
        isValid = false;
      }
      if (!personalDetails.email.trim()) {
        errors.email = 'Email address is required';
        isValid = false;
      } else if (!isValidEmail(personalDetails.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }
      if (!personalDetails.phoneNumber.trim()) {
        errors.phoneNumber = 'Phone number is required';
        isValid = false;
      }
      if (!personalDetails.dob) {
        errors.dob = 'Date of birth is required';
        isValid = false;
      }
      if (!personalDetails.address.trim()) {
        errors.address = 'Current address is required';
        isValid = false;
      }
      if (!passportPhoto && !passportPhotoFile) {
        errors.passportPhoto = 'Passport size photo is required';
        isValid = false;
      }
      if (!personalDetails.gender.trim()) {
        errors.gender = 'Gender is required';
        isValid = false;
      }
    } else if (step === 3 && !isBritishOrIrish) {
      if (!shareCode.trim()) {
        errors.shareCode = 'Share code is required';
        isValid = false;
      } else if (shareCode.trim().length !== 9) {
        errors.shareCode = 'Share code must be 9 characters';
        isValid = false;
      }
      if (!uploadedFiles.shareCodeScreenshot) {
        errors.shareCodeScreenshot = 'Share code screenshot is required';
        isValid = false;
      }
    } else if (step === 4) {
      if (!visaType) {
        errors.visaType = 'Please select a visa type';
        isValid = false;
      }
      if (visaType === 'Other' && !visaOther.trim()) {
        errors.visaOther = 'Please specify your visa type';
        isValid = false;
      }
    } else if (step === 5) {
      if (!uniName.trim()) {
        errors.uniName = 'University/College name is required';
        isValid = false;
      }
      if (!courseName.trim()) {
        errors.courseName = 'Course name is required';
        isValid = false;
      }
      if (!termStart) {
        errors.termStart = 'Term start date is required';
        isValid = false;
      }
      if (!termEnd) {
        errors.termEnd = 'Term end date is required';
        isValid = false;
      }
      if (termStart && termEnd && new Date(termStart) >= new Date(termEnd)) {
        errors.termEnd = 'Term end date must be after term start date';
        isValid = false;
      }
      if (!uploadedFiles.termDatesDocument) {
        errors.termDatesDocument = 'Term dates document is required';
        isValid = false;
      }
      if (!hasAgreedToHours) {
        errors.hasAgreedToHours = 'You must agree to the working hours declaration';
        isValid = false;
      }
    } else if (step === 6) {
      const hasIdentityDoc = uploadedFiles.passport || uploadedFiles.brp || uploadedFiles.residenceCard || uploadedFiles.drivingLicence;
      if (!hasIdentityDoc) {
        errors.identityProof = 'Please upload at least one identity document';
        isValid = false;
      }
      if (!uploadedFiles.salarySlip) {
        errors.salarySlip = 'Last 3 month salary slip is required';
        isValid = false;
      }
    } else if (step === 7) {
      if (!employmentType) {
        errors.employmentType = 'Please select an employment type';
        isValid = false;
      }
      if (!workPreference) {
        errors.workPreference = 'Please select Full-Time or Part-Time';
        isValid = false;
      }
    } else if (step === 8) {
      if (hasDBS === null) {
        errors.hasDBS = 'Please indicate if you have a DBS certificate';
        isValid = false;
      }
      if (hasDBS === true && !uploadedFiles.dbsCertificate) {
        errors.dbsCertificate = 'Please upload your DBS certificate';
        isValid = false;
      }
    } else if (step === 9) {
      if (!availabilityToStart || availabilityToStart === 'Select Availability') {
        errors.availabilityToStart = 'Availability to start is required';
        isValid = false;
      }
      if (!preferredShiftPattern || preferredShiftPattern === 'Any') {
        errors.preferredShiftPattern = 'Preferred shift pattern is required';
        isValid = false;
      }
    } else if (step === 10) {
      if (!declarations.accuracy) {
        errors.accuracy = 'You must confirm the information is accurate';
        isValid = false;
      }
      if (!declarations.rtw) {
        errors.rtw = 'You must consent to Right-to-Work verification';
        isValid = false;
      }
      if (!declarations.approval) {
        errors.approval = 'You must understand employment is subject to approval';
        isValid = false;
      }
      if (!declarations.gdpr) {
        errors.gdpr = 'You must consent to secure storage of your data';
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const isNextDisabled = () => {
    return !checkStepValidity();
  };

  const isLastStep = displayStep === totalSteps;

  return (
    <div className="flex-1 flex flex-col items-center py-4 sm:py-10 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-[800px] flex flex-col gap-4 sm:gap-8">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl sm:text-3xl font-black font-bold text-[#0d121b]">Join Xpect Group</h1>
          <p className="text-[#4c669a] font-base">Complete your profile to join our professional team.</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#e7ebf3] shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#34d399]">Onboarding Step {displayStep} of {totalSteps}</span>
            <span className="text-[#4c669a] font-medium">{Math.round((displayStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#cfd7e7] overflow-hidden">
            <div 
              className="h-full bg-[#34d399] transition-all duration-500 ease-out" 
              style={{ width: `${(displayStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-2xl border border-[#e7ebf3] shadow-lg min-h-[400px] flex flex-col">
          <div className="flex-1">
            {renderStep()}
          </div>
          <div className="flex justify-between mt-5 sm:mt-8 pt-4 sm:pt-8 border-t">
            <button 
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-[30px] py-[15px] rounded-full h-10 border border-[#e7ebf3] font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStepIndex === 0 ? 'Cancel' : 'Back'}
            </button>
            <button 
              disabled={isNextDisabled() || isSubmitting}
              onClick={handleNext}
              className={`px-[30px] py-[15px] h-10 rounded-full bg-[#2e4150]/90 text-white font-semibold text-sm sm:text-base cursor-pointer hover:bg-[#2e4150] transition-all flex items-center gap-2 ${
                isNextDisabled() || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">hourglass_empty</span>
                  Submitting...
                </>
              ) : (
                <>
                  {isLastStep ? 'Submit' : 'Next Step'}
                  <span className="material-symbols-outlined text-lg">{isLastStep ? 'send' : 'arrow_forward'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;