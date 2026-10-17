import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 60000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  }
)

// ── Stories ──────────────────────────────────────────────────────────────────

export const storiesApi = {
  getAll: (page = 1, pageSize = 12) =>
    api.get('/stories', { params: { page, pageSize } }).then((r) => r.data),

  getById: (id) => api.get(`/stories/${id}`).then((r) => r.data),

  search: (params) => api.get('/stories/search', { params }).then((r) => r.data),

  create: (formData) =>
    api.post('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }).then((r) => r.data),

  update: (id, data) => api.put(`/stories/${id}`, data).then((r) => r.data),

  delete: (id) => api.delete(`/stories/${id}`).then((r) => r.data),

  transcribe: (id) =>
    api.post(`/stories/${id}/transcribe`, {}, { timeout: 300000 }).then((r) => r.data),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats').then((r) => r.data),
}
