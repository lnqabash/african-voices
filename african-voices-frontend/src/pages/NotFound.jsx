import { Link } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10 text-amber-600" aria-hidden="true" />
      </div>
      <h1 className="text-6xl font-bold text-stone-200 mb-2">404</h1>
      <p className="text-xl font-semibold text-stone-700 mb-2">Page not found</p>
      <p className="text-stone-500 mb-8 max-w-sm">
        This story hasn't been written yet. Let's get you back to the archive.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Dashboard
      </Link>
    </div>
  )
}
