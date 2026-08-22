import api from './api'

export const permissionService = {
  // Get all permissions
  getPermissions: async () => {
    const response = await api.get('/permissions')
    return response.data
  },

  // Create new permission
  createPermission: async (permissionData) => {
    const response = await api.post('/permissions', permissionData)
    return response.data
  },

  // Update permission
  updatePermission: async (id, permissionData) => {
    const response = await api.put(`/permissions/${id}`, permissionData)
    return response.data
  },

  // Delete permission
  deletePermission: async (id) => {
    const response = await api.delete(`/permissions/${id}`)
    return response.data
  }
}
