import type { Announcement, AlumniProfile, Feature, InstanceConfig } from './types/domain';
export const uid = () => crypto.randomUUID();
export const initials = (value: string) => value.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('');
export const today = () => new Date().toISOString().slice(0, 10);
export const dateOffset = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
export const dateLabel = (value: string) => new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const isFeatureEnabled = (config: InstanceConfig, feature: Feature) => config.featureFlags[feature];
export const announcementStatus = (n: Announcement) => n.publishedAt.slice(0, 10) > today() ? 'Scheduled' : n.expiresAt && n.expiresAt < today() ? 'Expired' : 'Published';
export const isAudience = (n: Announcement, p: AlumniProfile) => (!n.department || n.department === p.department) && (!n.batch || n.batch === String(p.batchYear));
export const featureLabels: Record<Feature, string> = { opportunities: 'Opportunities', mentorship: 'Mentorship', aiMatching: 'AI matching', advancedAnalytics: 'Advanced analytics', messaging: 'Messaging', advancedBranding: 'Advanced branding' };
export function safeExternalUrl(value: string) { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; } }
export function searchScore(p: AlumniProfile, query: string, semantic: boolean) {
  const text = `${p.fullName} ${p.department} ${p.industry} ${p.currentRole} ${p.showCompany ? p.currentCompany : ''} ${p.skills.join(' ')} ${p.bio}`.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  if (text.includes(q)) return 100;
  if (!semantic) return 0;
  const groups = [['digital banking', 'fintech', 'payments', 'financial products'], ['artificial intelligence', 'ai', 'machine learning', 'python'], ['aircraft', 'aviation', 'aerospace', 'flight'], ['website', 'web', 'react', 'frontend'], ['security', 'cyber', 'threat'], ['design', 'ux', 'user research']];
  const expanded = groups.filter(g => g.some(term => q.includes(term))).flat();
  return [...q.split(/\s+/), ...expanded].reduce((score, word) => score + (word.length > 2 && text.includes(word) ? 1 : 0), 0);
}
