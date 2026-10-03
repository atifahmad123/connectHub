export type Role = 'alumni' | 'admin';
export type InstanceId = 'airUniversity' | 'crescentValley';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type FeatureFlags = {
  opportunities: boolean; mentorship: boolean; aiMatching: boolean;
  advancedAnalytics: boolean; messaging: boolean; advancedBranding: boolean;
};
export type Feature = keyof FeatureFlags;
export type CustomFieldDefinition = {
  key: string; label: string; type: 'text' | 'select' | 'number'; required: boolean; options?: string[];
};
export type BrandingConfig = { primary: string; primaryHover: string; primaryLight: string; accent: string };
export type InstanceConfig = {
  id: InstanceId; name: string; shortName: string; tagline: string; city: string;
  logoInitials: string; fictional: boolean; supportEmail: string; branding: BrandingConfig;
  featureFlags: FeatureFlags; customProfileFields: CustomFieldDefinition[]; departments: string[];
  registration: { evidenceRequired: boolean; registrationNumberRequired: boolean; allowedEmailDomains: string };
  subscription: { planName: string; status: 'active' | 'trial' | 'grace' | 'suspended' };
};
export type AlumniProfile = {
  id: string; fullName: string; email: string; registrationNumber: string; department: string;
  degree: string; batchYear: number; currentRole: string; currentCompany: string; industry: string;
  bio: string; skills: string[]; location: string; experience: string; interests: string; linkedin: string;
  isOpenToMentorship: boolean; visible: boolean; showCompany: boolean;
  contactVisibility: 'connections' | 'verified' | 'hidden'; customFields: Record<string, string>;
  status: AccountStatus; joinedAt?: string; submittedAt: string; evidenceName: string; photoName?: string;
  rejectionReason?: string;
};
export type PendingRegistration = AlumniProfile & { status: 'pending' | 'rejected'; duplicateWarning?: string };
export type Opportunity = {
  id: string; postedByAlumniId: string; title: string; company: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Volunteer'; description: string;
  status: 'pending_review' | 'published' | 'rejected'; postedAt: string; location: string;
  applicationLink: string; expiresAt: string; rejectionReason?: string;
};
export type Announcement = {
  id: string; authorName: string; title: string; body: string;
  category: 'Announcement' | 'Event' | 'Seminar' | 'General';
  publishedAt: string; expiresAt?: string; department?: string; batch?: string;
};
export type SessionRequest = {
  id: string; requesterAlumniId: string; mentorAlumniId: string; topic: string; message: string;
  preferredAt: string; requestedAt: string; scheduledAt?: string; meetingLink?: string;
  status: 'pending' | 'accepted' | 'declined' | 'scheduled' | 'completed' | 'cancelled' | 'expired';
  feedback?: Record<string, { rating: number; comment: string }>;
};
export type Connection = { id: string; senderId: string; recipientId: string; status: 'pending' | 'accepted' | 'declined'; createdAt: string };
export type Notice = { id: string; userId: string; title: string; body: string; read: boolean; date: string };
export type AuditAction = 'ALUMNI_APPROVED' | 'ALUMNI_REJECTED' | 'ANNOUNCEMENT_CREATED' | 'OPPORTUNITY_APPROVED' | 'OPPORTUNITY_REJECTED' | 'SETTINGS_UPDATED';
export type Audit = { id: string; actor: string; action: AuditAction; subject: string; details: string; date: string };
export type InstanceDataset = {
  config: InstanceConfig; admin: { name: string; email: string }; alumni: AlumniProfile[];
  pendingRegistrations: PendingRegistration[]; announcements: Announcement[]; opportunities: Opportunity[];
  sessions: SessionRequest[]; connections: Connection[]; notifications: Notice[]; auditLogs: Audit[];
  analytics: { name: string; members: number; active: number; connections: number; views: number; applications: number }[];
};
export type SafeSettings = Pick<InstanceConfig, 'name' | 'tagline' | 'city' | 'supportEmail' | 'logoInitials' | 'registration' | 'customProfileFields'> & { primary: string };
