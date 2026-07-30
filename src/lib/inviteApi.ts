import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { ensureAnonAuth, getFirebase, isFirebaseConfigured } from './firebase'
import { getDeviceId } from './deviceId'
import { uid } from './ids'
import {
  combineDateAndTime,
  invitationToEventNotes,
  invitationToEventTitle,
} from './inviteUtils'
import { newEventDraft, upsertEvent, type AppMode } from './coupleApi'
import type { DateInvitation, InviteDraft, InviteStatus } from './types'

const INVITE_DOC_ID = 'current'

function inviteRef(code: string) {
  const { db } = getFirebase()
  return doc(db, 'couples', code, 'invitations', INVITE_DOC_ID)
}

function normalizeInvitation(raw: Partial<DateInvitation> & { id?: string }): DateInvitation {
  const now = new Date().toISOString()
  return {
    id: raw.id ?? INVITE_DOC_ID,
    status: raw.status ?? 'pending',
    senderDeviceId: raw.senderDeviceId ?? '',
    date: raw.date ?? now.slice(0, 10),
    time: raw.time ?? '18:00',
    plan: raw.plan ?? '',
    food: raw.food ?? '',
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
    respondedAt: raw.respondedAt,
    eventId: raw.eventId,
  }
}

export function subscribeInvitation(
  code: string,
  mode: AppMode,
  onData: (invitation: DateInvitation | null) => void,
  onError: (message: string) => void,
): Unsubscribe | (() => void) {
  if (mode === 'local' || !isFirebaseConfigured) {
    onData(null)
    return () => {}
  }

  let unsub: Unsubscribe | null = null
  let cancelled = false

  void ensureAnonAuth()
    .then(() => {
      if (cancelled) return
      unsub = onSnapshot(
        inviteRef(code),
        (snap) => {
          if (!snap.exists()) {
            onData(null)
            return
          }
          onData(normalizeInvitation({ id: snap.id, ...(snap.data() as Partial<DateInvitation>) }))
        },
        (err) => onError(err.message),
      )
    })
    .catch((err) => {
      onError(err instanceof Error ? err.message : 'Pozvánku se nepodařilo načíst.')
    })

  return () => {
    cancelled = true
    unsub?.()
  }
}

export async function sendInvitation(code: string, draft: InviteDraft): Promise<DateInvitation> {
  if (!isFirebaseConfigured) {
    throw new Error('Pozvánka vyžaduje cloud sync — nejdřív propoj pár.')
  }
  await ensureAnonAuth()
  const now = new Date().toISOString()
  const invitation: DateInvitation = {
    id: INVITE_DOC_ID,
    status: 'pending',
    senderDeviceId: getDeviceId(),
    date: draft.date,
    time: draft.time,
    plan: draft.plan,
    food: draft.food,
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(inviteRef(code), invitation)
  return invitation
}

export async function respondInvitation(
  code: string,
  mode: AppMode,
  invitation: DateInvitation,
  status: Exclude<InviteStatus, 'pending'>,
): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Cloud sync není dostupný.')
  }
  await ensureAnonAuth()
  const now = new Date().toISOString()
  let eventId = invitation.eventId

  if (status === 'accepted') {
    eventId = uid()
    const event = newEventDraft({
      id: eventId,
      title: invitationToEventTitle(invitation),
      date: combineDateAndTime(invitation.date, invitation.time),
      notes: invitationToEventNotes(invitation),
      createdAt: now,
      updatedAt: now,
    })
    await upsertEvent(code, mode, event)
  }

  await setDoc(inviteRef(code), {
    status,
    updatedAt: now,
    respondedAt: now,
    ...(eventId ? { eventId } : {}),
  }, { merge: true })
}

export function isInvitationSender(invitation: DateInvitation): boolean {
  return invitation.senderDeviceId === getDeviceId()
}
