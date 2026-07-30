import { uid } from './ids'

const DEVICE_KEY = 'dateday.deviceId'

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = uid()
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}
