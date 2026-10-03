import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useApp } from './store';
import { Button, Pill } from './ui';
import { dateLabel, featureLabels } from './utils';
import type { Feature, Role } from './types/domain';

export function DashboardLink() { const s = useApp(); return <Link className="button" to={s.state.role === 'admin' ? '/admin/dashboard' : '/alumni/home'}>Return to dashboard</Link>; }
export function FeatureUnavailable({ feature }: { feature: Feature }) { return <section className="card system-state"><LockKeyhole size={38}/><Pill tone="neutral">Module unavailable</Pill><h1>{featureLabels[feature]} is not enabled for this university.</h1><p>Available modules are configured for each Connect-Hub deployment.</p><DashboardLink/></section>; }
export function AccessDenied() { return <section className="card system-state"><LockKeyhole size={38}/><Pill tone="gold">Access denied</Pill><h1>You don't have permission to view this page.</h1><p>This area is available to the university role assigned to it.</p><DashboardLink/></section>; }
export function NotFound() { return <section className="card system-state"><span className="error-number">404</span><h1>We couldn't find that page.</h1><p>Return to your community or use the navigation to find what you need.</p><DashboardLink/></section>; }
export function ErrorState({ retry }: { retry: () => void }) { return <section className="card system-state"><AlertCircle size={38}/><h1>Something went wrong.</h1><p>This view couldn't be displayed. Please try again.</p><Button onClick={retry}>Retry</Button></section>; }
export function ErrorDemo() { const [error, setError] = useState(true); return error ? <ErrorState retry={() => setError(false)}/> : <section className="card system-state"><ShieldCheck size={38}/><h1>You're back on track.</h1><p>The demo error state has been cleared.</p><DashboardLink/></section>; }
export function AccountState() {
  const { me, config } = useApp();
  if (me.status === 'approved') return <section className="card system-state"><ShieldCheck size={38}/><h1>Your alumni registration is approved.</h1><p>Welcome to {config.name}.</p><DashboardLink/></section>;
  return <section className="card system-state"><Clock size={38}/><Pill tone={me.status === 'pending' ? 'gold' : 'red'}>{me.status}</Pill>
    <h1>{me.status === 'pending' ? 'Your alumni verification is under review.' : me.status === 'rejected' ? 'Your registration needs an update.' : 'Your account is currently suspended.'}</h1>
    <p><strong>{me.fullName}</strong><br/>{config.name}<br/>Submitted {dateLabel(me.submittedAt)}</p>
    <p>{me.status === 'pending' ? 'The alumni office will review your registration details and evidence. A notification will appear after a decision.' : me.status === 'rejected' ? me.rejectionReason : 'Contact university administration for assistance with your account.'}</p>
    {me.status === 'rejected' && <Link className="button" to="/register?resubmit=1">Edit & resubmit</Link>}
    <span className="small muted">University support: {config.supportEmail}</span>
  </section>;
}
export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) { const s = useApp(); return s.state.role !== role ? <AccessDenied/> : role === 'alumni' && s.me.status !== 'approved' ? <AccountState/> : children; }
export function FeatureGuard({ feature, children }: { feature: Feature; children: ReactNode }) { const s = useApp(); return s.isEnabled(feature) ? children : <FeatureUnavailable feature={feature}/>; }
export function LoadingSkeleton({ kind = 'cards' }: { kind?: 'cards' | 'table' | 'chart' }) { return <div role="status" aria-label="Loading content" className={`loading-skeleton skeleton-${kind}`}><span className="sr-only">Loading content</span><div className="skeleton skeleton-heading"/><div className="skeleton-grid">{Array.from({ length: kind === 'chart' ? 2 : 6 }, (_, i) => <div key={i} className="card skeleton-card"><div className="skeleton skeleton-avatar"/><div className="skeleton"/><div className="skeleton short"/></div>)}</div></div>; }
export function PageLoad({ children, kind }: { children: ReactNode; kind?: 'cards' | 'table' | 'chart' }) { const [loading, setLoading] = useState(true); useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 160); return () => clearTimeout(timer); }, []); return loading ? <LoadingSkeleton kind={kind}/> : children; }
