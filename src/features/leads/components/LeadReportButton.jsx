import { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui'
import { saveBlob } from '@/lib/download'
import { errorMessage } from '@/lib/http'
import { leadsApi } from '../api/leadsApi'

/**
 * "Imprimer / PDF": opens the lead file (details + full conversation) in a
 * new tab, ready to print; the arrow downloads it directly.
 */
export function LeadReportButton({ lead, size = 'sm', variant = 'secondary' }) {
  const [busy, setBusy] = useState(null)

  async function open() {
    // Open the tab synchronously so the popup blocker lets it through.
    const tab = window.open('', '_blank')
    setBusy('open')
    try {
      const response = await leadsApi.report(lead.id)
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      if (tab) tab.location.href = url
      else window.location.href = url
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      tab?.close()
      toast.error(errorMessage(error, 'Impossible de générer le PDF.'))
    } finally {
      setBusy(null)
    }
  }

  async function download() {
    setBusy('download')
    try {
      const response = await leadsApi.report(lead.id, { download: true })
      saveBlob(response.data, `fiche-lead-${lead.id}.pdf`, response.headers['content-disposition'])
    } catch (error) {
      toast.error(errorMessage(error, 'Impossible de générer le PDF.'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <span className="inline-flex">
      <Button variant={variant} size={size} icon={Printer} loading={busy === 'open'} onClick={open} className="rounded-r-none">
        Imprimer / PDF
      </Button>
      <Button
        variant={variant}
        size={size}
        icon={Download}
        loading={busy === 'download'}
        onClick={download}
        className="-ml-px rounded-l-none"
        aria-label="Télécharger le PDF"
        title="Télécharger le PDF"
      />
    </span>
  )
}
