import React, { useEffect, useMemo, useState, useRef } from 'react'
import './App.css'
import barcodeimg from './assets/barcode.png'

type CardData = {
  firstName: string
  lastName: string
  career: string
  image?: string // data URL
  codigo: string
}

const STORAGE_KEY = 'infocardData'

function useLimaTime() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const formatted = useMemo(() => {
    try {
      const opts: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'America/Lima',
      }
      return new Intl.DateTimeFormat('es-PE', opts).format(time)
    } catch (e) {
      return time.toLocaleTimeString()
    }
  }, [time])
  return formatted
}

function Home({ onOpen }: { onOpen: (data: CardData) => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [career, setCareer] = useState('')
  const [imagePreview, setImagePreview] = useState<string | undefined>()
  const [codigo, setCodigo] = useState('')

  const fileRef = useRef<HTMLInputElement | null>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(String(reader.result))
    }
    reader.readAsDataURL(f)
  }

  function handleOpen() {
    const data: CardData = {
      firstName: firstName.trim() || 'Nombres',
      lastName: lastName.trim() || 'Apellidos',
      career: career.trim() || 'Carrera',
      image: imagePreview,
      codigo: codigo.trim() || 'Código'
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    onOpen(data)
  }

  return (
    <div className="page home-page">
      <h1>Info Card Creator</h1>
      <div className="form-row">
        <label>Nombres</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Apellidos</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Carrera</label>
        <input value={career} onChange={(e) => setCareer(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Foto de perfil</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} />
      </div>
      <div className="form-row">
        <label>Codigo</label>
        <input value={codigo} onChange={(e) => setCodigo(e.target.value)} />
      </div>
      {imagePreview && (
        <div className="preview-row">
          <img src={imagePreview} alt="preview" />
        </div>
      )}
      <div className="actions">
        <button onClick={handleOpen} className="primary">Open Info Card</button>
      </div>
    </div>
  )
}

function InfoCard({ onBack }: { onBack: () => void }) {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  const data: CardData | null = raw ? JSON.parse(raw) : null
  const time = useLimaTime()

  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!data) {
      // nothing
    }
  }, [data])

  async function enterFullScreen() {
    if (!rootRef.current) return
    try {
      if (rootRef.current.requestFullscreen) await rootRef.current.requestFullscreen()
      else if ((rootRef.current as any).webkitRequestFullscreen) await (rootRef.current as any).webkitRequestFullscreen()
    } catch (e) {
      // ignore
    }
  }

  if (!data) {
    return (
      <div className="page">
        <p>No data found. Go back and create a card.</p>
        <button onClick={onBack}>Back</button>
      </div>
    )
  }

  return (
    <div className="page card-page" ref={rootRef}>
      <header className="card-header">
        <button className="back" onClick={onBack}>←</button>
        <h2>Carné Virtual - Pregrado</h2>
      </header>

      <div className="card-body">
        <div className="photo-wrap">
          <div className="photo-frame">
            {data.image ? (
              <img src={data.image} alt="profile" />
            ) : (
              <div className="photo-placeholder">No foto</div>
            )}
          </div>
        </div>

        <div className="clock-wrap">
        </div>
          <div className="clock-box">{time.slice(0, 8)} <br/> {time.slice(8)}</div>

        <div className="info-list">
          <div className="column"><div className="label">Nombres</div><div className="value">{data.firstName.toUpperCase()}</div></div>
          <div className="column"><div className="label">Apellidos</div><div className="value">{data.lastName.toUpperCase()}</div></div>
          <div className="column"><div className="label">Carrera</div><div className="value">{data.career.toUpperCase()}</div></div>
        </div>

        <div className="column barcode-wrap">
              <img src={barcodeimg} alt="barcode" />
              <div className="value">{data.codigo}</div>
        </div>

        <div className="card-actions">
          <button onClick={enterFullScreen}>Expand Fullscreen</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash || '#/')

  useEffect(() => {
    function onHash() {
      setRoute(window.location.hash || '#/')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function openCard() {
    window.location.hash = '#/card'
  }

  function goHome() {
    window.location.hash = '#/'
  }

  return (
    <div className="app-root">
      {route === '#/card' ? <InfoCard onBack={goHome} /> : <Home onOpen={openCard} />}
    </div>
  )
}
