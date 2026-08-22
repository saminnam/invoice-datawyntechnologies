import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiLock, FiUnlock, FiSearch } from 'react-icons/fi'
import { userService } from '../../services/userService'
import { roleService } from '../../services/roleService'
import { permissionService } from '../../services/permissionService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import UserModal from '../../components/users/UserModal'

const UserListPage = () => {
  const { hasPermission } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, permissionsRes] = await Promise.all([
        userService.getUsers(),
        roleService.getRoles(),
        permissionService.getPermissions()
      ])

      if (usersRes.success) {
        setUsers(usersRes.data?.items || [])
      }
      if (rolesRes.success) {
        setRoles(rolesRes.data)
      }
      if (permissionsRes.success) {
        setPermissions(permissionsRes.data)
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditUser = (user) => {
    // Prevent editing the main admin user
    if (user.email === 'admin@datawyn.com') {
      toast.error('Cannot edit the main admin user')
      return
    }
    setSelectedUser(user)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (userId, userEmail) => {
    // Prevent deleting the main admin user
    if (userEmail === 'admin@datawyn.com') {
      toast.error('Cannot delete the main admin user')
      return
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const response = await userService.deleteUser(userId)
      if (response.success) {
        toast.success('User deleted successfully')
        fetchData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleToggleStatus = async (userId, userEmail) => {
    // Prevent toggling status of main admin user
    if (userEmail === 'admin@datawyn.com') {
      toast.error('Cannot deactivate the main admin user')
      return
    }

    try {
      const response = await userService.toggleUserStatus(userId)
      if (response.success) {
        toast.success('User status updated successfully')
        fetchData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleModalSubmit = async (userData) => {
    try {
      let response
      if (modalMode === 'create') {
        response = await userService.createUser(userData)
      } else {
        response = await userService.updateUser(selectedUser._id, userData)
      }

      if (response.success) {
        toast.success(`User ${modalMode === 'create' ? 'created' : 'updated'} successfully`)
        setIsModalOpen(false)
        fetchData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${modalMode === 'create' ? 'create' : 'update'} user`)
    }
  }

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        {hasPermission('users.create') && (
          <button
            onClick={handleCreateUser}
            className="btn bg-black text-white flex items-center gap-2"
          >
            <FiPlus size={20} />
            Add User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                        {user.role?.name || 'No Role'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        user.isActive 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {hasPermission('users.edit') && user.email !== 'admin@datawyn.com' && (
                          <button
                            onClick={() => handleToggleStatus(user._id, user.email)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? (
                              <FiLock className="text-gray-600" size={18} />
                            ) : (
                              <FiUnlock className="text-gray-600" size={18} />
                            )}
                          </button>
                        )}
                        {hasPermission('users.edit') && user.email !== 'admin@datawyn.com' && (
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Edit"
                          >
                            <FiEdit2 className="text-gray-600" size={18} />
                          </button>
                        )}
                        {hasPermission('users.delete') && user.email !== 'admin@datawyn.com' && (
                          <button
                            onClick={() => handleDeleteUser(user._id, user.email)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <FiTrash2 className="text-red-600" size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          user={selectedUser}
          mode={modalMode}
          roles={roles}
          permissions={permissions}
        />
      )}
    </div>
  )
}

export default UserListPage
