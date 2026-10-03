import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, CalendarDays, GraduationCap, Link2, MapPin, Users } from 'lucide-react';
import { Avatar, Button, Empty, Modal, PageHead, Pill } from '../ui';
import { useApp } from '../store';
import { ConnectionButton } from '../Alumni';
import { ProfileFields, readProfile } from '../components/ProfileFields';
import { SessionRequestForm } from './Sessions';
import { safeExternalUrl } from '../utils';

export function Profile() {
  const s = useApp(), { id } = useParams(), [request, setRequest] = useState(false);
  const p = id ? s.people.find(p => p.id === id) : s.me;
  if (!p || (!p.visible && p.id !== s.userId)) return <><Empty title="Profile not available" body="This profile is not visible in the directory."/><Link className="button secondary" to="/alumni/directory">Return to directory</Link></>;
  const own = p.id === s.userId, connected = s.connectionFor(p.id)?.status === 'accepted';
  const contactVisible = own || p.contactVisibility === 'verified' || (p.contactVisibility === 'connections' && connected);
  const canRequest = s.isEnabled('mentorship') && p.isOpenToMentorship && !own;
  return <><PageHead title={own ? 'My profile' : p.fullName} description={own ? 'Keep your experience and interests up to date.' : 'A shared university journey is a good place to start a conversation.'}/>
    <div className="profile-layout"><section className="card profile-detail"><div className="big-profile-cover"><Link2 size={72}/></div><div className="profile-detail-body"><Avatar name={p.fullName} large/><h2>{p.fullName}</h2><p>{p.currentRole}{p.showCompany && p.currentCompany ? ` at ${p.currentCompany}` : ''}</p><p className="muted">{p.department} · Class of {p.batchYear}</p><p className="small muted">{s.config.name}</p>{p.location && <p className="small muted icon-line"><MapPin size={14}/>{p.location}</p>}
      <div className="flex-wrap"><Pill><Users size={13}/>{s.connectionCount(p.id)} connections</Pill>{s.isEnabled('mentorship') && p.isOpenToMentorship && <Pill tone="green">Open to mentorship</Pill>}</div>
      {!own && <div className="form-actions"><ConnectionButton person={p} detail/>{canRequest && <Button onClick={() => setRequest(true)}><CalendarDays size={16}/> Request a session</Button>}</div>}
      <hr/><h3>About</h3><p className="post-body">{p.bio}</p><h3>Skills</h3><div className="flex-wrap">{p.skills.map(skill => <Pill key={skill} tone="neutral">{skill}</Pill>)}</div>
      <h3 className="form-section-title">Experience summary</h3><p className="post-body">{p.experience || 'No experience summary added yet.'}</p>
      <h3>Education</h3><p className="post-body"><GraduationCap size={16}/>{p.degree} · {p.department}<br/>{s.config.name} · {p.batchYear}</p>
      <h3>Industry & professional interests</h3><p className="post-body">{p.industry}<br/>{p.interests || 'Professional interests not added yet.'}</p>
      <h3>Contact & social links</h3><p className="post-body">{contactVisible ? p.email : p.contactVisibility === 'hidden' ? 'Contact information is private.' : 'Contact information is visible to accepted connections.'}</p>
      {contactVisible && safeExternalUrl(p.linkedin) && <a className="text-link" href={safeExternalUrl(p.linkedin)} target="_blank" rel="noreferrer">LinkedIn profile ↗</a>}
      <h3 className="form-section-title">University profile fields</h3><dl className="details-grid">{s.config.customProfileFields.map(f => <div key={f.key}><dt>{f.label}</dt><dd>{p.customFields[f.key] || 'Not provided'}</dd></div>)}</dl>
    </div></section>
    {own ? <form className="card form-card" onSubmit={e => { e.preventDefault(); const profile = readProfile(e.currentTarget, s.config.customProfileFields.map(f => f.key), p); if (!s.isEnabled('mentorship')) profile.isOpenToMentorship = p.isOpenToMentorship; s.send({ type: 'UPDATE_PROFILE', profile }, 'Profile updated.'); }}>
      <ProfileFields profile={p}/><button className="button">Save profile</button>
    </form> : canRequest ? <section className="card small-card align-start"><BookOpen className="blue-icon" size={30}/><h3>Learn from shared experience.</h3><p className="muted">Introduce yourself and suggest a topic for a conversation between alumni.</p><Button onClick={() => setRequest(true)}>Request a session</Button></section> : <section className="card small-card align-start"><Users className="blue-icon" size={30}/><h3>A university connection.</h3><p className="muted">Build your professional network with verified alumni.</p><Link className="text-link" to="/alumni/directory">Explore the directory</Link></section>}
    </div>{request && canRequest && <Modal title={`Request a session with ${p.fullName.split(' ')[0]}`} close={() => setRequest(false)}><SessionRequestForm mentor={p} close={() => setRequest(false)}/></Modal>}
  </>;
}
