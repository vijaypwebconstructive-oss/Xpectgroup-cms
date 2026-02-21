# Onboarding Form Step Logic & Progress Storage

## Step Structure Overview

The onboarding form uses **internal step numbers (1-10)** that are **conditionally displayed** based on the user's citizenship status. Not all steps are always active.

### All Possible Steps (Internal Numbers)

1. **Step 1**: Citizenship / Immigration Status (ALWAYS ACTIVE)
2. **Step 2**: Personal Details (ALWAYS ACTIVE)
3. **Step 3**: Right to Work / Share Code (CONDITIONAL - Only if NOT UK/Irish)
4. **Step 4**: Visa Type (CONDITIONAL - Only if Non-EU)
5. **Step 5**: Student Visa Details (CONDITIONAL - Only if Student Visa)
6. **Step 6**: Identity Proof / Documents (ALWAYS ACTIVE)
7. **Step 7**: Employment Type (ALWAYS ACTIVE)
8. **Step 8**: DBS Check (ALWAYS ACTIVE)
9. **Step 9**: Employment Preferences (ALWAYS ACTIVE)
10. **Step 10**: Declarations & Consent (ALWAYS ACTIVE)

---

## Step Calculation Logic

### `getActiveSteps()` Function

```javascript
const getActiveSteps = () => {
  const steps = [1, 2];                    // Always active
  if (!isBritishOrIrish) steps.push(3);   // Conditional
  if (isNonEU) steps.push(4);             // Conditional
  if (isStudentVisa) steps.push(5);       // Conditional
  steps.push(6, 7, 8, 9, 10);            // Always active
  return steps;
};
```

### Examples of Active Steps

**UK/Irish Citizen:**
- Active Steps: `[1, 2, 6, 7, 8, 9, 10]` (7 steps total)
- Steps 3, 4, 5 are **skipped**

**Non-EU Citizen (Non-Student Visa):**
- Active Steps: `[1, 2, 3, 4, 6, 7, 8, 9, 10]` (9 steps total)
- Step 5 is **skipped**

**Non-EU Citizen (Student Visa):**
- Active Steps: `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` (10 steps total)
- All steps are active

---

## Progress Storage Logic

### What Gets Saved

**When user clicks "Next" (step completion):**
```javascript
{
  currentStep: 6,              // Internal step number (1-10)
  lastCompletedStep: 6,        // Last step completed
  formData: {
    citizenshipStatus: "UK Citizen",
    personalDetails: {...},
    // ... all form fields
    // ... all uploaded files (as base64)
  }
}
```

**Key Points:**
- We save the **internal step number** (1-10), not the display step number
- `currentStep`: Where the user is now (even if not completed)
- `lastCompletedStep`: Last step they successfully completed
- `formData`: Complete form state including all fields and files

---

## Step Navigation Flow

### Example: UK Citizen Flow

```
Step 1 (Citizenship) → Select "UK Citizen"
  ↓
Step 2 (Personal Details) → Fill form → Click "Next"
  ↓ (Step 3, 4, 5 are SKIPPED - not in activeSteps)
Step 6 (Identity Proof) → Fill form → Click "Next"
  ↓
Step 7 (Employment Type) → ...
```

**Active Steps Array:** `[1, 2, 6, 7, 8, 9, 10]`

**Progress Saved:**
- After Step 2: `currentStep: 6, lastCompletedStep: 2`
- After Step 6: `currentStep: 7, lastCompletedStep: 6`

---

## Resume Logic

### How Steps Are Restored

1. **Load saved progress** from database
2. **Restore citizenshipStatus** first (needed for step calculation)
3. **Calculate activeSteps** based on restored citizenshipStatus
4. **Check if savedCurrentStep is in activeSteps**
   - ✅ If yes: Resume from `savedCurrentStep`
   - ❌ If no: Find appropriate step based on `lastCompletedStep`

### Resume Examples

**Example 1: Normal Resume**
```
Saved: currentStep: 6, lastCompletedStep: 5
Active Steps: [1, 2, 6, 7, 8, 9, 10]
Result: Resume at step 6 ✅
```

**Example 2: Step Not in Active Steps**
```
Saved: currentStep: 3, lastCompletedStep: 2
Active Steps: [1, 2, 6, 7, 8, 9, 10] (UK Citizen - step 3 skipped)
Result: Resume at step 6 (next step after lastCompletedStep: 2) ✅
```

**Example 3: Last Step Completed**
```
Saved: currentStep: 10, lastCompletedStep: 10
Active Steps: [1, 2, 6, 7, 8, 9, 10]
Result: Resume at step 10 ✅
```

---

## Backend Validation

### Step Order Validation

**Old Logic (Too Strict):**
```javascript
if (step > lastCompletedStep + 1) {
  // Reject - prevents skipping conditional steps
}
```

**New Logic (Aligned with Conditional Steps):**
```javascript
if (step < lastCompletedStep) {
  // Reject - prevent going backwards
}
// Allow forward movement (step >= lastCompletedStep)
// Conditional steps are handled by frontend
```

**Why This Works:**
- UK Citizen completes step 2 → `lastCompletedStep: 2`
- Moves to step 6 (skipping 3, 4, 5) → `step: 6 >= 2` ✅ Allowed
- Frontend ensures step 6 is in `activeSteps` array

---

## Data Collection & Storage

### `collectFormData()` Function

Collects **ALL** form data including:

```javascript
{
  // Personal Information
  personalDetails: { name, email, phone, dob, address, gender },
  passportPhoto: "base64...",
  
  // Citizenship & Immigration
  citizenshipStatus: "UK Citizen",
  visaType: "...",
  visaOther: "...",
  shareCode: "...",
  
  // Student Visa (if applicable)
  uniName: "...",
  courseName: "...",
  termStart: "...",
  termEnd: "...",
  hasAgreedToHours: true/false,
  
  // Employment
  workPreference: "Full-Time" | "Part-Time",
  employmentType: "Permanent" | "Temporary" | ...,
  availabilityToStart: "...",
  preferredShiftPattern: "...",
  
  // DBS
  hasDBS: true/false,
  
  // Declarations
  declarations: { accuracy, rtw, approval, gdpr },
  
  // Uploaded Files (as base64)
  passport: "data:image/png;base64,...",
  passportName: "passport.jpg",
  brp: "data:image/png;base64,...",
  brpName: "brp.jpg",
  // ... all other files
}
```

---

## Step Saving Flow

### When User Clicks "Next"

```
1. Validate current step
   ↓
2. Save current step as COMPLETED
   ├─ currentStep: 6
   ├─ lastCompletedStep: 6
   └─ formData: { all current data }
   ↓
3. Move to next step
   ├─ nextStep: 7 (from activeSteps array)
   └─ setStep(7)
   ↓
4. Save new step as STARTED (not completed)
   ├─ currentStep: 7
   ├─ lastCompletedStep: 6 (unchanged)
   └─ formData: { all current data }
```

---

## Key Implementation Details

### 1. Step Numbers Are Internal (1-10)
- Always save/restore using internal step numbers
- Display step number is calculated: `displayStep = currentStepIndex + 1`

### 2. Conditional Steps Are Handled by Frontend
- Backend doesn't need to know about conditional steps
- Backend only validates: `step >= lastCompletedStep` (forward movement)

### 3. Active Steps Are Calculated Dynamically
- Based on `citizenshipStatus` (and `visaType` for step 5)
- Must be recalculated when restoring progress

### 4. Progress Is Saved on Step Transitions Only
- No continuous autosave (removed 2-second interval)
- Saves when clicking "Next" (step completion)
- Saves when starting new step (step started)

---

## Summary

✅ **Step numbers (1-10) are internal** - stored as-is in database
✅ **Active steps are calculated** based on citizenship status
✅ **Progress saves on step transitions** - when moving forward
✅ **Resume logic handles conditional steps** - finds correct step to resume from
✅ **Backend validation allows conditional step skipping** - only prevents going backwards
✅ **All form data is saved** - including files as base64

The system correctly handles all step scenarios:
- UK/Irish citizens (skip steps 3, 4, 5)
- Non-EU citizens (include step 3, 4)
- Student visa holders (include step 5)
- Resume from any step (1-10) based on saved progress
