import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import StoryLibrary from './pages/StoryLibrary'
import UploadStory from './pages/UploadStory'
import StoryDetails from './pages/StoryDetails'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<StoryLibrary />} />
            <Route path="/upload" element={<UploadStory />} />
            <Route path="/stories/:id" element={<StoryDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <footer className="border-t border-stone-200 bg-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-stone-400">
            © {new Date().getFullYear()} African Voices Heritage Archive · Preserving oral traditions for future generations
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
