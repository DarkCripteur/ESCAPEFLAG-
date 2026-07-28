// [UNDERCOVER] Sélecteur de thème + description (section 6). Réutilisé en mode
// local (le mot est tiré automatiquement au démarrage) et par le distributeur en
// ligne (bouton pour piocher immédiatement une paire à proposer). Purement
// présentationnel : c'est l'appelant qui sait comment résoudre `onPickPair(themeId)`
// en une paire concrète (il a accès aux paires personnalisées).
import { Dices } from 'lucide-react'
import { undercoverThemes } from '../../utils/undercoverThemes'

export function ThemePicker({ themeId, onThemeChange, customCount = 0, onPickPair }) {
  const theme = undercoverThemes.find((item) => item.id === themeId)
  const isCustom = themeId === 'custom'

  return (
    <div className="mb-4">
      <label htmlFor="uc-theme-select">
        Thème
        <select id="uc-theme-select" value={themeId} onChange={(e) => onThemeChange(e.target.value)}>
          {undercoverThemes.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
          <option value="custom">Personnalisé ({customCount} paire{customCount !== 1 ? 's' : ''})</option>
        </select>
      </label>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        {isCustom
          ? 'Pioche parmi les paires que vous avez ajoutées vous-mêmes ci-dessous.'
          : theme?.description}
      </p>
      {onPickPair && (
        <button
          type="button"
          className="secondary small mt-2"
          disabled={isCustom && customCount === 0}
          onClick={() => onPickPair(themeId)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Dices size={14} /> Piocher une paire dans ce thème
        </button>
      )}
    </div>
  )
}
