import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { roleService } from '../../services/roleService'
import { permissionService } from '../../services/permissionService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import RoleModal from '../../components/users/RoleModal'

const RoleListPage = () => {
  const { hasPermission } = useAuth()
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        roleService.getRoles(),
        permissionService.getPermissions()
      ])

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

  const handleCreateRole = () => {
    setSelectedRole(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteRole = async (roleId, roleName) => {
    // Prevent deleting the Admin role
    if (roleName === 'Admin') {
      toast.error('Cannot delete the Admin role')
      return
    }

    if (!window.confirm('Are you sure you want to delete this role?')) {
      return
    }

    try {
      const response = await roleService.deleteRole(roleId)
      if (response.success) {
        toast.success('Role deleted successfully')
        fetchData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete role')
    }
  }

  const handleModalSubmit = async (roleData) => {
    try {
      let response
      if (modalMode === 'create') {
        response = await roleService.createRole(roleData)
      } else {
        response = await roleService.updateRole(selectedRole._id, roleData)
      }

      if (response.success) {
        toast.success(`Role ${modalMode === 'create' ? 'created' : 'updated'} successfully`)
        setIsModalOpen(false)
        fetchData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${modalMode === 'create' ? 'create' : 'update'} role`)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-gray-600">Manage user roles and their permissions</p>
        </div>
        {hasPermission('roles.create') && (
          <button
            onClick={handleCreateRole}
            className="btn bg-black text-white flex items-center gap-2"
          >
            <FiPlus size={20} />
            Add Role
          </button>
        )}
      </div>

      {/* Roles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles
          .filter(role => 
            // Hide dummy/system roles (Staff, Viewer) - only show Admin and dynamically added roles
            role.name !== 'Staff' && 
            role.name !== 'Viewer'
          )
          .map((role) => (
          <div key={role._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                {role.isSystem && (
                  <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                    System Role
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {hasPermission('roles.edit') && !role.isSystem && (
                  <button
                    onClick={() => handleEditRole(role)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <FiEdit2 className="text-gray-600" size={18} />
                  </button>
                )}
                {hasPermission('roles.delete') && !role.isSystem && role.name !== 'Admin' && (
                  <button
                    onClick={() => handleDeleteRole(role._id, role.name)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <FiTrash2 className="text-red-600" size={18} />
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{role.description}</p>
            
            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">
                {role.permissions?.length || 0} permissions assigned
              </div>
              <div className="flex flex-wrap gap-1">
                {role.permissions?.slice(0, 5).map((permission) => (
                  <span
                    key={permission._id}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {permission.name}
                  </span>
                ))}
                {role.permissions?.length > 5 && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    +{role.permissions.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show message if no roles are displayed */}
      {roles.filter(role => 
        role.name !== 'Staff' && 
        role.name !== 'Viewer'
      ).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No roles found</p>
          <p className="text-sm mt-2">Click "Add Role" to create your first role</p>
        </div>
      )}

      {/* Role Modal */}
      {isModalOpen && (
        <RoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          role={selectedRole}
          mode={modalMode}
          permissions={permissions}
        />
      )}
    </div>
  )
}

export default RoleListPage
