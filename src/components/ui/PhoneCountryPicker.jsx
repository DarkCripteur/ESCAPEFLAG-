// [TÉLÉPHONE] Sélecteur pays/indicatif international (section 12) : tous les pays,
// tous les indicatifs, drapeaux, recherche, détection automatique du pays si possible.
import { useEffect, useRef, useState } from 'react'
import { countries } from '../../data/countries'
import { countryFlagEmoji } from '../../utils/countryFlag'
import { detectCountryFromLocale } from '../../utils/detectCountry'

// Pays pré-sélectionné par défaut (public principalement africain/sénégalais de
// l'app). La détection par langue du navigateur (utils/detectCountry.js) se trompe
// souvent en pratique — un téléphone réglé en "fr-FR" ne veut pas dire un utilisateur
// en France — donc elle ne sert plus que si elle trouve explicitement un pays de CE
// continent ; sinon ce pays par défaut est utilisé plutôt qu'un pays européen erroné.
// TODO(section 19): pays par défaut à personnaliser si besoin.
const DEFAULT_ISO2 = 'SN'
const AFRICAN_ISO2 = new Set([
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'SZ',
  'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE',
  'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW',
])

export function PhoneCountryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const searchRef = useRef(null)
  const detectedOnceRef = useRef(false)

  // Détection automatique au premier montage uniquement, et seulement si aucun pays
  // n'est déjà sélectionné (on ne veut pas écraser un choix explicite de l'utilisateur).
  useEffect(() => {
    if (detectedOnceRef.current || value) return
    detectedOnceRef.current = true
    const fallback = countries.find((c) => c.iso2 === DEFAULT_ISO2)
    const detected = detectCountryFromLocale(countries)
    onChange(detected && AFRICAN_ISO2.has(detected.iso2) ? detected : fallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    searchRef.current?.focus()
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const filtered = countries.filter((country) => {
    const needle = query.trim().toLowerCase()
    if (!needle) return true
    return country.name.toLowerCase().includes(needle) || country.dialCode.includes(needle)
  })

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="dial-code"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '92px' }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value ? countryFlagEmoji(value.iso2) : '🌐'}</span>
        <span>{value ? value.dialCode : 'Pays'}</span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 20,
            width: '280px', maxHeight: '320px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            background: '#fff', border: '1px solid #ddd9de', borderRadius: '10px', boxShadow: '0 14px 30px rgba(28,24,36,.18)',
          }}
        >
          <input
            ref={searchRef}
            type="text"
            placeholder="Rechercher un pays ou un indicatif…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ margin: '8px', width: 'calc(100% - 16px)', height: '36px', border: '1px solid #ddd9de', borderRadius: '7px', padding: '0 10px', font: 'inherit', fontSize: '13px' }}
          />
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length ? filtered.map((country) => (
              <button
                type="button"
                role="option"
                aria-selected={country.iso2 === value?.iso2}
                key={country.iso2}
                onClick={() => { onChange(country); setOpen(false); setQuery('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 12px',
                  border: 'none', background: country.iso2 === value?.iso2 ? '#f0ebff' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', font: 'inherit', fontSize: '13px',
                }}
              >
                <span style={{ fontSize: '16px' }}>{countryFlagEmoji(country.iso2)}</span>
                <span style={{ flex: 1 }}>{country.name}</span>
                <span style={{ color: '#9a97a6', fontSize: '12px' }}>{country.dialCode}</span>
              </button>
            )) : <p className="empty-players" style={{ padding: '10px 12px' }}>Aucun pays trouvé.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
