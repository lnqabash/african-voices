import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { storiesApi } from '../api/storiesApi'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import {
  ArrowLeft, Globe, MapPin, Tag, User, Mail, Clock,
  FileText, Mic, CheckCircle, AlertCircle, Loader,
  Trash2, Play, Pause, Volume2
} from 'lucide-react'

const statusConfig = {
  Completed: { color: 'text-green-700 bg-green-100 border-green-200', icon: CheckCircle },
  Processing: { color: 'text-blue-700 bg-blue-100 border-blue-200', icon: Loader },
  Failed: { color: 'text-red-700 bg-red-100 border-red-200', icon: AlertCircle },
  Pending: { color: 'text-amber-700 bg-amber-100 border-amber-200', icon: Clock },
}

function AudioPlayer({ src }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else audioRef.current.play()
    setPlaying(!playing)
  }

  const format = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
        aria-label="Story audio"
      />
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors flex-shrink-0"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing
            ? <Pause className="w-5 h-5" aria-hidden="true" />
            : <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />}
        </button>
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={currentTime}
            onChange={(e) => {
              const t = parseFloat(e.target.value)
              setCurrentTime(t)
              if (audioRef.current) audioRef.current.currentTime = t
            }}
            className="w-full accent-orange-600 h-2 cursor-pointer"
            aria-label="Seek"
          />
          <div className="flex justify-between text-xs text-stone-500 mt-1">
            <span>{format(currentTime)}</span>
            <span>{format(duration)}</span>
          </div>
        </div>
        <Volume2 className="w-5 h-5 text-stone-400 flex-shrink-0" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function StoryDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await storiesApi.getById(id)
      setStory(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleTranscribe = async () => {
    setTranscribing(true)
    setTranscribeError(null)
    try {
      const result = await storiesApi.transcribe(id)
      if (result.success) {
        setStory((s) => ({
          ...s,
          transcript: result.transcript,
          transcriptionStatus: 'Completed',
        }))
      } else {
        setTranscribeError(result.errorMessage || 'Transcription failed.')
      }
    } catch (err) {
      setTranscribeError(err.message)
    } finally {
      setTranscribing(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this story and its audio file? This cannot be undone.')) return
    setDeleting(true)
    try {
      await storiesApi.delete(id)
      navigate('/library')
    } catch (err) {
      alert('Failed to delete: ' + err.message)
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading story…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />
  if (!story) return null

  const status = statusConfig[story.transcriptionStatus] ?? statusConfig.Pending
  const StatusIcon = status.icon
  // audioFilePath is stored as "uploads/filename.ext" — serve directly
  const audioUrl = `/${story.audioFilePath.replace(/\\/g, '/')}`

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-700 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Library
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color} mb-3`}>
                  <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  {story.transcriptionStatus}
                </span>
                <h1 className="text-2xl font-bold text-stone-800 leading-snug">{story.title}</h1>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                aria-label="Delete story"
              >
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {story.description && (
              <p className="text-stone-600 leading-relaxed">{story.description}</p>
            )}
          </div>

          {/* Audio Player */}
          <section aria-labelledby="audio-heading">
            <h2 id="audio-heading" className="font-bold text-stone-700 mb-3 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-orange-500" aria-hidden="true" /> Audio
            </h2>
            <AudioPlayer src={audioUrl} />
          </section>

          {/* Transcript */}
          <section aria-labelledby="transcript-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="transcript-heading" className="font-bold text-stone-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" aria-hidden="true" /> Transcript
              </h2>
              {story.transcriptionStatus !== 'Completed' && story.transcriptionStatus !== 'Processing' && (
                <button
                  onClick={handleTranscribe}
                  disabled={transcribing}
                  className="flex items-center gap-1.5 text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-xl transition-colors"
                  aria-busy={transcribing}
                >
                  {transcribing ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" /> Transcribing…</>
                  ) : (
                    <><Mic className="w-4 h-4" aria-hidden="true" /> Generate Transcript</>
                  )}
                </button>
              )}
            </div>

            {transcribeError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-700" role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                {transcribeError}
              </div>
            )}

            {story.transcript ? (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap text-sm">{story.transcript}</p>
              </div>
            ) : (
              <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-8 text-center">
                <Mic className="w-8 h-8 text-stone-300 mx-auto mb-2" aria-hidden="true" />
                <p className="text-stone-500 text-sm">No transcript yet.</p>
                {story.transcriptionStatus === 'Processing' && (
                  <p className="text-blue-600 text-sm mt-1 flex items-center justify-center gap-1">
                    <Loader className="w-4 h-4 animate-spin" aria-hidden="true" /> Processing…
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Summary */}
          {story.summary && (
            <section aria-labelledby="summary-heading">
              <h2 id="summary-heading" className="font-bold text-stone-700 mb-3">Summary</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-stone-700 text-sm leading-relaxed">{story.summary}</p>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar metadata */}
        <aside>
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 sticky top-24">
            <h2 className="font-bold text-stone-800">Story Details</h2>

            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-0.5">Language</dt>
                <dd className="flex items-center gap-1.5 text-stone-700 text-sm font-medium">
                  <Globe className="w-4 h-4 text-orange-400" aria-hidden="true" /> {story.language}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-0.5">Region</dt>
                <dd className="flex items-center gap-1.5 text-stone-700 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-orange-400" aria-hidden="true" /> {story.region}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-0.5">Category</dt>
                <dd>
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {story.category}
                  </span>
                </dd>
              </div>
              {story.contributorName && (
                <div>
                  <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-0.5">Contributor</dt>
                  <dd className="flex items-center gap-1.5 text-stone-700 text-sm">
                    <User className="w-4 h-4 text-orange-400" aria-hidden="true" /> {story.contributorName}
                  </dd>
                </div>
              )}
              {story.tags && (
                <div>
                  <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Tags</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {story.tags.split(',').map((t) => (
                      <span key={t.trim()} className="flex items-center gap-1 bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full">
                        <Tag className="w-3 h-3" aria-hidden="true" />{t.trim()}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-0.5">Added</dt>
                <dd className="text-stone-700 text-sm">
                  {new Date(story.createdDate).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  )
}
