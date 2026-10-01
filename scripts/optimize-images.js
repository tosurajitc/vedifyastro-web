// One-off: convert the app's large PNG avatars into small WebP files for the web.
// Usage: npm run optimize-images  (reads public/agents/*.png, writes the mapped .webp, deletes the .png)
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const DIR = path.join(__dirname, '..', 'public', 'agents')
const MAP = {
  Welcome_Male_Astrologer: 'va',
  jyotish_guru: 'jyotish_guru',
  vishwa_jyotishi: 'vishwa_jyotishi',
  love_expert: 'love',
  marriage_expert: 'marriage',
  family_expert: 'family',
  career_expert: 'career',
  business_enterprenure_expert: 'business',
  wealth_expert: 'wealth',
  property_expert: 'property',
  education_expert: 'education',
  travel_expert: 'travel',
  health_expert: 'health',
  spirituality_expert: 'spirituality',
  legal_expert: 'legal',
  tarrotReader: 'tarot',
  pitu_dosha_expert: 'pitru',
  Welcome_Female_Astrologer: 'va_female',
  Kundli_expert: 'kundli',
  Horoscope_expert: 'horoscope',
  remedy_expert: 'remedy',
}

;(async () => {
  for (const [src, out] of Object.entries(MAP)) {
    const input = path.join(DIR, `${src}.png`)
    if (!fs.existsSync(input)) continue
    const output = path.join(DIR, `${out}.webp`)
    await sharp(input).resize(480, 480, { fit: 'cover', position: 'top' }).webp({ quality: 80 }).toFile(output)
    fs.unlinkSync(input)
    console.log(`${src}.png -> ${out}.webp (${Math.round(fs.statSync(output).size / 1024)} KB)`)
  }
  const logo = path.join(__dirname, '..', 'public', 'brand', 'logo.png')
  if (fs.existsSync(logo)) {
    const out = path.join(__dirname, '..', 'public', 'brand', 'logo.webp')
    await sharp(logo).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 85 }).toFile(out)
    console.log(`logo.png -> logo.webp (${Math.round(fs.statSync(out).size / 1024)} KB)`)
  }
})()
