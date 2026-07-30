export const INVITE_TIMES = [
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
]

export const INVITE_PLANS = [
  { id: 'arcade', label: 'Arcade Night', emoji: '🕹️' },
  { id: 'coffee', label: 'Cozy Coffee', emoji: '☕' },
  { id: 'walk', label: 'Sunset Walk', emoji: '🌅' },
  { id: 'dinner', label: 'Dinner & Movie', emoji: '🎬' },
  { id: 'golf', label: 'Mini Golf', emoji: '⛳' },
  { id: 'surprise', label: 'Surprise Me', emoji: '✨' },
]

export const INVITE_FOODS = [
  { id: 'italian', label: 'Italian', emoji: '🍝' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'ramen', label: 'Ramen', emoji: '🍜' },
  { id: 'brunch', label: 'Brunch', emoji: '🥞' },
  { id: 'dessert', label: 'Dessert First', emoji: '🍰' },
  { id: 'youpick', label: 'You Pick', emoji: '💜' },
]

export function defaultInviteDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toISOString().slice(0, 10)
}
