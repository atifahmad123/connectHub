import { createDataset } from './createDataset';
export const airUniversity = createDataset({
  id: 'airUniversity', name: 'Air University', shortName: 'Air University', tagline: 'Aerospace & Aviation Campus Kamra', city: 'Kamra', logoInitials: 'AU', fictional: false, supportEmail: 'alumni@air-demo.example',
  branding: { primary: '#0A66C2', primaryHover: '#084FA0', primaryLight: '#EAF1FA', accent: '#44712E' },
  featureFlags: { opportunities: true, mentorship: true, aiMatching: true, advancedAnalytics: true, messaging: false, advancedBranding: true },
  departments: ['Computer Science', 'Software Engineering', 'Business Administration', 'Aerospace Engineering', 'Data Science', 'Electrical Engineering', 'Mechanical Engineering', 'Cyber Security'],
  customProfileFields: [
    { key: 'campus', label: 'Campus', type: 'select', required: true, options: ['Aerospace & Aviation Campus Kamra', 'Islamabad Campus'] },
    { key: 'degreeLevel', label: 'Degree Level', type: 'select', required: true, options: ['Undergraduate', 'Postgraduate', 'Doctoral'] },
  ],
  registration: { evidenceRequired: true, registrationNumberRequired: true, allowedEmailDomains: 'Any email address; graduation evidence is reviewed by the alumni office.' },
  subscription: { planName: 'Professional Demo', status: 'active' },
}, ['Ayesha Nadeem', 'Ahmed Raza', 'Fatima Waseem', 'Hassan Farid', 'Sara Imran', 'Usman Tariq', 'Zainab Kaleem', 'Bilal Hamid', 'Maryam Asif', 'Hamza Aftab', 'Noor Zafar', 'Danish Akram', 'Hira Qureshi', 'Omar Farooq', 'Sana Talat', 'Ali Sarwar', 'Maham Siddiqui', 'Saad Anwar', 'Eman Saleem', 'Fahad Nadeem', 'Rania Ashfaq', 'Sohail Danish', 'Alina Mazhar', 'Taimoor Waqar'], ['Anum Khalid', 'Waleed Ahmed', 'Rida Hassan', 'Talha Javed', 'Laiba Yousaf', 'Shahzaib Nisar', 'Iqra Mahmood', 'Adeel Qazi'], { name: 'Amina Javed', email: 'office@air-demo.example' }, 'air');
