import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import toast from 'react-hot-toast'

const ProductEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'static',
    description: '',
    price: '',
    status: 'active'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await productService.getProduct(id)
      if (response.success) {
        const product = response.data
        setFormData({
          name: product.name || '',
          type: product.type || 'static',
          description: product.description || '',
          price: product.price?.toString() || '',
          status: product.status || 'active'
        })
      }
    } catch (error) {
      toast.error('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setSaving(true)
    try {
      const response = await productService.updateProduct(id, {
        ...formData,
        price: parseFloat(formData.price)
      })
      if (response.success) {
        toast.success('Product updated successfully')
        navigate('/products')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    } finally {
      setSaving(false)
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product/Service</h1>
        <p className="text-gray-600">Update product details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input"
              >
                <option value="static">Static</option>
                <option value="dynamic">Dynamic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`input ${errors.price ? 'border-red-500' : ''}`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductEditPage
