
import { Cleaner, EmploymentType, VerificationStatus, DBSStatus } from './types';

export const mockCleaners: Cleaner[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 's.jenkins@example.com',
    phoneNumber: '+44 7700 900123',
    dob: '1992-05-15',
    address: '14 High Street, London, E1 6AN',
    gender: 'Female',
    startDate: '2023-11-15',
    employmentType: EmploymentType.PERMANENT,
    verificationStatus: VerificationStatus.VERIFIED,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces',
    dbsStatus: DBSStatus.CLEARED,
    location: 'London Central',
    onboardingProgress: 100,
    citizenshipStatus: 'UK Citizen',
    workPreference: 'Full-Time',
    declarations: { accuracy: true, rtw: true, approval: true, gdpr: true }
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    phoneNumber: '+44 7700 900456',
    dob: '1995-08-22',
    address: 'Apartment 4B, 22 Quay St, Manchester, M3 3BE',
    gender: 'Male',
    startDate: '2023-11-20',
    employmentType: EmploymentType.CONTRACTOR,
    verificationStatus: VerificationStatus.PENDING,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
    dbsStatus: DBSStatus.AWAITING_DOCS,
    location: 'Manchester South',
    onboardingProgress: 65,
    citizenshipStatus: 'Non-EU Citizen (Visa / BRP holder)',
    visaType: 'Student Visa',
    shareCode: 'AB12CDE34',
    uniName: 'University of Manchester',
    courseName: 'MSc Data Science',
    termStart: '2023-09-01',
    termEnd: '2024-06-30',
    workPreference: 'Part-Time',
    declarations: { accuracy: true, rtw: true, approval: true, gdpr: true }
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'e.rodriguez@example.com',
    phoneNumber: '+44 7700 900789',
    dob: '1990-12-01',
    address: '88 Birmingham Rd, West Bromwich, B70 0RR',
    gender: 'Female',
    startDate: '2023-12-01',
    employmentType: EmploymentType.SUB_CONTRACTOR,
    verificationStatus: VerificationStatus.DOCS_REQUIRED,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces',
    dbsStatus: DBSStatus.NOT_STARTED,
    location: 'Birmingham City',
    onboardingProgress: 30,
    citizenshipStatus: 'EU / EEA Citizen',
    shareCode: 'XY98ZKL12',
    workPreference: 'Full-Time',
    declarations: { accuracy: true, rtw: true, approval: false, gdpr: true }
  }
];

export const recentActivity = [
  {
    id: 1,
    user: 'Sarah Jenkins',
    action: 'successfully completed Level 2 safety induction',
    time: '2 hours ago',
    region: 'London Central',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces'
  },
  {
    id: 2,
    user: 'Michael Chen',
    action: 'uploaded updated Right to Work share code',
    time: '4 hours ago',
    region: 'Manchester South',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces'
  },
  {
    id: 3,
    user: 'Admin (System)',
    action: 'flagged Elena Rodriguez profile for missing DBS details',
    time: '6 hours ago',
    region: 'Birmingham City',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSQk0sFEipIRwTaAkjjUsD5kuVKxS2KOHwV4aqNhlGN0zbEHRVGC9yqLVDRc3PoEo_iUEarU1QqZuH5tdfmnkVF1eVp7lK1bCJje0fE8n8inK7CfbJtYWYpkWfGUxFa3lwI60yGNQFS0u-6gCgfApmbCc56hWcxmMGAw9p5qVHNhg2QOPWf_NP7G_T41oo1zDrLazwUsIedYtwX3yRYdsUoqBaZt-CJ73JiGzZRH9Z-ufeSOnewwmw8h-ytqHKmabp_aYACT7MZTda'
  },
  {
    id: 4,
    user: 'Amara Okafor',
    action: 'submitted final onboarding declaration',
    time: 'Yesterday',
    region: 'Bristol West',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=150&h=150&fit=crop&crop=faces'
  }
];
