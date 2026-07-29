const AUTO_APPLE_KEY = 'dateday.autoAppleCalendar'

/** When true, saving a new date opens Apple Calendar with that event. */
export function getAutoAppleCalendar(): boolean {
  const raw = localStorage.getItem(AUTO_APPLE_KEY)
  if (raw === null) return true
  return raw === '1' || raw === 'true'
}

export function setAutoAppleCalendar(enabled: boolean) {
  localStorage.setItem(AUTO_APPLE_KEY, enabled ? '1' : '0')
}
