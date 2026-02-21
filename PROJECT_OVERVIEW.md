# Xpect Portal - Complete Project Overview

## 📋 Project Description

**Xpect Portal** is a comprehensive full-stack onboarding and staff management system designed for Xpect Group to manage cleaner staff records, compliance documents, verification statuses, and employment allocations. The system provides a complete workflow from initial onboarding through verification and ongoing management.

---

## 🏗️ Architecture Overview

### **Full-Stack Application**
- **Frontend**: React 19 + TypeScript (SPA)
- **Backend**: Node.js + Express.js (REST API)
- **Database**: MongoDB with Mongoose ODM
- **Communication**: RESTful API with CORS support

### **Data Flow**
```
User Interface (React) 
    ↓
API Service Layer (api.ts)
    ↓
Backend API (Express.js)
    ↓
MongoDB Database
```

---

## 📁 Project Structure

```
Onboarding/
├── backend/                          # Backend Server
│   ├── models/
│   │   └── Cleaner.js               # MongoDB schema definitions
│   ├── routes/
│   │   ├── cleaners.js              # CRUD operations for cleaners
│   │   └── documents.js             # Document management endpoints
│   ├── server.js                    # Express server entry point
│   ├── check-setup.js               # Setup verification script
│   ├── package.json                 # Backend dependencies
│   └── .env                         # Environment variables
│
├── xpect-portal/                     # Frontend Application
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── Header.tsx           # Navigation header
│   │   │   └── EmploymentAllocationCard.tsx  # Employment details card
│   │   ├── context/
│   │   │   └── CleanersContext.tsx  # Global state management
│   │   ├── services/
│   │   │   └── api.ts               # API client & error handling
│   │   ├── utils/
│   │   │   └── connectionCheck.ts  # Backend health check
│   │   ├── views/                   # Page components
│   │   │   ├── Dashboard.tsx        # Main dashboard with stats & activity
│   │   │   ├── CleanersList.tsx     # Staff listing with search/filter
│   │   │   ├── CleanerDetail.tsx    # Individual staff profile
│   │   │   ├── OnboardingFlow.tsx   # Multi-step onboarding form
│   │   │   ├── ReportView.tsx       # Compliance report viewer
│   │   │   └── ThankYouView.tsx     # Post-onboarding confirmation
│   │   ├── types.tsx                # TypeScript interfaces & enums
│   │   ├── App.tsx                  # Main app component & routing
│   │   └── index.tsx               # React entry point
│   ├── public/                      # Static assets
│   └── package.json                # Frontend dependencies
│
└── Documentation Files
    ├── README.md                    # Main project documentation
    ├── BACKEND_SETUP_GUIDE.md      # Backend setup instructions
    ├── SETUP_INSTRUCTIONS.md       # General setup guide
    └── Various quick-start guides
```

---

## 🎯 Core Features

### **1. Multi-Step Onboarding Flow**
- **10-step dynamic form** that adapts based on user input:
  1. Citizenship/Immigration Status
  2. Personal Details (with passport photo upload)
  3. Right to Work (Share Code) - Conditional
  4. Visa Type - Conditional (Non-EU only)
  5. Student Visa Details - Conditional (Students only)
  6. Identity Proof Documents
  7. Employment Type Selection
  8. DBS Check Status
  9. Employment Preferences
  10. Declarations & Consent
- **Comprehensive validation**: All fields required with real-time error messages
- **File uploads**: Passport photos, identity documents, DBS certificates
- **PDF generation**: Employee can download submitted form as PDF

### **2. Staff Management Dashboard**
- **Real-time statistics**:
  - Total Staff count
  - Pending Verification count
  - Expiring Checks
  - Active Tasks
- **Dynamic Recent Activity Feed**:
  - Document uploads
  - Onboarding completions
  - Status changes
  - DBS updates
  - Pending applications
  - Clickable items navigate to staff profiles
- **Compliance Health Monitor**: Visual compliance rating

### **3. Staff Listing & Search**
- **Searchable list** of all staff members
- **Filter by verification status**
- **Export functionality** (CSV/JSON)
- **Quick navigation** to individual profiles

### **4. Detailed Staff Profiles**
- **Personal & Contact Details**: Editable by admin
- **Right to Work & Immigration**:
  - Citizenship status
  - Visa information
  - Share code with copy-to-clipboard
  - Student-specific academic details
- **Employment & Allocation Details**:
  - Hourly pay rate
  - Pay type (Hourly/Weekly/Monthly)
  - Work location
  - Shift type
  - Contract status (with color-coded badges)
  - Start date
  - **Editable** with save/cancel functionality
- **Document Management**:
  - View uploaded documents (images/PDFs)
  - Download documents
  - Upload new documents
  - Update document status (Verified/Pending/Rejected)
  - Status change tracking
- **Verification Control Panel**:
  - Change verification status
  - Add auditor notes
  - Revoke verification

### **5. Compliance Reports**
- **PDF generation** for compliance reports
- **Print functionality**
- **Complete staff record** with all details

### **6. Document Management System**
- **Multiple document types**: PDF, Images, DOC
- **Status tracking**: Verified, Pending, Rejected
- **Base64 storage** for file content
- **Document viewer modal** with image/PDF support
- **Upload date tracking**

---

## 🛠️ Technology Stack

### **Frontend**
- **React 19.2.3**: UI library
- **TypeScript 5.7.2**: Type safety
- **Tailwind CSS 4.1.18**: Utility-first styling
- **Vite 7.3.1**: Build tool & dev server
- **React Context API**: Global state management
- **Material Symbols**: Icon library

### **Backend**
- **Node.js**: Runtime environment
- **Express.js 4.18.2**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose 8.0.3**: ODM (Object Document Mapper)
- **CORS 2.8.5**: Cross-origin resource sharing
- **dotenv 16.3.1**: Environment variable management
- **Multer 1.4.5**: File upload handling (prepared)

### **Development Tools**
- **ES Modules**: Modern JavaScript module system
- **TypeScript**: Type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

---

## 🗄️ Database Schema

### **Cleaner Model**
```javascript
{
  // Core Identity
  id: String (unique, required)
  name: String (required)
  email: String (unique, required)
  phoneNumber: String (required)
  dob: String (required)
  address: String (required)
  gender: String
  avatar: String (URL or Base64)
  
  // Employment
  startDate: String (required)
  employmentType: Enum ['Contractor', 'Permanent', 'Temporary', 'Sub-contractor']
  workPreference: Enum ['Full-Time', 'Part-Time']
  location: String
  
  // Status Tracking
  verificationStatus: Enum ['Verified', 'Pending', 'Docs Required', 'Rejected']
  dbsStatus: Enum ['Cleared', 'Awaiting Docs', 'Not Started', 'Expired']
  onboardingProgress: Number (0-100)
  
  // Immigration & Right to Work
  citizenshipStatus: String (required)
  visaType: String
  visaOther: String
  shareCode: String
  
  // Student Visa Details (conditional)
  uniName: String
  courseName: String
  termStart: String
  termEnd: String
  
  // Employment Allocation
  hourlyPayRate: Number
  payType: Enum ['Hourly', 'Weekly', 'Monthly']
  shiftType: Enum ['Morning', 'Evening', 'Night']
  contractStatus: Enum ['Active', 'Paused', 'Ended']
  
  // Documents
  documents: [{
    id: String
    name: String
    type: Enum ['PDF', 'IMG', 'DOC']
    uploadDate: String
    status: Enum ['Verified', 'Pending', 'Rejected']
    fileUrl: String (Base64)
    fileName: String
  }]
  
  // Declarations
  declarations: {
    accuracy: Boolean
    rtw: Boolean
    approval: Boolean
    gdpr: Boolean
  }
  
  // Timestamps (auto-generated)
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### **Cleaners API** (`/api/cleaners`)
- `GET /` - Get all cleaners (sorted by creation date)
- `GET /:id` - Get cleaner by ID
- `POST /` - Create new cleaner
- `PATCH /:id` - Update cleaner (partial update)
- `DELETE /:id` - Delete cleaner
- `GET /status/:status` - Get cleaners by verification status

### **Documents API** (`/api/documents`)
- `GET /cleaner/:cleanerId` - Get all documents for a cleaner
- `POST /cleaner/:cleanerId` - Add document to cleaner
- `PUT /cleaner/:cleanerId/document/:documentId` - Update document
- `DELETE /cleaner/:cleanerId/document/:documentId` - Delete document

### **Health Check**
- `GET /api/health` - Server status check

---

## 🎨 Key Components

### **Frontend Components**

1. **Dashboard.tsx**
   - Main overview page
   - Statistics cards
   - Dynamic recent activity feed
   - Compliance health monitor
   - Urgent actions panel

2. **OnboardingFlow.tsx**
   - 10-step multi-step form
   - Conditional step rendering
   - File upload handling
   - Form validation
   - PDF generation data storage

3. **CleanerDetail.tsx**
   - Complete staff profile view
   - Editable sections
   - Document viewer modal
   - Verification control panel
   - Employment allocation card integration

4. **CleanersList.tsx**
   - Searchable staff list
   - Status filtering
   - Export functionality
   - Navigation to profiles

5. **EmploymentAllocationCard.tsx**
   - Reusable employment details component
   - Edit mode with form inputs
   - Save/cancel functionality
   - Color-coded status badges

6. **CleanersContext.tsx**
   - Global state management
   - API integration
   - Loading/error states
   - CRUD operations

7. **api.ts**
   - Centralized API client
   - Error handling
   - Network error detection
   - User-friendly error messages

---

## 🔄 Data Flow & State Management

### **State Management Architecture**
```
CleanersContext (Global State)
    ↓
    ├── cleaners: Cleaner[] (all staff data)
    ├── loading: boolean
    ├── error: string | null
    ├── addCleaner()
    ├── updateCleaner()
    ├── deleteCleaner()
    └── refreshCleaners()
```

### **Component Communication**
- **Context API**: Global cleaner data
- **Props**: Component-specific data passing
- **Navigation**: App-level routing via `onNavigate` callback

---

## 📝 Key Features Implementation

### **1. Dynamic Form Steps**
- Steps shown/hidden based on user selections
- UK/Irish citizens skip share code step
- Non-EU citizens see visa type step
- Student visa holders see academic details step

### **2. File Upload System**
- **Base64 encoding** for file storage
- **File validation**: Type and size checks
- **Multiple file types**: Images, PDFs, Documents
- **Passport photo**: Special handling in Step 2
- **Document uploads**: Multiple documents per cleaner

### **3. Validation System**
- **Real-time validation**: Errors shown as user types
- **Step-by-step validation**: Cannot proceed with invalid data
- **Required fields**: All fields including dropdowns
- **Email validation**: Regex pattern matching
- **File validation**: Size and type checks

### **4. PDF Generation**
- **HTML-to-PDF**: Using browser print functionality
- **Complete data**: All form fields included
- **Document listing**: Uploaded files with details
- **Passport photo**: Displayed in PDF header
- **Session storage**: Data persisted for PDF generation

### **5. Document Management**
- **View documents**: Modal viewer for images/PDFs
- **Download documents**: Direct file download
- **Status updates**: Admin can change document status
- **Upload new documents**: Add documents to existing records
- **Base64 storage**: Files stored as Base64 strings

---

## 🚀 Setup & Deployment

### **Prerequisites**
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### **Environment Variables**

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/xpect-portal
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

### **Installation Steps**

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd xpect-portal
   npm install
   # Create .env file
   npm run dev
   ```

3. **MongoDB Setup**
   - Install MongoDB locally OR
   - Use MongoDB Atlas (cloud)
   - Update MONGODB_URI in backend/.env

---

## 🔒 Security & Compliance

### **Data Protection**
- **GDPR Compliance**: Data encryption mentioned in footer
- **Secure Storage**: MongoDB with proper indexing
- **CORS Configuration**: Restricted to frontend URL
- **Input Validation**: Both frontend and backend

### **Error Handling**
- **Network Errors**: User-friendly messages
- **API Errors**: Detailed error responses
- **Validation Errors**: Field-specific error messages
- **Connection Errors**: Backend offline detection

---

## 📊 Current Capabilities

### **What the System Can Do**
✅ Complete onboarding workflow (10 steps)
✅ Staff profile management
✅ Document upload and management
✅ Verification status tracking
✅ Employment allocation management
✅ Compliance reporting
✅ Real-time dashboard statistics
✅ Dynamic activity feed
✅ Search and filter staff
✅ Export staff data
✅ PDF generation
✅ Responsive design

### **Data Persistence**
✅ MongoDB database storage
✅ Real-time data synchronization
✅ Automatic timestamps (createdAt, updatedAt)
✅ Document file storage (Base64)

---

## 🎯 Use Cases

1. **New Staff Onboarding**
   - Employee completes 10-step form
   - Uploads required documents
   - Submits application
   - Receives confirmation

2. **Admin Verification**
   - View pending applications
   - Review uploaded documents
   - Update verification status
   - Add auditor notes

3. **Ongoing Management**
   - Update staff details
   - Manage employment allocation
   - Track document status
   - Generate compliance reports

4. **Compliance Monitoring**
   - View dashboard statistics
   - Monitor recent activity
   - Track verification statuses
   - Export data for reporting

---

## 📈 Future Enhancement Opportunities

- [ ] Authentication & Authorization (User roles)
- [ ] Email notifications
- [ ] Document expiration tracking
- [ ] Advanced search filters
- [ ] Bulk operations
- [ ] Audit log system
- [ ] File storage service (AWS S3, etc.)
- [ ] Real-time notifications
- [ ] Mobile app support
- [ ] Multi-language support

---

## 📚 Documentation Files

- **README.md**: Main project documentation
- **BACKEND_SETUP_GUIDE.md**: Comprehensive backend setup
- **SETUP_INSTRUCTIONS.md**: General setup guide
- **backend/QUICK_START.md**: Quick 5-minute setup
- **backend/README.md**: API documentation
- **FIX_BACKEND_CONNECTION.md**: Troubleshooting guide

---

## 🎨 Design & UI

- **Modern UI**: Clean, professional design
- **Responsive**: Works on desktop, tablet, mobile
- **Tailwind CSS**: Utility-first styling
- **Material Icons**: Consistent iconography
- **Color Scheme**: Blue/gray professional palette
- **Animations**: Smooth transitions and loading states

---

## 🔧 Development Workflow

1. **Backend Development**
   - Express routes handle API requests
   - Mongoose models define data structure
   - Error handling middleware
   - CORS enabled for frontend

2. **Frontend Development**
   - React components for UI
   - TypeScript for type safety
   - Context API for state
   - API service layer for backend communication

3. **Data Flow**
   - User action → Component → Context → API Service → Backend → Database
   - Response flows back through same chain

---

## 📞 Support & Troubleshooting

- **Connection Issues**: See FIX_BACKEND_CONNECTION.md
- **Setup Problems**: See BACKEND_SETUP_GUIDE.md
- **Quick Start**: See backend/QUICK_START.md
- **Health Check**: Visit `/api/health` endpoint

---

## ✨ Summary

**Xpect Portal** is a production-ready, full-stack staff onboarding and management system with:
- Complete onboarding workflow
- Document management
- Real-time dashboard
- Staff profile management
- Compliance tracking
- PDF generation
- Modern, responsive UI
- MongoDB database integration
- RESTful API architecture

The system is designed to handle the complete lifecycle of staff onboarding from initial application through verification and ongoing management.
