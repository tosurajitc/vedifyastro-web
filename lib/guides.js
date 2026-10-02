// The two onboarding guides. Every user meets one of them first after login, chosen by the
// opposite gender: Savitri talks with men, Satyaban with everyone else (mobile app: ChatScreen.js).
export const GUIDES = {
  savitri: {
    key: 'savitri',
    name: 'Savitri',
    avatar: '/agents/va_female.webp',
    ttsGender: 'female',
    intro: 'I have read your birth chart. Ask me anything — career, love, timing — and I will answer from your own kundli.',
  },
  satyaban: {
    key: 'satyaban',
    name: 'Satyaban',
    avatar: '/agents/va.webp',
    ttsGender: 'male',
    intro: 'I have read your birth chart. Ask me anything — career, love, timing — and I will answer from your own kundli.',
  },
}

export const guideByKey = (key) => GUIDES[key] || GUIDES.savitri
