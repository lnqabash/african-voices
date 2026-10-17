import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { storiesApi } from '../api/storiesApi'
import StoryCard from '../components/StoryCard'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { Search, Filter, X, BookOpen } from 'lucide-react'

const LANGUAGES = ['', 'English', 'Swahili', 'Zulu', 'Xhosa', 'Afrikaans', 'Amharic',
  'Hausa', 'Yoruba', 'Igbo', 'Somali', 'Arabic', 'French', 'Portuguese', 'Other']

const CATEGORIES = ['', 'Folklore', 'History', 'Music', 'Proverbs', 'Mythology',
  'Traditional Ceremony', 'Community Story', 'Oral Poetry', 'Creation Story',
  'Ancestral Wisdom', 'Other']

const REGIONS = ['', 'East Africa', 'West Africa', 'Southern Africa', 'North Africa',
  'Central Africa', 'Horn of Africa', 'Great Lakes Region', 'Sahel Region',
  'Coastal Africa', 'Other']

export default function StoryLibrary() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const query = searchParams.get('query') ?? ''
  const language = searchParams.get('language') ?? ''
  const category = searchParams.get('category') ?? ''
  const region = searchParams.get('region') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  const [localQuery, setLocalQuery] = useState(query)

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value); else next.delete(key)
      next.set('page', '1')
      return next
    })
  }

  const clearFilters = () => {
    setLocalQuery('')
    setSearchParams({})
  }

  const hasFilters = query || language || category || region

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, pageSize: 12 }
      if (query) params.query = query
      if (language) params.language = language
      if (category) params.category = category
      if (region) params.region = region

      const data = hasFilters || query
        ? await storiesApi.search(params)
        : await storiesApi.getAll(page, 12)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [query, language, category, region, page, hasFilters])

  useEffect(() => { load() }, [load])

  const selectCls = 'px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400 hover:border-stone-300 transition-colors'

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Story Library</h1>
        <p className="text-stone-500 mt-1">Explore the African oral heritage archive.</p>
      </div>

      {/* Search + filters */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 space-y-3">
        {/* Search bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); updateParam('query', localQuery) }}
          className="flex gap-2"
          role="search"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" aria-hidden="true" />
            <input
              type="search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search stories, transcripts, descriptions…"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
              aria-label="Search stories"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" aria-hidden="true" />
          <select value={language} onChange={(e) => updateParam('language', e.target.value)}
            className={selectCls} aria-label="Filter by language">
            <option value="">All Languages</option>
            {LANGUAGES.filter(Boolean).map((l) => <option key={l}>{l}</option>)}
          </select>
          <select value={category} onChange={(e) => updateParam('category', e.target.value)}
            className={selectCls} aria-label="Filter by category">
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={region} onChange={(e) => updateParam('region', e.target.value)}
            className={selectCls} aria-label="Filter by region">
            <option value="">All Regions</option>
            {REGIONS.filter(Boolean).map((r) => <option key={r}>{r}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner message="Loading stories…" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : result?.items.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-14 h-14 text-stone-200 mx-auto mb-4" aria-hidden="true" />
          <p className="text-xl font-semibold text-stone-500">No stories found</p>
          <p className="text-stone-400 mt-1 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500 mb-4" aria-live="polite">
            {result.totalCount} {result.totalCount === 1 ? 'story' : 'stories'} found
            {(page > 1) && ` · Page ${page} of ${result.totalPages}`}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {result.items.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={result.totalPages}
            onPageChange={(p) => setSearchParams((prev) => {
              const next = new URLSearchParams(prev)
              next.set('page', String(p))
              return next
            })}
          />
        </>
      )}
    </main>
  )
}
