const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('delivery_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || (errorData.errors ? Object.values(errorData.errors).join(', ') : errorData.error) || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  if (response.status === 204) return null;
  return response.json();
};

export const api = {

  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  calculateQuote: async (quoteData) => {
    const res = await fetch(`${API_BASE_URL}/quotes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    return handleResponse(res);
  },

  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(res);
  },

  getOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getOrderById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  rescheduleOrder: async (id, rescheduleData) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/reschedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rescheduleData)
    });
    return handleResponse(res);
  },

  getAgentOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/agent/orders`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateOrderStatus: async (orderId, statusData) => {
    const res = await fetch(`${API_BASE_URL}/agent/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData)
    });
    return handleResponse(res);
  },

  toggleAgentAvailability: async (isAvailable) => {
    const res = await fetch(`${API_BASE_URL}/agent/availability`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isAvailable })
    });
    return handleResponse(res);
  },

  updateAgentLocation: async (latitude, longitude) => {
    const res = await fetch(`${API_BASE_URL}/agent/location`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ latitude, longitude })
    });
    return handleResponse(res);
  },

  trackOrder: async (trackingNumber) => {
    const res = await fetch(`${API_BASE_URL}/tracking/${encodeURIComponent(trackingNumber)}`);
    return handleResponse(res);
  },

  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAllOrders: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE_URL}/admin/orders${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  assignAgent: async (orderId, assignData) => {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignData)
    });
    return handleResponse(res);
  },

  overrideOrderStatus: async (orderId, statusData) => {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/override-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData)
    });
    return handleResponse(res);
  },

  getZones: async () => {
    const res = await fetch(`${API_BASE_URL}/zones`);
    return handleResponse(res);
  },

  createZone: async (zoneData) => {
    const res = await fetch(`${API_BASE_URL}/admin/zones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(zoneData)
    });
    return handleResponse(res);
  },

  updateZone: async (id, zoneData) => {
    const res = await fetch(`${API_BASE_URL}/admin/zones/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(zoneData)
    });
    return handleResponse(res);
  },

  deleteZone: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/zones/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAreas: async () => {
    const res = await fetch(`${API_BASE_URL}/areas`);
    return handleResponse(res);
  },

  createArea: async (areaData) => {
    const res = await fetch(`${API_BASE_URL}/admin/areas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(areaData)
    });
    return handleResponse(res);
  },

  deleteArea: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/areas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getRateCards: async () => {
    const res = await fetch(`${API_BASE_URL}/rate-cards`);
    return handleResponse(res);
  },

  createRateCard: async (rateCardData) => {
    const res = await fetch(`${API_BASE_URL}/admin/rate-cards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rateCardData)
    });
    return handleResponse(res);
  },

  updateRateCard: async (id, rateCardData) => {
    const res = await fetch(`${API_BASE_URL}/admin/rate-cards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(rateCardData)
    });
    return handleResponse(res);
  },

  deleteRateCard: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/rate-cards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAgents: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/agents`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getCustomers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/customers`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications/all`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
