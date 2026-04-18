// Types aligned with server/src/modules/students/student.model.ts

export interface ILink {
  label: string;
  url: string;
}

export interface IRollNoHistory {
  rollNo: string;
  deptId: string;
  courseId: string;
  batch: number;
}

export interface IHostelHistory {
  hostelId: string;
  roomNo: number;
}

export interface IPrivacySettings {
  hiddenFields: string[];
  publicHiddenFields: string[];
  privateHiddenFields: string[];
}

export interface IStudent {
  _id: string;
  fullName: string;
  email: string;
  displayName?: string;
  username?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  bio?: string;
  links: ILink[];
  interests: string[];
  skills: string[];
  currentRollNo?: string;
  currentDeptId?: string;
  currentCourseId?: string;
  currentBatch?: number;
  graduationYear?: number;
  currentHostelId?: string;
  currentRoomNo?: number;
  rollNoHistory: IRollNoHistory[];
  hostelHistory: IHostelHistory[];
  status: 'active' | 'inactive' | 'suspended';
  isOnboarded: boolean;
  accountType: 'public' | 'private';
  privacySettings: IPrivacySettings;
  tokenVersion: number;
  createdAt?: string;
  updatedAt?: string;
}

// Subset for profile update payload (matches updateProfileSchema)
export interface UpdateProfilePayload {
  displayName?: string;
  username?: string;
  bio?: string;
  links?: ILink[];
  interests?: string[];
  skills?: string[];
}

// Subset for hostel update payload (matches updateHostelSchema)
export interface UpdateHostelPayload {
  currentHostelId: string;
  currentRoomNo: number;
}

// Subset for privacy update payload (matches updatePrivacySchema)
export interface UpdatePrivacyPayload {
  accountType?: 'public' | 'private';
  hiddenFields?: string[];
}

// Onboarding payload (matches onboardingSchema)
export interface OnboardingPayload {
  displayName: string;
  username: string;
  accountType?: 'public' | 'private';
  currentHostelId?: string;
  currentRoomNo?: number;
}
