import type { AlumniProfile, InstanceConfig, InstanceDataset, PendingRegistration, SessionRequest } from '../types/domain';
import { dateOffset } from '../utils';

type Career = [string, string, string, string];
const careers: Career[] = [
  ['UX Designer', 'Paperkite Studio', 'Software', 'Design systems,User research,Figma'],
  ['Senior Software Engineer', 'Cedarbyte Labs', 'Software', 'React,TypeScript,Cloud'],
  ['Fintech Product Manager', 'Riverpay Demo', 'Fintech', 'Payments,Financial products,Analytics'],
  ['Aviation Engineer', 'Wingline Research', 'Aviation', 'Flight dynamics,CAD,Simulation'],
  ['Data Analyst', 'Signalbrook', 'Consulting', 'Python,SQL,Statistics'],
  ['Embedded Systems Lead', 'Copperleaf Systems', 'Telecommunications', 'Embedded C,IoT,Electronics'],
  ['Finance Manager', 'Oakpath Advisory', 'Fintech', 'Financial modeling,Research,Excel'],
  ['Frontend Engineer', 'Juniper Software', 'E-commerce', 'React,Accessibility,CSS'],
  ['Project Manager', 'Northvale Engineering', 'Government', 'Planning,Operations,Delivery'],
  ['Founder', 'Seedwell Labs', 'Startups', 'Leadership,Startups,Engineering'],
  ['Lecturer', 'Elm Research Institute', 'Education', 'Teaching,Research,Python'],
  ['Cyber Security Engineer', 'Safebranch', 'Cyber Security', 'Threat analysis,Networks,Security'],
  ['DevOps Engineer', 'Cloudfern', 'Software', 'Linux,Containers,Automation'],
  ['AI Engineer', 'Mosaic Research', 'Software', 'Machine learning,Python,AI'],
];

// Called independently by each deployment fixture. No domain record carries a deployment key.
export function createDataset(config: InstanceConfig, names: string[], applicants: string[], admin: InstanceDataset['admin'], prefix: string): InstanceDataset {
  function person(name: string, index: number): AlumniProfile {
    const career = careers[index % careers.length];
    return {
      id: `${prefix}-${index + 1}`, fullName: name, email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`,
      registrationNumber: `${config.logoInitials}-${2014 + index % 12}-${String(index + 101).padStart(4, '0')}`,
      department: config.departments[index % config.departments.length], degree: index % 5 === 0 ? 'MS' : 'BS',
      batchYear: 2014 + index % 12, currentRole: career[0], currentCompany: career[1], industry: career[2],
      skills: career[3].split(','), bio: `I work in ${career[2].toLowerCase()}, with a focus on ${career[3].split(',').slice(0, 2).join(' and ')}. I enjoy exchanging practical ideas with fellow graduates and sharing lessons from my career.`,
      location: ['Islamabad', 'Lahore', 'Karachi', 'Kamra', 'Remote'][index % 5],
      experience: `${2 + index % 9} years working across ${career[2].toLowerCase()} projects, from delivery to team collaboration.`,
      interests: ['Career development, Research', 'Product strategy, Community', 'Engineering, Professional growth'][index % 3], linkedin: '',
      isOpenToMentorship: index % 3 !== 2, visible: true, showCompany: index % 7 !== 6,
      contactVisibility: index % 4 === 3 ? 'hidden' : 'connections',
      customFields: Object.fromEntries(config.customProfileFields.map(f => [f.key, f.options?.[index % f.options.length] ?? 'Local chapter'])),
      status: 'approved', joinedAt: dateOffset(-index * 3), submittedAt: dateOffset(-index * 3 - 2), evidenceName: 'Illustrative graduation certificate.pdf',
    };
  }
  const alumni = names.map(person);
  const suspended = person(prefix === 'air' ? 'Nabeel Sarmad' : 'Rameez Farhan', names.length);
  suspended.status = 'suspended';
  alumni.push(suspended);
  const pendingRegistrations: PendingRegistration[] = applicants.map((name, i) => ({
    ...person(name, names.length + i + 1), status: 'pending', submittedAt: dateOffset(-i % 5), joinedAt: undefined,
    duplicateWarning: i === 1 ? 'A similar registration number exists. Compare the evidence before deciding.' : undefined,
  }));
  pendingRegistrations.push({ ...person(prefix === 'air' ? 'Sidra Zeeshan' : 'Huma Adeel', 70), status: 'rejected', joinedAt: undefined, rejectionReason: 'Incomplete evidence. Please attach a graduation certificate showing your registration number.' });
  const connections: InstanceDataset['connections'] = [
    { id: `${prefix}-c1`, senderId: alumni[0].id, recipientId: alumni[2].id, status: 'accepted', createdAt: dateOffset(-10) },
    { id: `${prefix}-c2`, senderId: alumni[4].id, recipientId: alumni[0].id, status: 'accepted', createdAt: dateOffset(-7) },
    { id: `${prefix}-c3`, senderId: alumni[5].id, recipientId: alumni[0].id, status: 'pending', createdAt: dateOffset(-1) },
    { id: `${prefix}-c4`, senderId: alumni[0].id, recipientId: alumni[6].id, status: 'pending', createdAt: dateOffset(-2) },
    { id: `${prefix}-c5`, senderId: alumni[7].id, recipientId: alumni[1].id, status: 'pending', createdAt: dateOffset(-1) },
  ];
  const titles = config.fictional ? ['Crescent alumni: a new chapter together', 'Design and media alumni roundtable', 'Community research showcase', 'Stay connected to your faculty', 'Valley chapter welcome evening', 'A note from the Crescent alumni office'] : ['Alumni homecoming: return to your campus', 'Graduate career conversations', 'Research and industry seminar', 'Update your professional profile', 'Department alumni roundtable', 'Welcome to the alumni community', 'Regional alumni gathering', 'Alumni office contact hours', 'A conversation with alumni founders', 'Community highlights'];
  const announcements: InstanceDataset['announcements'] = titles.slice(0, config.fictional ? 6 : 10).map((title, i) => ({
    id: `${prefix}-announcement-${i}`, authorName: `${config.shortName} Alumni Office`, title,
    body: `${config.shortName} invites its alumni to stay involved with their university community. ${['Meet fellow graduates, exchange career experiences, and reconnect with your department. Event details will be shared by the alumni office.', 'Join an alumni-led discussion on professional growth and practical lessons from industry.', 'Share your current expertise and location so fellow alumni can find relevant connections.'][i % 3]}`,
    category: (['Event', 'Announcement', 'Seminar', 'General'] as const)[i % 4], publishedAt: dateOffset(i === 4 ? 5 : -i),
    expiresAt: dateOffset(i === 5 ? -1 : 40), department: i === 3 ? config.departments[0] : '',
  }));
  const opportunities: InstanceDataset['opportunities'] = config.featureFlags.opportunities ? Array.from({ length: 10 }, (_, i) => ({
    id: `${prefix}-job-${i}`, postedByAlumniId: alumni[i + 1].id, title: careers[i][0], company: careers[i][1],
    type: (['Full-time', 'Internship', 'Part-time', 'Volunteer'] as const)[i % 4], location: ['Islamabad · Hybrid', 'Lahore · On-site', 'Remote'][i % 3],
    description: `Work with a collaborative ${careers[i][2].toLowerCase()} team. This illustrative role values ${careers[i][3].split(',').join(', ')} and clear communication. Shared by an alumnus for university review.`,
    status: i < 7 ? 'published' : 'pending_review', postedAt: dateOffset(-i), expiresAt: dateOffset(20 + i), applicationLink: 'https://example.com/careers',
  })) : [];
  const sessionStatuses: SessionRequest['status'][] = ['pending', 'accepted', 'scheduled', 'completed', 'declined', 'cancelled', 'expired', 'pending', 'scheduled', 'completed'];
  const sessions: SessionRequest[] = config.featureFlags.mentorship ? sessionStatuses.map((status, i) => ({
    id: `${prefix}-session-${i}`, requesterAlumniId: i < 7 ? alumni[0].id : alumni[i + 1].id,
    mentorAlumniId: i < 7 ? alumni[[1, 3, 4, 6, 7, 9, 10][i]].id : alumni[0].id,
    topic: ['Career transition', 'Technical interview preparation', 'Research direction', 'Leadership and collaboration'][i % 4],
    message: 'I would appreciate a 30-minute conversation about your experience and practical next steps in this field.',
    preferredAt: `${dateOffset(5)}T15:00`, requestedAt: dateOffset(-4), status,
    scheduledAt: ['scheduled', 'completed'].includes(status) ? `${dateOffset(status === 'completed' ? -1 : 3)}T15:00` : undefined,
    meetingLink: ['scheduled', 'completed'].includes(status) ? 'https://example.com/demo-meeting' : undefined,
  })) : [];
  return {
    config, admin, alumni, pendingRegistrations, announcements, opportunities, sessions, connections,
    notifications: alumni.flatMap(p => [
      { id: `${p.id}-welcome`, userId: p.id, title: 'Welcome to your alumni network', body: `Discover verified graduates from ${config.shortName}.`, read: false, date: dateOffset(-1) },
      { id: `${p.id}-profile`, userId: p.id, title: 'Keep your profile current', body: 'Your skills and professional interests help fellow alumni find you.', read: true, date: dateOffset(-2) },
    ]).concat(connections.filter(c => c.status === 'pending').map(c => ({ id: `${c.id}-notice`, userId: c.recipientId, title: 'Connection request received', body: `${alumni.find(p => p.id === c.senderId)!.fullName} would like to connect.`, read: false, date: c.createdAt }))),
    auditLogs: [
      { id: `${prefix}-audit-1`, actor: admin.name, action: 'ALUMNI_APPROVED', subject: alumni[0].fullName, details: 'Graduation evidence reviewed. Membership approved.', date: `${dateOffset(-1)}T10:42:00` },
      { id: `${prefix}-audit-2`, actor: admin.name, action: 'ANNOUNCEMENT_CREATED', subject: announcements[0].title, details: 'Published to all verified alumni.', date: `${dateOffset(-2)}T09:15:00` },
    ],
    analytics: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((name, i) => ({ name, members: (config.fictional ? 1 : 2) + i % 3, active: (config.fictional ? 5 : 12) + i * 2, connections: 3 + i * 4, views: 12 + i * 9, applications: 2 + i * 3 })),
  };
}
