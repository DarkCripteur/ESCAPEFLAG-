// [TÉLÉPHONE] Détection automatique du pays (section 12 : "si possible") sans appel
// réseau à un service tiers de géolocalisation IP (pas de clé à gérer, pas de latence,
// pas de fuite d'IP vers un tiers) : on lit la région du paramètre de langue du
// navigateur (ex. "fr-SN" -> "SN"), déjà disponible côté client.
export function detectCountryFromLocale(countries) {
  if (typeof navigator === 'undefined') return null
  const locales = navigator.languages?.length ? navigator.languages : [navigator.language]

  for (const locale of locales) {
    const region = locale?.split('-')[1]?.toUpperCase()
    if (!region) continue
    const match = countries.find((country) => country.iso2 === region)
    if (match) return match
  }
  return null
}
