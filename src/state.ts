import { freshInstances } from './config/instanceSeeds';
import type { AlumniProfile, Announcement, Connection, InstanceDataset, InstanceId, Opportunity, PendingRegistration, Role, SafeSettings, SessionRequest } from './types/domain';
import { announcementStatus, isAudience, safeExternalUrl } from './utils';

export type PrototypeState = {
  instances: Record<InstanceId, InstanceDataset>; activeInstanceId: InstanceId; role: Role;
  selectedAlumni: Record<InstanceId, string>; revision: number;
};
export const initialState = (): PrototypeState => ({
  instances: freshInstances(), activeInstanceId: 'airUniversity', role: 'alumni',
  selectedAlumni: { airUniversity: 'air-1', crescentValley: 'cv-1' }, revision: 0,
});
export type DomainAction =
  | { type: 'SWITCH_INSTANCE'; id: InstanceId }
  | { type: 'SWITCH_ROLE'; role: Role }
  | { type: 'SELECT_ALUMNI'; id: string }
  | { type: 'RESET_DEMO' }
  | { type: 'SUBMIT_REGISTRATION'; profile: PendingRegistration }
  | { type: 'REVIEW_REGISTRATION'; id: string; approve: boolean; reason?: string }
  | { type: 'UPDATE_PROFILE'; profile: AlumniProfile }
  | { type: 'SEND_CONNECTION'; recipientId: string }
  | { type: 'RESPOND_CONNECTION'; id: string; status: Connection['status'] | 'cancelled' }
  | { type: 'REQUEST_SESSION'; session: SessionRequest }
  | { type: 'RESPOND_SESSION'; id: string; status: SessionRequest['status']; scheduledAt?: string; meetingLink?: string }
  | { type: 'SESSION_FEEDBACK'; id: string; rating: number; comment: string }
  | { type: 'SUBMIT_OPPORTUNITY'; opportunity: Opportunity }
  | { type: 'MODERATE_OPPORTUNITY'; id: string; approve: boolean; reason?: string }
  | { type: 'CREATE_ANNOUNCEMENT'; announcement: Announcement }
  | { type: 'MARK_READ'; id?: string }
  | { type: 'UPDATE_SAFE_SETTINGS'; settings: SafeSettings };
export type Action = DomainAction & { meta: { id: string; now: string } };

// UI simulation, not an authentication or production security boundary.
export function prototypeReducer(state: PrototypeState, action: Action): PrototypeState {
  if (action.type === 'SWITCH_INSTANCE') return { ...state, activeInstanceId: action.id, revision: state.revision + 1 };
  if (action.type === 'SWITCH_ROLE') return { ...state, role: action.role, revision: state.revision + 1 };
  if (action.type === 'RESET_DEMO') return { ...initialState(), activeInstanceId: state.activeInstanceId, role: state.role, revision: state.revision + 1 };
  const instanceId = state.activeInstanceId;
  const source = state.instances[instanceId];
  if (action.type === 'SELECT_ALUMNI') {
    if (![...source.alumni, ...source.pendingRegistrations].some(p => p.id === action.id)) return state;
    return { ...state, selectedAlumni: { ...state.selectedAlumni, [instanceId]: action.id }, revision: state.revision + 1 };
  }
  const actorId = state.selectedAlumni[instanceId];
  const me = [...source.alumni, ...source.pendingRegistrations].find(p => p.id === actorId);
  const adminActions = ['REVIEW_REGISTRATION', 'MODERATE_OPPORTUNITY', 'CREATE_ANNOUNCEMENT', 'UPDATE_SAFE_SETTINGS'];
  if (adminActions.includes(action.type) ? state.role !== 'admin' : action.type !== 'SUBMIT_REGISTRATION' && (state.role !== 'alumni' || me?.status !== 'approved')) return state;
  const data = structuredClone(source);
  let selected = actorId;
  let serial = 0;
  const notice = (userId: string, title: string, body: string) => data.notifications.unshift({ id: `${action.meta.id}-n${serial++}`, userId, title, body, read: false, date: action.meta.now });
  const log = (type: InstanceDataset['auditLogs'][number]['action'], subject: string, details: string) => data.auditLogs.unshift({ id: action.meta.id, actor: data.admin.name, action: type, subject, details, date: action.meta.now });
  switch (action.type) {
    case 'SUBMIT_REGISTRATION': {
      const previous = data.pendingRegistrations.find(p => p.id === action.profile.id);
      if (previous && (previous.status !== 'rejected' || previous.id !== actorId)) return state;
      const profile = { ...action.profile, status: 'pending' as const, submittedAt: action.meta.now, rejectionReason: undefined };
      data.pendingRegistrations = [profile, ...data.pendingRegistrations.filter(p => p.id !== profile.id)];
      selected = profile.id;
      break;
    }
    case 'REVIEW_REGISTRATION': {
      const profile = data.pendingRegistrations.find(p => p.id === action.id && p.status === 'pending');
      if (!profile || (!action.approve && !action.reason?.trim())) return state;
      if (action.approve) {
        data.pendingRegistrations = data.pendingRegistrations.filter(p => p.id !== action.id);
        data.alumni.push({ ...profile, status: 'approved', joinedAt: action.meta.now, rejectionReason: undefined });
      } else { profile.status = 'rejected'; profile.rejectionReason = action.reason!.trim(); }
      log(action.approve ? 'ALUMNI_APPROVED' : 'ALUMNI_REJECTED', profile.fullName, action.approve ? 'Graduation evidence reviewed. Membership approved.' : action.reason!.trim());
      notice(profile.id, action.approve ? 'Your registration is approved' : 'Your registration needs attention', action.approve ? 'Welcome to your verified alumni community.' : action.reason!);
      break;
    }
    case 'UPDATE_PROFILE': {
      const profile = data.alumni.find(p => p.id === actorId);
      if (!profile || action.profile.id !== actorId) return state;
      Object.assign(profile, action.profile, { id: profile.id, status: profile.status, joinedAt: profile.joinedAt, submittedAt: profile.submittedAt });
      break;
    }
    case 'SEND_CONNECTION': {
      const recipient = data.alumni.find(p => p.id === action.recipientId && p.status === 'approved' && p.visible);
      if (!recipient || recipient.id === actorId || data.connections.some(c => c.status !== 'declined' && [c.senderId, c.recipientId].includes(actorId) && [c.senderId, c.recipientId].includes(recipient.id))) return state;
      data.connections.unshift({ id: action.meta.id, senderId: actorId, recipientId: recipient.id, status: 'pending', createdAt: action.meta.now });
      notice(recipient.id, 'Connection request received', `${me!.fullName} would like to connect.`);
      break;
    }
    case 'RESPOND_CONNECTION': {
      const c = data.connections.find(c => c.id === action.id && c.status === 'pending');
      if (!c) return state;
      if (action.status === 'cancelled') {
        if (c.senderId !== actorId) return state;
        data.connections = data.connections.filter(x => x.id !== c.id);
      } else {
        if (c.recipientId !== actorId || !['accepted', 'declined'].includes(action.status)) return state;
        c.status = action.status;
        if (c.status === 'accepted') notice(c.senderId, 'Connection accepted', `${me!.fullName} accepted your connection request.`);
      }
      break;
    }
    case 'REQUEST_SESSION': {
      const r = action.session;
      if (!data.config.featureFlags.mentorship || r.requesterAlumniId !== actorId || r.mentorAlumniId === actorId || !data.alumni.some(p => p.id === r.mentorAlumniId && p.status === 'approved' && p.isOpenToMentorship)) return state;
      data.sessions.unshift({ ...r, status: 'pending' });
      notice(r.mentorAlumniId, 'Mentorship request received', `${me!.fullName}: ${r.topic}`);
      break;
    }
    case 'RESPOND_SESSION': {
      const r = data.sessions.find(r => r.id === action.id);
      if (!data.config.featureFlags.mentorship || !r || ![r.mentorAlumniId, r.requesterAlumniId].includes(actorId)) return state;
      const mentor = r.mentorAlumniId === actorId;
      const valid = (mentor && r.status === 'pending' && ['accepted', 'declined'].includes(action.status)) ||
        (mentor && r.status === 'accepted' && action.status === 'scheduled' && action.scheduledAt && action.meetingLink && safeExternalUrl(action.meetingLink)) ||
        (r.status === 'scheduled' && action.status === 'completed') ||
        (['pending', 'accepted', 'scheduled'].includes(r.status) && action.status === 'cancelled');
      if (!valid) return state;
      r.status = action.status;
      if (action.status === 'scheduled') { r.scheduledAt = action.scheduledAt; r.meetingLink = safeExternalUrl(action.meetingLink!); }
      notice(mentor ? r.requesterAlumniId : r.mentorAlumniId, `Mentorship session ${r.status}`, `${r.topic} · ${me!.fullName}`);
      break;
    }
    case 'SESSION_FEEDBACK': {
      const r = data.sessions.find(r => r.id === action.id && r.status === 'completed');
      if (!data.config.featureFlags.mentorship || !r || ![r.requesterAlumniId, r.mentorAlumniId].includes(actorId) || !Number.isInteger(action.rating) || action.rating < 1 || action.rating > 5) return state;
      r.feedback = { ...r.feedback, [actorId]: { rating: action.rating, comment: action.comment } };
      break;
    }
    case 'SUBMIT_OPPORTUNITY': {
      if (!data.config.featureFlags.opportunities || action.opportunity.postedByAlumniId !== actorId || !safeExternalUrl(action.opportunity.applicationLink)) return state;
      data.opportunities.unshift({ ...action.opportunity, status: 'pending_review' });
      break;
    }
    case 'MODERATE_OPPORTUNITY': {
      const job = data.opportunities.find(o => o.id === action.id && o.status === 'pending_review');
      if (!data.config.featureFlags.opportunities || !job || (!action.approve && !action.reason?.trim())) return state;
      job.status = action.approve ? 'published' : 'rejected'; job.rejectionReason = action.approve ? undefined : action.reason!.trim();
      log(action.approve ? 'OPPORTUNITY_APPROVED' : 'OPPORTUNITY_REJECTED', job.title, action.approve ? 'Published to the alumni opportunity board.' : action.reason!);
      notice(job.postedByAlumniId, `Opportunity ${action.approve ? 'approved' : 'rejected'}`, `${job.title}${action.reason ? ': ' + action.reason : ''}`);
      break;
    }
    case 'CREATE_ANNOUNCEMENT': {
      const n = action.announcement;
      data.announcements.unshift(n);
      log('ANNOUNCEMENT_CREATED', n.title, `${announcementStatus(n)} · ${n.department || 'All departments'} · ${n.batch || 'All batches'}`);
      if (announcementStatus(n) === 'Published') data.alumni.filter(p => p.status === 'approved' && isAudience(n, p)).forEach(p => notice(p.id, 'New university announcement', n.title));
      break;
    }
    case 'MARK_READ': data.notifications.forEach(n => { if (n.userId === actorId && (!action.id || n.id === action.id)) n.read = true; }); break;
    case 'UPDATE_SAFE_SETTINGS': {
      const v = action.settings;
      // Explicit allowlist: deployment entitlements and plan metadata cannot be changed here.
      data.config = { ...data.config, name: v.name, tagline: v.tagline, city: v.city, supportEmail: v.supportEmail, logoInitials: v.logoInitials, registration: v.registration, customProfileFields: v.customProfileFields, branding: { ...data.config.branding, primary: v.primary, primaryHover: v.primary } };
      log('SETTINGS_UPDATED', 'University settings', 'University profile, branding, registration, and custom field requirements updated.');
      break;
    }
  }
  return { ...state, instances: { ...state.instances, [instanceId]: data }, selectedAlumni: { ...state.selectedAlumni, [instanceId]: selected }, role: action.type === 'SUBMIT_REGISTRATION' ? 'alumni' : state.role };
}
