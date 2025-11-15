import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { brand, apiBase } from './components/brand'

function Badge({ children }) {
  return (
    <span className="px-3 py-1 rounded-full text-sm" style={{background: '#fff', color: brand.title, border: `1px solid ${brand.accent}`}}>
      {children}
    </span>
  )
}

function Metric({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-semibold" style={{color: brand.title}}>{value}</div>
      <div className="text-sm" style={{color: brand.text}}>{label}</div>
    </div>
  )
}

function Navbar() {
  return (
    <div className="w-full sticky top-0 z-10 backdrop-blur bg-white/50 border-b" style={{borderColor: brand.accent}}>
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
        <Link to="/" className="font-serif text-xl" style={{color: brand.title}}>AstraSafe</Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/quiz" className="underline" style={{color: brand.title}}>Take Quiz</Link>
          <Link to="/directory" className="underline" style={{color: brand.title}}>Explore Places</Link>
          <Link to="/profile" className="rounded-md px-3 py-1" style={{background: brand.title, color: '#fff'}}>Sign In</Link>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  const nav = useNavigate()
  return (
    <div className="pt-16">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-block mb-3"><Badge>Women-Only • Trust-First</Badge></div>
          <h1 className="font-serif leading-tight text-4xl md:text-6xl mb-4" style={{color: brand.title}}>
            Travel Safer. Explore Confidently. Every Trip.
          </h1>
          <p className="text-lg mb-6" style={{color: brand.text}}>✨ Verified by Women. Trusted Worldwide.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => nav('/quiz')} className="px-5 py-3 rounded-md" style={{background: brand.title, color: '#fff'}}>Take Safety Quiz (Free)</button>
            <button onClick={() => nav('/directory')} className="px-5 py-3 rounded-md border" style={{borderColor: brand.accent, color: brand.title}}>Explore Places</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            <Metric value="97%" label="Women Felt More Confident" />
            <Metric value="1,200+" label="Verified Reviews" />
            <Metric value="10+" label="Countries Covered" />
            <Metric value="0" label="Tolerance for Unsafe Listings" />
          </div>
        </div>
        <div className="relative">
          <div className="rounded-xl h-72 md:h-96 border" style={{borderColor: brand.accent, background: '#fff'}} />
          <div className="absolute -bottom-4 -right-4 rounded-xl px-4 py-2 text-sm shadow" style={{background: brand.highlight, color: '#fff'}}>Premium UI • YC-level polish</div>
        </div>
      </div>
    </div>
  )
}

function Directory() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [items, setItems] = useState([])

  async function fetchPlaces() {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (city) params.set('city', city)
    const res = await fetch(`${apiBase}/places?` + params.toString())
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => { fetchPlaces() }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City" className="px-3 py-2 rounded-md border" style={{borderColor: brand.accent}} />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search places/tags" className="px-3 py-2 rounded-md border" style={{borderColor: brand.accent}} />
        <button onClick={fetchPlaces} className="px-4 py-2 rounded-md" style={{background: brand.title, color: '#fff'}}>Search</button>
        <button onClick={async ()=>{ await fetch(`${apiBase}/seed`, {method:'POST'}); fetchPlaces() }} className="px-4 py-2 rounded-md border" style={{borderColor: brand.accent, color: brand.title}}>Load Demo Data</button>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {items.map(p => (
          <div key={p.id} className="rounded-xl p-5 border bg-white" style={{borderColor: brand.accent}}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-serif text-xl" style={{color: brand.title}}>{p.name}</div>
              <div className="text-sm px-2 py-1 rounded-md" style={{background: brand.accent, color: '#2B2B2B'}}>{p.safety_score ?? '—'} ⭐</div>
            </div>
            <div className="text-sm mb-2" style={{color: brand.text}}>{p.city} • {p.type}</div>
            <div className="text-sm mb-3" style={{color: brand.text}}>{p.description}</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(p.main_tags||[]).map(t => <Badge key={t}>{t}</Badge>)}
            </div>
            <Link to={`/place/${p.id}`} className="underline" style={{color: brand.title}}>Read Reviews →</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlaceDetail({ id }) {
  const [place, setPlace] = useState(null)
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ rating: 5, safety_tags: [], comment: '', night_safe: true, harassment: false, user_id: '' })

  async function load() {
    const res = await fetch(`${apiBase}/places?id=${id}`)
    const list = await res.json()
    const p = list.find(x=>x.id===id)
    setPlace(p)
    const r = await fetch(`${apiBase}/places/${id}/reviews`)
    setReviews(await r.json())
  }

  useEffect(()=>{ load() }, [id])

  async function submitReview() {
    const payload = { ...form, rating: Number(form.rating) }
    await fetch(`${apiBase}/places/${id}/reviews`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) })
    await load()
  }

  if (!place) return <div className="max-w-4xl mx-auto px-4 py-10" style={{color: brand.text}}>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-xl p-6 border bg-white mb-6" style={{borderColor: brand.accent}}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-serif text-2xl mb-1" style={{color: brand.title}}>{place.name}</div>
            <div className="text-sm" style={{color: brand.text}}>{place.city} • {place.type}</div>
          </div>
          <div className="text-sm px-3 py-1 rounded-md" style={{background: brand.accent, color: '#2B2B2B'}}>{place.safety_score ?? '—'} ⭐</div>
        </div>
        <p className="mt-4" style={{color: brand.text}}>{place.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">{(place.main_tags||[]).map(t=> <Badge key={t}>{t}</Badge>)}</div>
      </div>

      <div className="rounded-xl p-6 border bg-white mb-6" style={{borderColor: brand.accent}}>
        <div className="font-serif text-xl mb-3" style={{color: brand.title}}>Add Your Review</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="px-3 py-2 rounded-md border" placeholder="Your user ID (or leave blank)" value={form.user_id} onChange={e=>setForm({...form, user_id: e.target.value})} style={{borderColor: brand.accent}} />
          <select className="px-3 py-2 rounded-md border" value={form.rating} onChange={e=>setForm({...form, rating: e.target.value})} style={{borderColor: brand.accent}}>
            {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n} stars</option>)}
          </select>
          <input className="px-3 py-2 rounded-md border" placeholder="Tags (comma separated)" value={form.safety_tags.join(', ')} onChange={e=>setForm({...form, safety_tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} style={{borderColor: brand.accent}} />
          <input className="px-3 py-2 rounded-md border" placeholder="Comment" value={form.comment} onChange={e=>setForm({...form, comment: e.target.value})} style={{borderColor: brand.accent}} />
          <label className="flex items-center gap-2 text-sm" style={{color: brand.text}}>
            <input type="checkbox" checked={form.night_safe} onChange={e=>setForm({...form, night_safe: e.target.checked})} /> Safe at night
          </label>
          <label className="flex items-center gap-2 text-sm" style={{color: brand.text}}>
            <input type="checkbox" checked={form.harassment} onChange={e=>setForm({...form, harassment: e.target.checked})} /> Experienced harassment
          </label>
        </div>
        <button onClick={submitReview} className="mt-3 px-4 py-2 rounded-md" style={{background: brand.title, color: '#fff'}}>Submit Review</button>
      </div>

      <div className="rounded-xl p-6 border bg-white" style={{borderColor: brand.accent}}>
        <div className="font-serif text-xl mb-3" style={{color: brand.title}}>Women’s Reviews</div>
        <div className="space-y-4">
          {reviews.length === 0 && <div className="text-sm" style={{color: brand.text}}>No reviews yet. Be the first.</div>}
          {reviews.map(r => (
            <div key={r.id} className="p-4 rounded-md border" style={{borderColor: brand.accent}}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm" style={{color: brand.text}}>Rating: {r.rating} ⭐</div>
                <div className="text-xs" style={{color: brand.text}}>{new Date(r.created_at).toLocaleString?.() || ''}</div>
              </div>
              <div className="text-sm mb-2" style={{color: brand.text}}>{r.comment}</div>
              <div className="flex flex-wrap gap-2 mb-1">{(r.safety_tags||[]).map(t=> <Badge key={t}>{t}</Badge>)}</div>
              <div className="text-xs" style={{color: brand.text}}>Night safe: {r.night_safe ? 'Yes' : 'No'} • Harassment: {r.harassment ? 'Yes' : 'No'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function useRouteParam() {
  const id = window.location.pathname.split('/').pop()
  return id
}

function PlacePage() {
  const id = useRouteParam()
  return <PlaceDetail id={id} />
}

function Quiz() {
  const [form, setForm] = useState({
    comfort_level: 'medium',
    solo_experience: '0-1',
    night_travel: 'neutral',
    anxiety_triggers: [],
    transport_confidence: 'metro',
  })
  const [result, setResult] = useState(null)

  async function submit() {
    const res = await fetch(`${apiBase}/quiz`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) })
    setResult(await res.json())
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-xl p-6 border bg-white mb-6" style={{borderColor: brand.accent}}>
        <div className="font-serif text-2xl mb-4" style={{color: brand.title}}>Safety Quiz</div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm" style={{color: brand.text}}>Comfort level
            <select className="mt-1 w-full px-3 py-2 rounded-md border" value={form.comfort_level} onChange={e=>setForm({...form, comfort_level: e.target.value})} style={{borderColor: brand.accent}}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="text-sm" style={{color: brand.text}}>Solo travel experience
            <select className="mt-1 w-full px-3 py-2 rounded-md border" value={form.solo_experience} onChange={e=>setForm({...form, solo_experience: e.target.value})} style={{borderColor: brand.accent}}>
              <option value="0-1">0-1</option>
              <option value="2-4">2-4</option>
              <option value="5+">5+</option>
            </select>
          </label>
          <label className="text-sm" style={{color: brand.text}}>Night travel preference
            <select className="mt-1 w-full px-3 py-2 rounded-md border" value={form.night_travel} onChange={e=>setForm({...form, night_travel: e.target.value})} style={{borderColor: brand.accent}}>
              <option value="avoid">Avoid</option>
              <option value="neutral">Neutral</option>
              <option value="comfortable">Comfortable</option>
            </select>
          </label>
          <label className="text-sm" style={{color: brand.text}}>Transport confidence
            <select className="mt-1 w-full px-3 py-2 rounded-md border" value={form.transport_confidence} onChange={e=>setForm({...form, transport_confidence: e.target.value})} style={{borderColor: brand.accent}}>
              <option value="walk">Walk</option>
              <option value="metro">Metro</option>
              <option value="ride-share">Ride-share</option>
            </select>
          </label>
          <label className="text-sm col-span-full" style={{color: brand.text}}>Anxiety triggers
            <input className="mt-1 w-full px-3 py-2 rounded-md border" placeholder="crowds, dark-streets, scams" onChange={e=>setForm({...form, anxiety_triggers: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} style={{borderColor: brand.accent}} />
          </label>
        </div>
        <button onClick={submit} className="mt-4 px-4 py-2 rounded-md" style={{background: brand.title, color: '#fff'}}>See Results</button>
      </div>

      {result && (
        <div className="rounded-xl p-6 border bg-white" style={{borderColor: brand.accent}}>
          <div className="font-serif text-2xl mb-2" style={{color: brand.title}}>Your Persona: {result.persona}</div>
          <div className="mb-3" style={{color: brand.text}}>Recommended safe cities:</div>
          <div className="flex flex-wrap gap-2 mb-4">{result.recommendations.map(c => <Badge key={c}>{c}</Badge>)}</div>
          <div className="flex gap-3">
            <Link to="/profile" className="px-4 py-2 rounded-md" style={{background: brand.title, color: '#fff'}}>Join Community</Link>
            <Link to="/directory" className="px-4 py-2 rounded-md border" style={{borderColor: brand.accent, color: brand.title}}>Explore Places</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Profile() {
  const [form, setForm] = useState({ name: '', email: '', photo: '' })
  const [user, setUser] = useState(null)

  async function signUp() {
    const res = await fetch(`${apiBase}/auth/signup`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) })
    const u = await res.json()
    setUser(u)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {!user ? (
        <div className="rounded-xl p-6 border bg-white" style={{borderColor: brand.accent}}>
          <div className="font-serif text-2xl mb-4" style={{color: brand.title}}>Join AstraSafe</div>
          <div className="grid md:grid-cols-2 gap-3">
            <input className="px-3 py-2 rounded-md border" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} style={{borderColor: brand.accent}} />
            <input className="px-3 py-2 rounded-md border" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} style={{borderColor: brand.accent}} />
            <input className="px-3 py-2 rounded-md border col-span-full" placeholder="Photo URL (optional)" value={form.photo} onChange={e=>setForm({...form, photo: e.target.value})} style={{borderColor: brand.accent}} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={signUp} className="px-4 py-2 rounded-md" style={{background: brand.title, color: '#fff'}}>Create Account</button>
            <button disabled className="px-4 py-2 rounded-md border" title="Coming soon" style={{borderColor: brand.accent, color: brand.title, opacity: 0.7}}>Continue with Google</button>
          </div>
          <div className="mt-6 rounded-md p-4 border" style={{borderColor: brand.accent}}>
            <div className="font-semibold mb-1" style={{color: brand.title}}>Premium (locked)</div>
            <ul className="text-sm list-disc ml-5" style={{color: brand.text}}>
              <li>Community Access ($9.99/month)</li>
              <li>Verified Safety Guides ($29.99/month)</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl p-6 border bg-white" style={{borderColor: brand.accent}}>
            <div className="font-serif text-2xl mb-2" style={{color: brand.title}}>Welcome, {user.name}</div>
            <div className="text-sm" style={{color: brand.text}}>{user.email}</div>
          </div>
          <div className="rounded-xl p-6 border bg-white" style={{borderColor: brand.accent}}>
            <div className="font-serif text-xl mb-2" style={{color: brand.title}}>Saved Places</div>
            <div className="text-sm" style={{color: brand.text}}>Your saved spots will appear here.</div>
          </div>
        </div>
      )}
    </div>
  )
}

function Layout({ children }) {
  return (
    <div style={{background: brand.bg}}>
      <Navbar />
      <main>{children}</main>
      <footer className="mt-16 border-t" style={{borderColor: brand.accent}}>
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm" style={{color: brand.text}}>
          © {new Date().getFullYear()} AstraSafe — Built for women to travel safer.
        </div>
      </footer>
    </div>
  )
}

function HomePage() {
  return (
    <Layout>
      <Hero />
      <section className="mt-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="rounded-xl p-6 border bg-white" style={{borderColor: brand.accent}}>
            <div className="font-serif text-xl mb-2" style={{color: brand.title}}>Curated Safe Places</div>
            <p className="text-sm" style={{color: brand.text}}>Hotels, neighborhoods, restaurants vetted by women.</p>
          </div>
          <div className="rounded-xl p-6 border bg-white" style={{borderColor: brand.accent}}>
            <div className="font-serif text-xl mb-2" style={{color: brand.title}}>Women-Only Reviews</div>
            <p className="text-sm" style={{color: brand.text}}>Real experiences. No tolerance for unsafe listings.</p>
          </div>
          <div className="rounded-xl p-6 border bg-white" style={{borderColor: brand.accent}}>
            <div className="font-serif text-xl mb-2" style={{color: brand.title}}>Lead Magnet Quiz</div>
            <p className="text-sm" style={{color: brand.text}}>Discover your safety persona and ideal cities.</p>
          </div>
        </div>
      </section>
    </Layout>
  )
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
        <Route path="/directory" element={<Layout><Directory /></Layout>} />
        <Route path="/place/:id" element={<Layout><PlacePage /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return <AppRouter />
}
