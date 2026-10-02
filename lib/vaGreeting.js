// Picks the guide's opening message. Server-only use (the chat page renders it), so the
// 11-language table in vaGreetings.js never ships to the browser.
import 'server-only'
import { VA_GREETINGS } from './vaGreetings'

function ageFrom(birthDate) {
  const d = new Date(birthDate)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age -= 1
  return age
}

// Greeting variant by marital status and age. The app checks for 'single', but onboarding saves
// 'unmarried', so unmarried users always got the default there; the web treats them as single.
function greetingKey(maritalStatus, age) {
  if (maritalStatus === 'married' || maritalStatus === 'engaged') return 'married'
  if (!maritalStatus || maritalStatus === 'single' || maritalStatus === 'unmarried') {
    if (age && age < 28) return 'single_young'
    if (age && age >= 28) return 'single_mature'
  }
  return 'default'
}

export function vaGreeting({ language, guide, firstName, maritalStatus, birthDate }) {
  const byLang = VA_GREETINGS[language] || VA_GREETINGS.English
  const variants = byLang[guide] || byLang.savitri
  const text = variants[greetingKey(maritalStatus, birthDate ? ageFrom(birthDate) : null)] || variants.default
  return text.replaceAll('{name}', firstName)
}
