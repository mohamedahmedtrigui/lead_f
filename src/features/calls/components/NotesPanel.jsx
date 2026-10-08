import { useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { Badge, Button } from '@/components/ui'
import { useAddNote } from '@/features/leads/hooks/useLeads'
import { formatDateTime } from '@/lib/format'
import { errorMessage } from '@/lib/http'

export function NotesPanel({ leadId, notes = [], canWrite = true }) {
  const [body, setBody] = useState('')
  const addNote = useAddNote(leadId)

  async function submit(event) {
    event.preventDefault()
    if (!body.trim()) return
    try {
      await addNote.mutateAsync(body.trim())
      setBody('')
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <div className="space-y-3">
      {canWrite && (
        <form onSubmit={submit} className="space-y-2">
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.stopPropagation()
                submit(e)
              }
            }}
            placeholder="Ajouter une note interne…"
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            maxLength={5000}
          />
          <div className="flex justify-end">
            <Button type="submit" size="xs" variant="soft" icon={Send} loading={addNote.isPending} disabled={!body.trim()}>
              Ajouter
            </Button>
          </div>
        </form>
      )}
      <ul className="space-y-2">
        {notes.length === 0 && <li className="text-xs text-slate-400">Aucune note pour le moment.</li>}
        {notes.map((note) => (
          <li key={note.id} className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="font-medium text-slate-500">{note.author?.full_name ?? '—'}</span>
              <span>{formatDateTime(note.created_at)}</span>
            </div>
            {note.type === 'SUMMARY' && (
              <Badge tone="blue" className="mb-1">
                Résumé d’appel
              </Badge>
            )}
            <p className="whitespace-pre-line text-sm text-slate-700">{note.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
