export function publicProfile(profile) {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    avatar: profile.avatar || profile.name.slice(0, 1).toUpperCase(),
    level: profile.level,
    xp: profile.xp,
    streak: profile.streak,
    completed: profile.completed,
    challenges: profile.challenges,
    bestTime: profile.bestTime || profile.best_time,
    country: profile.country,
    countryCode: profile.countryCode || profile.country_code,
    createdAt: profile.createdAt || profile.created_at,
  }
}

export function privateProfile(profile) {
  return { ...publicProfile(profile), role: profile.role }
}

// [ADMIN] Vue complète réservée à la console d'administration (section 10) : inclut
// le statut de bannissement, invisible des autres joueurs.
export function adminProfile(profile) {
  return {
    ...privateProfile(profile),
    banned: profile.banned || false,
    bannedReason: profile.bannedReason || profile.banned_reason || '',
  }
}
