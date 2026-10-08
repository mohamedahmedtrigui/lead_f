import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'
import { Button, Input, Modal } from '@/components/ui'

const ConfirmContext = createContext(null)

/**
 * App-wide confirmation popup.
 *
 *   const confirm = useConfirm()
 *   if (!(await confirm({ title, description, confirmLabel, tone: 'danger' }))) return
 *
 * `typeToConfirm: 'SUPPRIMER'` requires the user to type the word.
 */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const [typed, setTyped] = useState('')
  const resolver = useRef(null)

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve
        setTyped('')
        setRequest(options)
      }),
    [],
  )

  const close = (result) => {
    resolver.current?.(result)
    resolver.current = null
    setRequest(null)
  }

  const danger = request?.tone === 'danger'
  const blocked = request?.typeToConfirm && typed.trim().toUpperCase() !== request.typeToConfirm

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <Modal
          open
          size="sm"
          onClose={() => close(false)}
          title={request.title}
          footer={
            <>
              <Button variant="secondary" onClick={() => close(false)}>
                {request.cancelLabel ?? 'Annuler'}
              </Button>
              <Button variant={danger ? 'danger' : 'primary'} disabled={blocked} onClick={() => close(true)} data-autofocus>
                {request.confirmLabel ?? 'Confirmer'}
              </Button>
            </>
          }
        >
          <div className="flex gap-3">
            <span className={danger ? 'h-fit rounded-full bg-rose-50 p-2 text-rose-600' : 'h-fit rounded-full bg-brand-50 p-2 text-brand-600'}>
              {danger ? <AlertTriangle className="size-5" /> : <HelpCircle className="size-5" />}
            </span>
            <div className="min-w-0 flex-1 space-y-3 text-sm text-slate-600">
              {request.description && <div>{request.description}</div>}
              {request.typeToConfirm && (
                <Input
                  label={`Tapez ${request.typeToConfirm} pour confirmer`}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                />
              )}
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return confirm
}
