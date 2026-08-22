import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

const UserModal = ({ isOpen, onClose, onSubmit, user, mode, roles, permissions }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    permissions: [],
    isActive: true
  })

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role?._id || '',
        permissions: user.permissions?.map(p => p._id) || [],
        isActive: user.isActive !== undefined ? user.isActive : true
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        permissions: [],
        isActive: true
      })
    }
  }, [user, mode])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate
    if (!formData.name || !formData.email) {
      alert('Name and email are required')
      return
    }

    if (mode === 'create' && !formData.password) {
      alert('Password is required for new users')
      return
    }

    // Remove password if it's empty in edit mode
    const submitData = { ...formData }
    if (mode === 'edit' && !submitData.password) {
      delete submitData.password
    }

    onSubmit(submitData)
  }

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = []
    }
    acc[permission.module].push(permission)
    return acc
  }, {})

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New User' : 'Edit User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {mode === 'edit' && '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required={mode === 'create'}
                minLength={6}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Role</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
              >
                <option value="">No Role</option>
                {roles.map(role => (
                  <option key={role._id} value={role._id}>
                    {role.name} {role.isSystem && '(System)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Direct Permissions */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Direct Permissions</h3>
            <p className="text-sm text-gray-500">
              These permissions will be assigned directly to the user, in addition to any role permissions.
            </p>
            
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <div key={module} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 capitalize">{module}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {modulePermissions.map(permission => (
                    <label key={permission._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission._id)}
                        onChange={() => handlePermissionToggle(permission._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{permission.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active User
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              {mode === 'create' ? 'Create User' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal
