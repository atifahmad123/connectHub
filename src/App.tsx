import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Bell, BriefcaseBusiness, CalendarDays, Check, CircleHelp, FileCheck, GraduationCap, Home, LayoutDashboard, Link2, LogOut, Megaphone, Menu, RotateCcw, ScrollText, Settings as SettingsIcon, TrendingUp, Users, X, type LucideIcon } from 'lucide-react';
import { Avatar, Brand, PageHead } from './ui';
import { Store, useApp } from './store';
import { HomePage, Directory, Connections, Profile, Sessions, Opportunities, Notifications } from './Alumni';
import { AdminDashboard, Approvals, Announcements, Moderation, Analytics, AuditTable, Settings } from './Admin';
import Public from './Public';
import { AccountState, ErrorDemo, FeatureGuard, NotFound, PageLoad, RoleGuard } from './System';
import type { Feature, InstanceId, Role } from './types/domain';
import { instanceSeeds } from './config/instanceSeeds';
import { dateLabel } from './utils';

type NavItem = { path: string; label: string; icon: LucideIcon; feature?: Feature };
const navs: Record<Role, NavItem[]> = {
  alumni: [{ path: 'home', label: 'Home', icon: Home }, { path: 'directory', label: 'Alumni directory', icon: Users }, { path: 'profile', label: 'My profile', icon: GraduationCap }, { path: 'connections', label: 'Connections', icon: Link2 }, { path: 'sessions', label: 'Mentorship sessions', icon: CalendarDays, feature: 'mentorship' }, { path: 'opportunities', label: 'Opportunities', icon: BriefcaseBusiness, feature: 'opportunities' }, { path: 'announcements', label: 'Announcements', icon: Megaphone }, { path: 'notifications', label: 'Notifications', icon: Bell }],
  admin: [{ path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { path: 'approvals', label: 'Pending approvals', icon: FileCheck }, { path: 'announcements', label: 'Announcements', icon: Megaphone }, { path: 'moderation', label: 'Opportunity moderation', icon: BriefcaseBusiness, feature: 'opportunities' }, { path: 'analytics', label: 'Analytics', icon: TrendingUp }, { path: 'audit', label: 'Audit log', icon: ScrollText }, { path: 'settings', label: 'University settings', icon: SettingsIcon }],
};
function PrototypeControls() {
  const s = useApp(), navigate = useNavigate();
  const home = (role = s.state.role) => `/${role}/${role === 'alumni' ? 'home' : 'dashboard'}`;
  return <div className="prototype-bar"><div className="prototype-title"><span className="prototype-dot"/><strong>Prototype Controls</strong><span className="prototype-only">Prototype only</span></div><div className="prototype-selectors">
    <label>Demo instance<select aria-label="Demo instance" value={s.state.activeInstanceId} onChange={e => { s.send({ type: 'SWITCH_INSTANCE', id: e.target.value as InstanceId }); navigate(home()); }}>{Object.values(instanceSeeds).map(d => <option key={d.config.id} value={d.config.id}>{d.config.name}</option>)}</select></label>
    <label>Viewing as<select aria-label="Viewing as" value={s.state.role} onChange={e => { const role = e.target.value as Role; s.send({ type: 'SWITCH_ROLE', role }); navigate(home(role)); }}><option value="alumni">Alumni</option><option value="admin">University Admin</option></select></label>
    {s.state.role === 'alumni' && <label>Persona<select aria-label="Demo alumnus" value={s.userId} onChange={e => { s.send({ type: 'SELECT_ALUMNI', id: e.target.value }); navigate(home()); }}>{s.personas.map(p => <option key={p.id} value={p.id}>{p.fullName}{p.status !== 'approved' ? ` · ${p.status}` : ''}</option>)}</select></label>}
    <button className="prototype-reset" onClick={() => { s.send({ type: 'RESET_DEMO' }, 'Demo state reset for both instances.'); navigate(home()); }}><RotateCcw size={13}/>Reset demo state</button>
  </div><p className="prototype-note">Demo controls only — these do not exist in production deployments.{s.config.fictional ? ' Fictional demonstration institution.' : ' AI results are mocked for UI demonstration.'}<Link to="/error-demo">Preview error state</Link></p></div>;
}
function NotificationBell() {
  const s = useApp(), [open, setOpen] = useState(false);
  return <div className="bell-container"><button className="icon-button bell-button" aria-label="Open notifications" aria-expanded={open} onClick={() => setOpen(!open)}><Bell size={20}/>{s.unread > 0 && <span>{s.unread}</span>}</button>{open && <div className="bell-dropdown card"><div className="section-head"><h3>Notifications</h3><button className="icon-button" aria-label="Close notifications" onClick={() => setOpen(false)}><X size={16}/></button></div>{s.myNotices.slice(0, 3).map(n => <button className={`notification ${!n.read ? 'unread' : ''}`} key={n.id} onClick={() => s.send({ type: 'MARK_READ', id: n.id })}><span><strong>{n.title}</strong><small>{dateLabel(n.date)} · {n.read ? 'Read' : 'Unread'}</small></span></button>)}{!s.myNotices.length && <p className="form-note">No new notifications.</p>}<Link to="/alumni/notifications" className="text-link" onClick={() => setOpen(false)}>View all notifications <ArrowRight size={14}/></Link></div>}</div>;
}
function ApplicationShell() {
  const s = useApp(), [mobile, setMobile] = useState(false), location = useLocation();
  const role = s.state.role, items = navs[role].filter(n => !n.feature || s.isEnabled(n.feature));
  useEffect(() => { setMobile(false); }, [location.pathname]);
  const mobileItems = items.filter(n => (role === 'alumni' ? ['home', 'directory', 'connections', 'notifications'] : ['dashboard', 'approvals', 'announcements']).includes(n.path));
  return <div className={`app-shell ${role}-shell`}><header className="app-header"><button aria-label="Open navigation" aria-expanded={mobile} className="icon-button mobile-menu" onClick={() => setMobile(!mobile)}><Menu/></button><Brand/><span className="header-divider"/><div className="header-context">{s.config.name}<span>{role === 'admin' ? 'University workspace' : s.config.tagline}</span></div><div className="header-actions">{role === 'alumni' && s.me.status === 'approved' && <NotificationBell key={location.pathname}/>}<span className="header-avatar"><Avatar name={role === 'alumni' ? s.me.fullName : s.activeInstance.admin.name}/></span><div className="header-user"><strong>{role === 'alumni' ? s.me.fullName : s.activeInstance.admin.name}</strong><span>{role === 'alumni' ? 'Alumni member' : 'University Admin'}</span></div></div></header>
    {mobile && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setMobile(false)}/>}<aside className={`sidebar ${mobile ? 'open' : ''}`}><div className="sidebar-community"><span className="university-icon">{s.config.logoInitials}</span><div><strong>{s.config.name}</strong><span>{s.config.city} · Alumni community</span></div></div><div className="nav-label">{role === 'alumni' ? 'YOUR COMMUNITY' : 'MANAGE COMMUNITY'}</div><nav aria-label="Main navigation">{items.map(n => <NavLink key={n.path} to={`/${role}/${n.path}`} onClick={() => setMobile(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><n.icon size={19}/><span>{n.label}</span>{n.path === 'notifications' && s.unread > 0 && <b>{s.unread}</b>}{n.path === 'approvals' && s.pending.length > 0 && <b>{s.pending.length}</b>}</NavLink>)}</nav><div className="sidebar-bottom"><div className="sidebar-help"><span><CircleHelp size={18}/> Your university network</span><p>{s.config.supportEmail}</p><Link className="text-link" to={role === 'admin' ? '/admin/announcements' : '/alumni/announcements'}>University updates <ArrowRight size={13}/></Link></div><Link className="nav-item" to="/"><LogOut size={18}/><span>Back to welcome</span></Link><span className="sidebar-copyright">CONNECT-HUB · PROTOTYPE</span></div></aside>
    <main className="app-main" id="main-content"><PageLoad key={location.pathname} kind={location.pathname.includes('analytics') || location.pathname.includes('dashboard') ? 'chart' : /approvals|audit/.test(location.pathname) ? 'table' : 'cards'}><Outlet/></PageLoad><footer className="app-footer"><span>{s.config.name} · Alumni Network</span><span>Connect-Hub · Interactive prototype</span></footer></main>
    <nav className="mobile-bottom" aria-label="Mobile navigation">{mobileItems.map(n => <NavLink key={n.path} to={`/${role}/${n.path}`} className={({ isActive }) => isActive ? 'active' : ''}><n.icon size={19}/><span>{n.path === 'directory' ? 'Directory' : n.path === 'approvals' ? 'Approvals' : n.label}</span></NavLink>)}{role === 'admin' && <button onClick={() => setMobile(!mobile)}><Menu size={19}/><span>More</span></button>}</nav>
  </div>;
}
function Gated({ feature, children }: { feature: Feature; children: ReactNode }) { return <FeatureGuard feature={feature}>{children}</FeatureGuard>; }
function ContentRoutes() {
  return <Routes><Route path="/" element={<Public/>}/><Route path="/login" element={<Public/>}/><Route path="/register" element={<Public/>}/><Route element={<ApplicationShell/>}>
    <Route path="/alumni" element={<RoleGuard role="alumni"><Outlet/></RoleGuard>}><Route index element={<Navigate to="home" replace/>}/><Route path="home" element={<HomePage/>}/><Route path="directory" element={<Directory/>}/><Route path="profile" element={<Profile/>}/><Route path="people/:id" element={<Profile/>}/><Route path="connections" element={<Connections/>}/><Route path="sessions" element={<Gated feature="mentorship"><Sessions/></Gated>}/><Route path="opportunities" element={<Gated feature="opportunities"><Opportunities/></Gated>}/><Route path="announcements" element={<Announcements/>}/><Route path="notifications" element={<Notifications/>}/><Route path="messages" element={<Gated feature="messaging"><NotFound/></Gated>}/></Route>
    <Route path="/admin" element={<RoleGuard role="admin"><Outlet/></RoleGuard>}><Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<AdminDashboard/>}/><Route path="approvals" element={<Approvals/>}/><Route path="announcements" element={<Announcements admin/>}/><Route path="moderation" element={<Gated feature="opportunities"><Moderation/></Gated>}/><Route path="opportunities" element={<Navigate to="/admin/moderation" replace/>}/><Route path="analytics" element={<Analytics/>}/><Route path="audit" element={<><PageHead title="Audit log" description="A read-only record of university administrative decisions."/><AuditTable/></>}/><Route path="audit-log" element={<Navigate to="/admin/audit" replace/>}/><Route path="settings" element={<Settings/>}/></Route>
    {['pending', 'rejected', 'suspended'].map(path => <Route key={path} path={`/${path}`} element={<RoleGuard role="alumni"><AccountState/></RoleGuard>}/>)}
    <Route path="/sessions" element={<Navigate to="/alumni/sessions" replace/>}/><Route path="/opportunities" element={<Navigate to="/alumni/opportunities" replace/>}/><Route path="/app" element={<Navigate to="/alumni/home" replace/>}/><Route path="/app/:section" element={<AppAlias/>}/><Route path="/app/profile/:id" element={<ProfileAlias/>}/><Route path="/error-demo" element={<ErrorDemo/>}/><Route path="*" element={<NotFound/>}/>
  </Route></Routes>;
}
function AppAlias() { const location = useLocation(); const section = location.pathname.split('/')[2]; return <Navigate to={`/alumni/${section}`} replace/>; }
function ProfileAlias() { const location = useLocation(); return <Navigate to={`/alumni/people/${location.pathname.split('/')[3]}`} replace/>; }
function Shell() {
  const s = useApp(), location = useLocation();
  useEffect(() => {
    const b = s.config.branding, root = document.documentElement;
    root.style.setProperty('--instance-primary', b.primary); root.style.setProperty('--instance-primary-hover', b.primaryHover); root.style.setProperty('--instance-primary-light', b.primaryLight); root.style.setProperty('--instance-accent', b.accent);
    document.title = `Connect-Hub · ${s.config.name}`;
  }, [s.config.branding, s.config.name]);
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname, s.state.revision]);
  return <><a className="skip-link" href="#main-content">Skip to content</a><PrototypeControls/><ContentRoutes key={`${s.state.activeInstanceId}-${s.state.role}-${s.userId}-${s.state.revision}`}/>{s.toast && <div className="toast" role="status"><Check size={19}/><span>{s.toast}</span><button aria-label="Dismiss notification" onClick={() => s.notify('')}><X size={16}/></button></div>}</>;
}
export default function App() { return <Store><Shell/></Store>; }
