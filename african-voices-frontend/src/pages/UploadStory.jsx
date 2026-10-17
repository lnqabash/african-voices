import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { storiesApi } from '../api/storiesApi'
import { Upload, Music, CheckCircle, AlertCircle, X } from 'lucide-react'

const LANGUAGES = [
  'English', 'Swahili', 'Zulu', 'Xhosa', 'Afrikaans', 'Amharic',
  'Hausa', 'Yoruba', 'Igbo', 'Somali', 'Arabic', 'French', 'Portuguese',
  'Shona', 'Sesotho', 'Setswana', 'Ndebele', 'Venda', 'Tsonga', 'Other',
]

const REGIONS = [
  'East Africa', 'West Africa', 'Southern Africa', 'North Africa',
  'Central Africa', 'Horn of Africa', 'Great Lakes Region',
  'Sahel Region', 'Coastal Africa', 'Other',
]

const CATEGORIES = [
  'Folklore', 'History', 'Music', 'Proverbs', 'Mythology',
  'Traditional Ceremony', 'Community Story', 'Oral Poetry',
  'Creation Story', 'Ancestral Wisdom', 'Other',
]

function Field({ label, required, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-stone-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
        <AlertCircle className="w-4 h-4" aria-hidden="true" />{error}
      </p>}
    </div>
  )
}

export default function UploadStory() {
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    title: '', description: '', language: '', region: '',
    category: '', contributorName: '', contributorEmail: '', tags: '',
  })
  const [audioFile, setAudioFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (!form.language) e.language = 'Language is required.'
    if (!form.region) e.region = 'Region is required.'
    if (!form.category) e.category = 'Category is required.'
    if (!audioFile) e.audioFile = 'Please select an audio file.'
    if (form.contributorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contributorEmail))
      e.contributorEmail = 'Enter a valid email address.'
    return e
  }

  const handleFile = (file) => {
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
      'audio/flac', 'audio/aac', 'audio/webm', 'video/webm', 'audio/x-m4a']
    if (!allowed.includes(file.type)) {
      setErrors((e) => ({ ...e, audioFile: 'Unsupported format. Use MP3, WAV, OGG, M4A, FLAC or AAC.' }))
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      setErrors((e) => ({ ...e, audioFile: 'File must be under 100 MB.' }))
      return
    }
    setAudioFile(file)
    setErrors((e) => { const n = { ...e }; delete n.audioFile; return n })
  }

  const onDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)
    setServerError(null)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    fd.append('audioFile', audioFile)

    try {
      const created = await storiesApi.create(fd)
      setSuccess(true)
      setTimeout(() => navigate(`/stories/${created.id}`), 1500)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Story uploaded!</h1>
        <p className="text-stone-500">Redirecting to your story…</p>
      </div>
    )
  }

  const inputCls = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-stone-800 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors[field] ? 'border-red-400 bg-red-50' : 'border-stone-200 hover:border-stone-300'}`

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Share Your Story</h1>
        <p className="text-stone-500 mt-2">
          Upload an audio recording and preserve it in the African Voices archive.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Audio file drop zone */}
        <Field label="Audio File" required error={errors.audioFile} htmlFor="audioFile">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
              ${errors.audioFile ? 'border-red-300 bg-red-50' : 'border-stone-300 hover:border-orange-400 bg-stone-50 hover:bg-orange-50'}`}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            aria-label="Click or drag to upload audio file"
          >
            <input
              id="audioFile"
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />
            {audioFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-green-600" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-stone-800 text-sm">{audioFile.name}</p>
                  <p className="text-stone-500 text-xs">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button
                  type="button"
                  className="ml-2 p-1 text-stone-400 hover:text-red-500 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setAudioFile(null) }}
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-stone-600 font-medium text-sm">Drop audio here or click to browse</p>
                <p className="text-stone-400 text-xs mt-1">MP3, WAV, OGG, M4A, FLAC, AAC — max 100 MB</p>
              </>
            )}
          </div>
        </Field>

        {/* Title */}
        <Field label="Story Title" required error={errors.title} htmlFor="title">
          <input id="title" type="text" value={form.title} onChange={set('title')}
            className={inputCls('title')} placeholder="e.g., The Legend of Sundiata Keita" />
        </Field>

        {/* Description */}
        <Field label="Description" error={errors.description} htmlFor="description">
          <textarea id="description" rows={3} value={form.description} onChange={set('description')}
            className={`${inputCls('description')} resize-none`}
            placeholder="Brief description of this story…" />
        </Field>

        {/* Language / Region / Category */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Language" required error={errors.language} htmlFor="language">
            <select id="language" value={form.language} onChange={set('language')} className={inputCls('language')}>
              <option value="">Select…</option>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>

          <Field label="Region" required error={errors.region} htmlFor="region">
            <select id="region" value={form.region} onChange={set('region')} className={inputCls('region')}>
              <option value="">Select…</option>
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>

          <Field label="Category" required error={errors.category} htmlFor="category">
            <select id="category" value={form.category} onChange={set('category')} className={inputCls('category')}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        {/* Contributor info */}
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <h2 className="font-semibold text-amber-900 text-sm mb-4">Contributor Information (optional)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your Name" htmlFor="contributorName">
              <input id="contributorName" type="text" value={form.contributorName} onChange={set('contributorName')}
                className={inputCls('contributorName')} placeholder="Full name" />
            </Field>
            <Field label="Your Email" error={errors.contributorEmail} htmlFor="contributorEmail">
              <input id="contributorEmail" type="email" value={form.contributorEmail} onChange={set('contributorEmail')}
                className={inputCls('contributorEmail')} placeholder="email@example.com" />
            </Field>
          </div>
        </div>

        {/* Tags */}
        <Field label="Tags" htmlFor="tags">
          <input id="tags" type="text" value={form.tags} onChange={set('tags')}
            className={inputCls('tags')} placeholder="e.g., ancestors, harvest, spirits" />
          <p className="text-xs text-stone-400 mt-1">Comma-separated keywords to help others find this story.</p>
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm"
          aria-busy={submitting}
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" aria-hidden="true" />
              Upload Story
            </>
          )}
        </button>
      </form>
    </main>
  )
}
