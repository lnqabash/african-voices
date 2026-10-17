import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/storiesApi'
import StoryCard from '../components/StoryCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { BookOpen, Globe, MapPin, TrendingUp, Upload, ChevronRight } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`rounded-2xl p-6 flex items-center gap-4 shadow-sm border ${color}`}>
      <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium opacity-75">{label}</p>
        <p className="text-3xl font-bold leading-none mt-1">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardApi.getStats()
      // Ensure all array fields exist even if API changes
      setStats({
        totalStories: data.totalStories ?? 0,
        languagesRepresented: data.languagesRepresented ?? 0,
        regionsRepresented: data.regionsRepresented ?? 0,
        storiesThisMonth: data.storiesThisMonth ?? 0,
        recentStories: data.recentStories ?? [],
        storiesByLanguage: data.storiesByLanguage ?? [],
        storiesByCategory: data.storiesByCategory ?? [],
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingSpinner message="Loading dashboard…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />
  if (!stats) return <ErrorMessage message="No data returned from server." onRetry={load} />

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="rounded-3xl gradient-hero text-white p-8 md:p-12 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #F5A623 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)' }} />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">
            African Voices Heritage Archive
          </h1>
          <p className="text-amber-100 text-lg max-w-2xl mb-6">
            Preserving the oral traditions, folklore, and living wisdom of Africa for generations to come.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-orange-900 font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              Share Your Story
            </Link>
            <Link
              to="/library"
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Browse Archive
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section aria-labelledby="stats-heading" className="mb-10">
        <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Total Stories" value={stats.totalStories}
            color="bg-orange-50 border-orange-200 text-orange-900" />
          <StatCard icon={Globe} label="Languages" value={stats.languagesRepresented}
            color="bg-amber-50 border-amber-200 text-amber-900" />
          <StatCard icon={MapPin} label="Regions" value={stats.regionsRepresented}
            color="bg-yellow-50 border-yellow-200 text-yellow-900" />
          <StatCard icon={TrendingUp} label="Added This Month" value={stats.storiesThisMonth}
            color="bg-lime-50 border-lime-200 text-lime-900" />
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Stories */}
        <section className="lg:col-span-2" aria-labelledby="recent-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="recent-heading" className="text-xl font-bold text-stone-800">Recently Added</h2>
            <Link to="/library" className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium">
              View all <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          {stats.recentStories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center">
              <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" aria-hidden="true" />
              <p className="text-stone-500">No stories yet. Be the first to share!</p>
              <Link to="/upload" className="mt-4 inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm">
                <Upload className="w-4 h-4" aria-hidden="true" /> Upload a story
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {stats.recentStories.map((s) => <StoryCard key={s.id} story={s} />)}
            </div>
          )}
        </section>

        {/* Sidebar charts */}
        <aside>
          {/* By Language */}
          {stats.storiesByLanguage.length > 0 && (
            <section className="bg-white rounded-2xl border border-stone-200 p-5 mb-5" aria-labelledby="lang-heading">
              <h2 id="lang-heading" className="font-bold text-stone-800 mb-4">Stories by Language</h2>
              <ul className="space-y-2">
                {stats.storiesByLanguage.slice(0, 6).map(({ language, count }) => (
                  <li key={language} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-stone-700">{language}</span>
                        <span className="text-stone-500">{count}</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                          style={{ width: `${Math.round((count / stats.totalStories) * 100)}%` }}
                          role="progressbar"
                          aria-valuenow={count}
                          aria-valuemax={stats.totalStories}
                          aria-label={`${language}: ${count} stories`}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* By Category */}
          {stats.storiesByCategory.length > 0 && (
            <section className="bg-white rounded-2xl border border-stone-200 p-5" aria-labelledby="cat-heading">
              <h2 id="cat-heading" className="font-bold text-stone-800 mb-4">Stories by Category</h2>
              <ul className="flex flex-wrap gap-2">
                {stats.storiesByCategory.map(({ category, count }) => (
                  <li key={category}>
                    <Link
                      to={`/library?category=${encodeURIComponent(category)}`}
                      className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-sm px-3 py-1.5 rounded-full transition-colors"
                    >
                      {category}
                      <span className="bg-orange-200 text-orange-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </main>
  )
}
