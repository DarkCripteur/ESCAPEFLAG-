// [TÉLÉPHONE] Dérive l'emoji drapeau à partir d'un code ISO 3166-1 alpha-2, plutôt que
// de stocker ~190 emojis à la main : chaque lettre A-Z a un "regional indicator symbol"
// Unicode dédié (U+1F1E6 = 🇦 pour 'A'), et deux d'entre eux accolés forment le drapeau.
const REGIONAL_INDICATOR_OFFSET = 127397 // 0x1F1E6 - 'A'.charCodeAt(0)

export function countryFlagEmoji(iso2 = '') {
  return iso2
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .map((char) => String.fromCodePoint(REGIONAL_INDICATOR_OFFSET + char.charCodeAt(0)))
    .join('')
}
