// Registry of every AI agent on the site. `key` matches the backend prompt / specialist type
// (backend/functions/files/src/prompts/*Prompt.js). These are AI personas — the site always
// labels them as AI and never shows invented experience or order counts.

export const AGENT_GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'life', label: 'Life & Love' },
  { id: 'career', label: 'Career & Money' },
  { id: 'wellbeing', label: 'Health & Spirit' },
  { id: 'jyotish', label: 'Jyotish & Remedies' },
]

export const AGENTS = [
  // Flagship guides
  { key: 'va', name: 'Satyaban & Savitri', title: 'Your Virtual Astrologer', avatar: '/agents/va.webp', group: 'jyotish', flagship: true,
    blurb: 'Ask anything about your chart — career, love, timing — and get answers grounded in your own kundli.', voice: true },
  { key: 'jyotish_guru', name: 'Jyotish Guru', title: 'Classical Jyotish, voice-first', avatar: '/agents/jyotish_guru.webp', group: 'jyotish', flagship: true,
    blurb: 'Talks you through dashas, transits and yogas the way a traditional guru would, citing classical rules.', voice: true },
  { key: 'vishwa_jyotishi', name: 'Vishwa Jyotishi', title: 'World events & mundane astrology', avatar: '/agents/vishwa_jyotishi.webp', group: 'jyotish', flagship: true,
    blurb: 'Reads country charts and planetary cycles to explain what the skies say about markets, elections and the world.', voice: true },

  // Specialists
  { key: 'love', name: 'Rahul', title: 'Love, Relationships & Marriage', avatar: '/agents/love.webp', group: 'life' },
  { key: 'marriage_timing', name: 'Sunanda', title: 'Marriage Timing & Kundli Matching', avatar: '/agents/marriage.webp', group: 'life' },
  { key: 'children_parenthood', name: 'Pratibha', title: 'Children, Parenting & Family Planning', avatar: '/agents/family.webp', group: 'life' },
  { key: 'career', name: 'Snigdha', title: 'Career, Jobs & Profession', avatar: '/agents/career.webp', group: 'career' },
  { key: 'business', name: 'Arjun', title: 'Business, Startups & Entrepreneurship', avatar: '/agents/business.webp', group: 'career' },
  { key: 'wealth', name: 'Ravindra', title: 'Wealth, Finance & Investments', avatar: '/agents/wealth.webp', group: 'career' },
  { key: 'property', name: 'Sukhveer', title: 'Property, Real Estate & Vastu', avatar: '/agents/property.webp', group: 'career' },
  { key: 'education', name: 'Saunak', title: 'Education, Admissions & Exams', avatar: '/agents/education.webp', group: 'career' },
  { key: 'travel', name: 'Anil K', title: 'Travel, Visa & Foreign Settlement', avatar: '/agents/travel.webp', group: 'career' },
  { key: 'health', name: 'Vijay', title: 'Health, Wellness & Medical Timing', avatar: '/agents/health.webp', group: 'wellbeing' },
  { key: 'spirituality', name: 'Kavyaa', title: 'Spirituality, Karma & Dharma', avatar: '/agents/spirituality.webp', group: 'wellbeing' },
  { key: 'legal', name: 'Dharmesh Ji', title: 'Legal Disputes & Court Timing', avatar: '/agents/legal.webp', group: 'career' },
  { key: 'numerology_tarot', name: 'Ma Kavita', title: 'Chaldean Numerology & Tarot', avatar: '/agents/tarot.webp', group: 'jyotish' },
  { key: 'pitru_dosha', name: 'Gurudev', title: 'Pitru Dosha & Ancestral Karma', avatar: '/agents/pitru.webp', group: 'jyotish' },
]

export const getAgent = (key) => AGENTS.find((a) => a.key === key)
