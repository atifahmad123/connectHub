import { Field } from '../ui';
import { useApp } from '../store';
import type { AlumniProfile } from '../types/domain';
import { uid } from '../utils';

export function CustomFields({ values = {} }: { values?: Record<string, string> }) {
  const { config } = useApp();
  return <div className="form-grid">{config.customProfileFields.map(f => <Field key={f.key} label={`${f.label}${f.required ? ' *' : ''}`}>
    {f.type === 'select' ? <select name={`custom-${f.key}`} required={f.required} defaultValue={values[f.key] || ''}><option value="">Select {f.label.toLowerCase()}</option>{f.options?.map(o => <option key={o}>{o}</option>)}</select> : <input name={`custom-${f.key}`} type={f.type} required={f.required} defaultValue={values[f.key] || ''}/>}
  </Field>)}</div>;
}
export function ProfileFields({ profile, registration = false }: { profile?: AlumniProfile; registration?: boolean }) {
  const { config, isEnabled } = useApp();
  return <>
    <h3>Basic information</h3>
    <div className="form-grid"><Field label="Full name"><input name="fullName" autoComplete="name" required defaultValue={profile?.fullName}/></Field><Field label="Email address"><input name="email" type="email" autoComplete="email" required defaultValue={profile?.email}/></Field></div>
    <Field label="Location"><input name="location" placeholder="City or region" defaultValue={profile?.location}/></Field>
    <h3 className="form-section-title">Education</h3>
    <Field label="Registration number"><input name="registrationNumber" required={config.registration.registrationNumberRequired} defaultValue={profile?.registrationNumber}/></Field>
    <div className="form-grid"><Field label="Department"><select name="department" required defaultValue={profile?.department || ''}><option value="">Select department</option>{config.departments.map(d => <option key={d}>{d}</option>)}</select></Field><Field label="Degree program"><input required name="degree" placeholder="e.g. BS Computer Science" defaultValue={profile?.degree}/></Field></div>
    <Field label="Batch / graduation year"><input name="batchYear" type="number" min="1950" max={new Date().getFullYear()} required defaultValue={profile?.batchYear}/></Field>
    <h3 className="form-section-title">Career information</h3>
    <div className="form-grid"><Field label="Current role"><input required name="currentRole" defaultValue={profile?.currentRole}/></Field><Field label="Current company"><input name="currentCompany" defaultValue={profile?.currentCompany}/></Field></div>
    <Field label="Industry"><input required name="industry" defaultValue={profile?.industry} placeholder="e.g. Software, Aviation, Education"/></Field>
    <Field label="Short bio"><textarea required name="bio" rows={3} defaultValue={profile?.bio}/></Field>
    <Field label="Skills (separated by commas)"><input required name="skills" defaultValue={profile?.skills.join(', ')}/></Field>
    {!registration && <><Field label="Experience summary"><textarea name="experience" rows={3} defaultValue={profile?.experience}/></Field><Field label="Professional interests"><input name="interests" defaultValue={profile?.interests}/></Field></>}
    <Field label="LinkedIn URL (optional)"><input name="linkedin" type="url" pattern="https?://.*" defaultValue={profile?.linkedin} placeholder="https://www.linkedin.com/in/…"/></Field>
    <h3 className="form-section-title">University profile fields</h3><CustomFields values={profile?.customFields}/>
    {registration ? <>
      <Field label="Evidence document"><input name="evidence" type="file" accept=".pdf,.png,.jpg,.jpeg" required={config.registration.evidenceRequired && !profile?.evidenceName}/><small>{profile?.evidenceName || 'Degree, transcript, or alumni card.'} Only the filename is kept in this demo. Nothing is uploaded.</small></Field>
      <Field label="Profile photo (optional)"><input name="photo" type="file" accept="image/*"/><small>Photo placeholder only. Your initials will represent you.</small></Field>
      <label className="check-row"><input type="checkbox" required/><span>I acknowledge the privacy notice and consent to university verification of my alumni registration.</span></label>
    </> : <>
      <h3 className="form-section-title">Privacy & availability</h3>
      <label className="check-row"><input name="visible" type="checkbox" defaultChecked={profile?.visible}/><span>Show my profile in the alumni directory</span></label>
      <label className="check-row"><input name="showCompany" type="checkbox" defaultChecked={profile?.showCompany}/><span>Show current company</span></label>
      <Field label="Contact information visible to"><select name="contactVisibility" defaultValue={profile?.contactVisibility}><option value="connections">Connections only</option><option value="verified">All verified alumni</option><option value="hidden">Hidden</option></select></Field>
      {isEnabled('mentorship') && <label className="check-row"><input name="mentorship" type="checkbox" defaultChecked={profile?.isOpenToMentorship}/><span>I'm open to mentoring other alumni</span></label>}
    </>}
  </>;
}
export function readProfile(form: HTMLFormElement, keys: string[], previous?: AlumniProfile, registration = false): AlumniProfile {
  const f = new FormData(form), value = (key: string) => String(f.get(key) || '').trim();
  const evidence = f.get('evidence'), photo = f.get('photo');
  return {
    id: previous?.id || uid(), fullName: value('fullName'), email: value('email'), registrationNumber: value('registrationNumber'),
    department: value('department'), degree: value('degree'), batchYear: Number(f.get('batchYear')), currentRole: value('currentRole'), currentCompany: value('currentCompany'),
    industry: value('industry'), location: value('location'), bio: value('bio'), skills: value('skills').split(',').map(x => x.trim()).filter(Boolean),
    experience: value('experience'), interests: value('interests'), linkedin: value('linkedin'),
    isOpenToMentorship: registration ? false : f.has('mentorship'), visible: registration || f.has('visible'), showCompany: registration || f.has('showCompany'),
    contactVisibility: registration ? 'connections' : value('contactVisibility') as AlumniProfile['contactVisibility'],
    customFields: Object.fromEntries(keys.map(key => [key, value(`custom-${key}`)])), status: previous?.status || 'pending',
    submittedAt: previous?.submittedAt || new Date().toISOString(), joinedAt: previous?.joinedAt,
    evidenceName: evidence instanceof File && evidence.name ? evidence.name : previous?.evidenceName || '',
    photoName: photo instanceof File && photo.name ? photo.name : previous?.photoName,
  };
}
