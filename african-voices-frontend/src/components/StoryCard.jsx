import { Link } from 'react-router-dom'
import { MapPin, Globe, Tag, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'

const statusConfig = {
  Completed: { color: 'text-green-700 bg-green-100', icon: CheckCircle, label: 'Transcribed' },
  Processing: { color: 'text-blue-700 bg-blue-100', icon: Loader, label: 'Processing' },
  Failed: { color: 'text-red-700 bg-red-100', icon: AlertCircle, label: 'Failed' },
  Pending: { color: 'text-amber-700 bg-amber-100', icon: Clock, label: 'Pending' },
}

const categoryColors = {
  Folklore: 'bg-purple-100 text-purple-800',
  History: 'bg-amber-100 text-amber-800',
  Music: 'bg-pink-100 text-pink-800',
  Proverbs: 'bg-teal-100 text-teal-800',
  Mythology: 'bg-indigo-100 text-indigo-800',
  default: 'bg-orange-100 text-orange-800',
}

export default function StoryCard({ story }) {
  const status = statusConfig[story.transcriptionStatus] ?? statusConfig.Pending
  const StatusIcon = status.icon
  const catColor = categoryColors[story.category] ?? categoryColors.default

  return (
    <Link
      to={`/stories/${story.id}`}
      className="group block rounded-2xl border border-stone-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
      aria-label={`View story: ${story.title}`}
    >
      {/* Top color band */}
      <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400" aria-hidden="true" />

      <div className="p-5">
        {/* Category + status */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColor}`}>
            {story.category}
          </span>
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {status.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-stone-800 text-base mb-1 line-clamp-2 group-hover:text-orange-700 transition-colors">
          {story.title}
        </h3>

        {/* Contributor */}
        {story.contributorName && (
          <p className="text-sm text-stone-500 mb-3">by {story.contributorName}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="flex items-center gap-1 text-xs text-stone-500">
            <Globe className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
            {story.language}
          </span>
          <span className="flex items-center gap-1 text-xs text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
            {story.region}
          </span>
        </div>

        {/* Tags */}
        {story.tags && (
          <div className="flex items-center gap-1 mt-2">
            <Tag className="w-3 h-3 text-stone-400" aria-hidden="true" />
            <p className="text-xs text-stone-400 truncate">{story.tags}</p>
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-stone-400 mt-3">
          {new Date(story.createdDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
          })}
        </p>
      </div>
    </Link>
  )
}
