import { useState, useEffect } from 'react'
import { companyService } from '../../services/companyService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CompanySettingsPage = () => {
  const { hasRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      stateCode: '',
      country: 'India',
      pincode: ''
    },
    gstin: '',
    pan: '',
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifsc: '',
      branch: ''
    },
    invoiceSettings: {
      prefix: 'PI',
      startingNumber: 1,
      defaultCurrency: 'INR',
      defaultGst: 18,
      defaultPaymentTerms: '',
      defaultNotes: '',
      defaultTerms: ''
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await companyService.getCompanySettings()
      if (response.success) {
        const settings = response.data
        setFormData({
          companyName: settings.companyName || '',
          email: settings.email || '',
          phone: settings.phone || '',
          website: settings.website || '',
          address: settings.address || {
            street: '',
            city: '',
            state: '',
            stateCode: '',
            country: 'India',
            pincode: ''
          },
          gstin: settings.gstin || '',
          pan: settings.pan || '',
          bankDetails: settings.bankDetails || {
            bankName: '',
            accountHolderName: '',
            accountNumber: '',
            ifsc: '',
            branch: ''
          },
          invoiceSettings: settings.invoiceSettings || {
            prefix: 'PI',
            startingNumber: 1,
            defaultCurrency: 'INR',
            defaultGst: 18,
            defaultPaymentTerms: '',
            defaultNotes: '',
            defaultTerms: ''
          }
        })
        if (settings.logo) {
          setLogoPreview(settings.logo)
        }
      }
    } catch (error) {
      toast.error('Failed to fetch company settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!hasRole('admin')) {
      toast.error('Only admin can update company settings')
      return
    }
    
    setSaving(true)
    try {
      const response = await companyService.updateCompanySettings(formData, logoFile)
      if (response.success) {
        toast.success('Company settings updated successfully')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
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
        <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-600">Manage your company information and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
          
          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="flex items-start gap-4">
              {logoPreview && (
                <div className="w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image (200x200px), max 5MB. Formats: JPEG, PNG, GIF, WebP, SVG
                </p>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GSTIN
              </label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN
              </label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="input mb-2"
              placeholder="Street"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="input"
                placeholder="City"
              />
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="input"
                placeholder="State"
              />
              <input
                type="text"
                name="address.stateCode"
                value={formData.address.stateCode}
                onChange={handleChange}
                className="input"
                placeholder="State Code (e.g., TN)"
              />
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                className="input"
                placeholder="Pincode"
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                name="bankDetails.bankName"
                value={formData.bankDetails.bankName}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                name="bankDetails.accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                name="bankDetails.accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC
              </label>
              <input
                type="text"
                name="bankDetails.ifsc"
                value={formData.bankDetails.ifsc}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <input
                type="text"
                name="bankDetails.branch"
                value={formData.bankDetails.branch}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Prefix
              </label>
              <input
                type="text"
                name="invoiceSettings.prefix"
                value={formData.invoiceSettings.prefix}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Number
              </label>
              <input
                type="number"
                name="invoiceSettings.startingNumber"
                value={formData.invoiceSettings.startingNumber}
                onChange={handleChange}
                className="input"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <input
                type="text"
                name="invoiceSettings.defaultCurrency"
                value={formData.invoiceSettings.defaultCurrency}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default GST %
              </label>
              <input
                type="number"
                name="invoiceSettings.defaultGst"
                value={formData.invoiceSettings.defaultGst}
                onChange={handleChange}
                className="input"
                min="0"
                max="100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Payment Terms
              </label>
              <input
                type="text"
                name="invoiceSettings.defaultPaymentTerms"
                value={formData.invoiceSettings.defaultPaymentTerms}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Notes
              </label>
              <textarea
                name="invoiceSettings.defaultNotes"
                value={formData.invoiceSettings.defaultNotes}
                onChange={handleChange}
                rows={2}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Terms & Conditions
              </label>
              <textarea
                name="invoiceSettings.defaultTerms"
                value={formData.invoiceSettings.defaultTerms}
                onChange={handleChange}
                rows={4}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving || !hasRole('admin')}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanySettingsPage
