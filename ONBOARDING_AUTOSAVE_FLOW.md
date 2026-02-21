# Onboarding Form Autosave & Resume Flow

## Overview
The onboarding system automatically saves progress for **ALL steps (1-10)** and allows employees to resume from **any step** they left off at, within a 30-day period.

---

## System Architecture

### Backend Components

#### 1. **OnboardingProgress Model** (`backend/models/OnboardingProgress.js`)
Stores complete onboarding progress in MongoDB:

```javascript
{
  inviteToken: "unique-token",        // Links to invitation
  currentStep: 5,                     // Step user is currently on (1-10)
  lastCompletedStep: 4,               // Last step user completed (1-10)
  formData: {                         // ALL form data
    personalDetails: {...},
    citizenshipStatus: "...",
    visaType: "...",
    uploadedFiles: {...},
    // ... all other fields
  },
  expiresAt: Date,                   // Auto-deletes after 30 days
  createdAt: Date,
  updatedAt: Date
}
```

**Key Features:**
- `currentStep`: Tracks which step the user is on (even if not completed)
- `lastCompletedStep`: Tracks the last step they successfully completed
- `formData`: Stores ALL form fields and uploaded files (as base64)
- **TTL Index**: Automatically deletes after 30 days

#### 2. **API Endpoints** (`backend/routes/invitations.js`)

**POST `/api/invitations/:inviteToken/progress`**
- Saves progress for ANY step (1-10)
- Parameters:
  - `step`: Current step number (1-10)
  - `formData`: Complete form data object
  - `isStepCompleted`: `true` if user clicked "Next", `false` if just filling form
- Behavior:
  - If `isStepCompleted = false`: Only updates `currentStep` (user is filling form)
  - If `isStepCompleted = true`: Updates both `currentStep` AND `lastCompletedStep`
- Validation: Prevents skipping steps (can't go to step 5 if step 3 isn't completed)

**GET `/api/invitations/:inviteToken/progress`**
- Returns saved progress with:
  - `currentStep`: Where to resume from
  - `lastCompletedStep`: Last completed step
  - `formData`: All saved form data

**DELETE `/api/invitations/:inviteToken/progress`**
- Clears saved progress (called after successful submission)

---

## Frontend Flow

### 1. **Initial Load** (`OnboardingFlow.tsx`)

```
Employee opens onboarding link
    ↓
EmployeeRouteGuard verifies JWT token
    ↓
OnboardingFlow component mounts
    ↓
loadInvitationData() called
    ↓
loadSavedProgress() called
    ↓
    ├─→ If saved progress exists:
    │   ├─→ Restore ALL form fields
    │   ├─→ Restore uploaded files
    │   ├─→ Calculate active steps based on citizenshipStatus
    │   └─→ Set step to savedCurrentStep (resume point)
    │
    └─→ If no saved progress:
        └─→ Start at step 1
```

### 2. **Continuous Autosave** (While Filling Form)

```
User types in form field OR uploads file
    ↓
useEffect detects change (after 2 seconds of inactivity)
    ↓
triggerAutosave(step, false) called
    ↓
collectFormData() gathers ALL form data
    ↓
POST /api/invitations/:inviteToken/progress
    ├─→ step: current step number
    ├─→ formData: complete form data
    └─→ isStepCompleted: false
    ↓
Backend saves:
    ├─→ currentStep: updated to current step
    ├─→ lastCompletedStep: unchanged (step not completed)
    └─→ formData: all current form data saved
```

### 3. **Step Completion** (Clicking "Next")

```
User clicks "Next" button
    ↓
handleNext() called
    ↓
validateStep() checks if step is valid
    ↓
If valid:
    ├─→ autosaveProgress(step, true) called
    │   └─→ Saves with isStepCompleted: true
    │       ├─→ currentStep: updated
    │       └─→ lastCompletedStep: updated (step marked as completed)
    │
    └─→ Move to next step
        └─→ triggerAutosave(nextStep, false) for new step
```

### 4. **Resume Flow** (Returning After Leaving)

```
Employee returns to onboarding link (within 30 days)
    ↓
loadSavedProgress() called
    ↓
GET /api/invitations/:inviteToken/progress
    ↓
Response contains:
    ├─→ currentStep: 5 (where they left off)
    ├─→ lastCompletedStep: 4 (last completed step)
    └─→ formData: all saved data
    ↓
Restore process:
    ├─→ Restore citizenshipStatus (needed for step calculation)
    ├─→ Restore all form fields
    ├─→ Restore uploaded files (convert base64 to File objects)
    ├─→ Calculate active steps based on citizenshipStatus
    └─→ Set step to currentStep (5)
    ↓
Form displays step 5 with all data pre-filled
```

---

## Step Tracking Examples

### Example 1: Employee Fills Step 2, Leaves, Returns

**First Visit:**
1. Employee starts at step 1
2. Completes step 1, clicks "Next" → `currentStep: 2`, `lastCompletedStep: 1`
3. Fills step 2 form fields → Autosave every 2 seconds → `currentStep: 2`, `lastCompletedStep: 1`
4. Employee closes browser (doesn't click "Next")

**Database State:**
```json
{
  "currentStep": 2,
  "lastCompletedStep": 1,
  "formData": {
    "personalDetails": {...},
    "citizenshipStatus": "UK Citizen",
    // ... all step 1 and step 2 data
  }
}
```

**Second Visit (within 30 days):**
1. System loads saved progress
2. Restores all form data
3. Sets step to 2 (currentStep)
4. Employee sees step 2 with all data pre-filled
5. Employee can continue from step 2

### Example 2: Employee Completes Steps 1-5, Leaves at Step 6

**First Visit:**
1. Completes steps 1-5 (clicks "Next" each time)
2. Starts filling step 6
3. Leaves without completing step 6

**Database State:**
```json
{
  "currentStep": 6,
  "lastCompletedStep": 5,
  "formData": {
    // All data from steps 1-6
  }
}
```

**Second Visit:**
1. System resumes at step 6
2. All previous data (steps 1-5) is restored
3. Step 6 form fields are pre-filled
4. Employee continues from step 6

### Example 3: Employee Reaches Step 10, Submits

**Flow:**
1. Completes all steps 1-9
2. Fills step 10 (declarations)
3. Clicks "Submit Application"
4. `submitApplication()` called
5. Cleaner record created
6. `clearProgress()` called → Deletes saved progress
7. Invitation status set to "COMPLETED"

---

## Data Persistence Details

### What Gets Saved

**Every autosave saves:**
- All form fields (personalDetails, citizenshipStatus, visaType, etc.)
- All uploaded files (converted to base64)
- Current step number
- Last completed step number

### File Handling

**Saving:**
- Files are converted to base64 data URLs
- Stored in `formData` with filename metadata
- Example: `formData.passport = "data:image/png;base64,..."`

**Restoring:**
- Base64 strings converted back to File objects
- Files restored to `uploadedFiles` state
- User sees files as if they were just uploaded

### Step Validation

**Backend enforces:**
- Cannot skip steps (must complete step N before accessing step N+1)
- Cannot go backwards beyond `lastCompletedStep`
- First save must be step 1

**Frontend enforces:**
- Step validation before allowing "Next"
- Conditional steps based on citizenshipStatus (e.g., step 3 only if not UK/Irish)

---

## 30-Day Expiration

### Automatic Cleanup

**MongoDB TTL Index:**
- `expiresAt` field set to 30 days from last save
- MongoDB automatically deletes document after `expiresAt`
- No manual cleanup needed

### What Happens After 30 Days

1. Employee tries to resume onboarding
2. `loadSavedProgress()` called
3. GET request returns: `hasProgress: false`
4. System starts from step 1 (fresh start)
5. All previous data is lost (by design)

---

## Security & Validation

### Token Verification
- Every save/load requires valid `inviteToken`
- JWT token verified by `EmployeeRouteGuard`
- Invitation must not be expired or completed

### Step Order Protection
- Backend prevents skipping steps
- Frontend validates step before allowing navigation
- Both `currentStep` and `lastCompletedStep` tracked separately

### Data Integrity
- All form data validated before saving
- Files validated (type, size) before conversion
- Step numbers validated (1-10 range)

---

## Summary

✅ **Tracks ALL steps (1-10)**, not just step 2
✅ **Resumes from ANY step** the employee left off at
✅ **Saves continuously** (every 2 seconds while filling form)
✅ **Saves on step completion** (when clicking "Next")
✅ **Stores complete form data** (all fields + files)
✅ **Auto-expires after 30 days** (MongoDB TTL)
✅ **Prevents step skipping** (validation on backend)
✅ **Restores files** (base64 conversion)

The system is designed to work seamlessly for all 10 steps, allowing employees to leave and return at any point in the onboarding process.
