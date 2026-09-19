/** Los tres formularios de alta del admin (cliente, sistema, versión). */

'use client'

import { useActionState } from 'react'
import { UserPlus, MonitorSmartphone, UploadCloud, Check } from 'lucide-react'
import { createClientAction, createSystemAction, createDownloadAction } from '@/lib/actions/admin-crud'

const inputCls =
  'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-red-500/50 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400'
const btnCls =
  'inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60'

function Msg({ state }) {
  if (state?.success) return <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400"><Check size={15} strokeWidth={2.5} /> {state.message}</p>
  return null
}
function Err({ e }) {
  return e ? <p className="mt-1 text-xs text-red-400">{e[0]}</p> : null
}

function Card({ icon: Icon, title, desc, children }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-white">
        {Icon && <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400"><Icon size={17} strokeWidth={1.75} /></span>}
        {title}
      </h3>
      <p className="mb-5 mt-2 text-sm text-gray-400">{desc}</p>
      {children}
    </div>
  )
}

export default function GestionForms({ clients = [], systems = [] }) {
  const [cState, cAction, cPending] = useActionState(createClientAction, undefined)
  const [sState, sAction, sPending] = useActionState(createSystemAction, undefined)
  const [dState, dAction, dPending] = useActionState(createDownloadAction, undefined)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Nuevo cliente */}
      <Card icon={UserPlus} title="Nuevo cliente" desc="Crea la cuenta de un cliente para que acceda a su portal.">
        <form action={cAction} className="space-y-3">
          <div>
            <label className={labelCls}>Nombre</label>
            <input name="name" className={inputCls} placeholder="Restaurante La Esquina" required />
            <Err e={cState?.errors?.name} />
          </div>
          <div>
            <label className={labelCls}>Correo</label>
            <input name="email" type="email" className={inputCls} placeholder="dueno@restaurante.com" required />
            <Err e={cState?.errors?.email} />
          </div>
          <div>
            <label className={labelCls}>Contraseña temporal</label>
            <input name="password" className={inputCls} placeholder="mínimo 8 caracteres" required />
            <Err e={cState?.errors?.password} />
          </div>
          <div>
            <label className={labelCls}>Plan (opcional)</label>
            <input name="plan" className={inputCls} placeholder="Profesional" />
          </div>
          <button type="submit" className={btnCls} disabled={cPending}>{cPending ? 'Creando…' : 'Crear cliente'}</button>
          <Msg state={cState} />
        </form>
      </Card>

      {/* Nuevo sistema */}
      <Card icon={MonitorSmartphone} title="Nuevo sistema" desc="Registra un sistema para un cliente. Se genera su API key automáticamente.">
        <form action={sAction} className="space-y-3">
          <div>
            <label className={labelCls}>Cliente</label>
            <select name="clientId" className={inputCls} required defaultValue="">
              <option value="" disabled>Selecciona…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Err e={sState?.errors?.clientId} />
          </div>
          <div>
            <label className={labelCls}>Nombre</label>
            <input name="name" className={inputCls} placeholder="POS del Restaurante" required />
            <Err e={sState?.errors?.name} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelCls}>Tipo</label>
              <select name="type" className={inputCls} defaultValue="online">
                <option value="online">Web (online)</option>
                <option value="desktop">Escritorio</option>
              </select>
            </div>
            <div className="w-20">
              <label className={labelCls}>Icono</label>
              <input name="icon" className={inputCls} placeholder="Opcional" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <input name="description" className={inputCls} placeholder="Sistema POS para…" />
          </div>
          <div>
            <label className={labelCls}>URL — online o instalador (según el tipo)</label>
            <input name="externalUrl" className={inputCls} placeholder="Online: https://...onrender.com · Escritorio: .../releases/.../app.zip" />
            <p className="mt-1 text-xs text-gray-500">Online: la dirección del sistema. Escritorio: el enlace de descarga del instalador (ej. GitHub Releases).</p>
          </div>
          <div>
            <label className={labelCls}>Repo de GitHub — opcional</label>
            <input name="gitRepo" className={inputCls} placeholder="https://github.com/usuario/repo" />
          </div>
          <button type="submit" className={btnCls} disabled={sPending}>{sPending ? 'Creando…' : 'Crear sistema'}</button>
          <Msg state={sState} />
        </form>
      </Card>

      {/* Nueva versión / descarga */}
      <Card icon={UploadCloud} title="Publicar versión" desc="Sube una nueva versión descargable. Actualiza el sistema a esa versión.">
        <form action={dAction} className="space-y-3">
          <div>
            <label className={labelCls}>Sistema</label>
            <select name="systemId" className={inputCls} required defaultValue="">
              <option value="" disabled>Selecciona…</option>
              {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Err e={dState?.errors?.systemId} />
          </div>
          <div>
            <label className={labelCls}>Nombre</label>
            <input name="name" className={inputCls} placeholder="POS v2.2.0" required />
            <Err e={dState?.errors?.name} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelCls}>Versión</label>
              <input name="version" className={inputCls} placeholder="2.2.0" required />
              <Err e={dState?.errors?.version} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Tamaño</label>
              <input name="fileSize" className={inputCls} placeholder="64 MB" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Nombre de archivo</label>
            <input name="fileName" className={inputCls} placeholder="pos-v2.2.0.exe" required />
            <Err e={dState?.errors?.fileName} />
          </div>
          <div>
            <label className={labelCls}>Cambios (changelog)</label>
            <textarea name="changelog" rows={3} className={inputCls} placeholder="- Arreglé el pool de conexiones&#10;- Mejoras de velocidad" />
          </div>
          <button type="submit" className={btnCls} disabled={dPending}>{dPending ? 'Publicando…' : 'Publicar versión'}</button>
          <Msg state={dState} />
          <p className="text-xs text-gray-500">Sube el archivo real a <code>data/files/</code> (o GitHub Releases) con ese mismo nombre.</p>
        </form>
      </Card>
    </div>
  )
}
