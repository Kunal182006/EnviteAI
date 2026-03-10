const API_URL = process.env.REACT_APP_BACKEND_URL;

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}/api${endpoint}`;
  
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  getMe: () => apiCall('/auth/me'),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  exchangeSession: (sessionId) => apiCall('/auth/session', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  }),
};

// Weddings API
export const weddingsApi = {
  create: (data) => apiCall('/weddings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getAll: () => apiCall('/weddings'),
  
  getOne: (id) => apiCall(`/weddings/${id}`),
  
  update: (id, data) => apiCall(`/weddings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiCall(`/weddings/${id}`, {
    method: 'DELETE',
  }),
};

// Chat API
export const chatApi = {
  send: (message, weddingId = null) => apiCall('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, wedding_id: weddingId }),
  }),
};

// Designs API
export const designsApi = {
  generate: (weddingId) => apiCall(`/generate-designs/${weddingId}`, {
    method: 'POST',
  }),
  
  getAll: (weddingId) => apiCall(`/designs/${weddingId}`),
  
  select: (designId) => apiCall(`/designs/${designId}/select`, {
    method: 'PATCH',
  }),
};

// Payment API
export const paymentApi = {
  createOrder: (tier, weddingId) => apiCall('/payment/create-order', {
    method: 'POST',
    body: JSON.stringify({ tier, wedding_id: weddingId }),
  }),
  
  verify: (data) => apiCall('/payment/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Stats API
export const statsApi = {
  get: () => apiCall('/stats'),
};

export default {
  auth: authApi,
  weddings: weddingsApi,
  chat: chatApi,
  designs: designsApi,
  payment: paymentApi,
  stats: statsApi,
};
