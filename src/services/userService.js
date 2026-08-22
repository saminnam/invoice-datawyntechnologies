import api from './api'

export const userService = {
  // Get all users with filters
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  // Get single user
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Reset user password
  resetPassword: async (id, newPassword) => {
    const response = await api.post(`/users/${id}/reset-password`, { newPassword })
    return response.data
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    const response = await api.patch(`/users/${id}/toggle-status`)
    return response.data
  },

  // Bulk create users
  createBulkUsers: async (users) => {
    const response = await api.post('/users/bulk', { users })
    return response.data
  }
}
