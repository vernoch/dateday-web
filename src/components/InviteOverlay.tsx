import { useCouple } from '../context/CoupleContext'
import { InviteAcceptFlow } from './InviteAcceptFlow'
import { InviteWizard } from './InviteWizard'

interface InviteOverlayProps {
  showWizard: boolean
  onCloseWizard: () => void
  onWizardSent: () => void
  onAcceptDone: () => void
}

export function InviteOverlay({
  showWizard,
  onCloseWizard,
  onWizardSent,
  onAcceptDone,
}: InviteOverlayProps) {
  const { incomingInvitation } = useCouple()

  if (incomingInvitation) {
    return <InviteAcceptFlow invitation={incomingInvitation} onDone={onAcceptDone} />
  }

  if (showWizard) {
    return <InviteWizard onClose={onCloseWizard} onSent={onWizardSent} />
  }

  return null
}
