import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4" role="alert">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-600" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-stone-700 mb-1">Something went wrong</p>
        <p className="text-sm text-stone-500 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}
