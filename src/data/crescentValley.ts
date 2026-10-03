import { createDataset } from './createDataset';
export const crescentValley = createDataset({
  id: 'crescentValley', name: 'Crescent Valley Demo University', shortName: 'Crescent Valley', tagline: 'A community of shared beginnings', city: 'Crescent Valley', logoInitials: 'CV', fictional: true, supportEmail: 'alumni@crescent-demo.example',
  branding: { primary: '#6D436D', primaryHover: '#533153', primaryLight: '#F3EAF3', accent: '#A77936' },
  featureFlags: { opportunities: false, mentorship: false, aiMatching: false, advancedAnalytics: false, messaging: false, advancedBranding: false },
  departments: ['Design & Media', 'Information Systems', 'Commerce', 'Environmental Sciences', 'Public Policy'],
  customProfileFields: [
    { key: 'faculty', label: 'Faculty', type: 'select', required: true, options: ['Arts & Design', 'Technology', 'Social Sciences'] },
    { key: 'chapter', label: 'Alumni Chapter', type: 'text', required: false },
  ],
  registration: { evidenceRequired: true, registrationNumberRequired: true, allowedEmailDomains: 'Any email address; alumni office review required.' },
  subscription: { planName: 'Core Demo', status: 'active' },
}, ['Maira Faisal', 'Dawood Nasir', 'Hania Qasim', 'Rohan Aamir', 'Sabeen Danish', 'Kashif Irfan', 'Yumna Riaz', 'Faraz Noman', 'Areeba Kamal', 'Adnan Wali', 'Nimra Saqib', 'Zeeshan Shakir', 'Aiman Shabbir', 'Fawad Aslam'], ['Zoya Kashan', 'Noman Yasir', 'Hafsa Wajid', 'Arsalan Shahid', 'Mishal Zahid'], { name: 'Haris Naveed', email: 'office@crescent-demo.example' }, 'cv');
