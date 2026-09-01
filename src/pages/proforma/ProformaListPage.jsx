import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiCopy, FiDownload, FiFileText } from 'react-icons/fi'
import { invoiceService } from '../../services/invoiceService'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/dateUtils'
import { formatCurrency } from '../../utils/formatCurrency'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '../../config/constants'
import Pagination from '../../components/common/Pagination'

const ProformaListPage = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page when search changes
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchInvoices()
  }, [currentPage, debouncedSearchTerm, statusFilter])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await invoiceService.getProformaInvoices({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        status: statusFilter
      })
      if (response.success) {
        setInvoices(response.data.items || response.data)
        setTotalPages(response.data.pagination?.pages || 1)
        setTotalItems(response.data.pagination?.total || 0)
      }
    } catch (error) {
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await invoiceService.deleteProformaInvoice(id)
      if (response.success) {
        toast.success('Invoice deleted successfully')
        setCurrentPage(1)
        fetchInvoices()
      }
    } catch (error) {
      toast.error('Failed to delete invoice')
    } finally {
      setShowDeleteModal(null)
    }
  }

  const handleDuplicate = async (id) => {
    try {
      const response = await invoiceService.duplicateProformaInvoice(id)
      if (response.success) {
        toast.success('Invoice duplicated successfully')
        fetchInvoices()
      }
    } catch (error) {
      toast.error('Failed to duplicate invoice')
    }
  }

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      const response = await invoiceService.downloadPDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to download PDF')
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proforma Invoices</h1>
          <p className="text-gray-600">Manage your proforma invoices</p>
        </div>
        <button
          onClick={() => navigate('/proforma/new')}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus size={20} />
          Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input sm:w-48"
        >
          <option value="">All Status</option>
          {Object.entries(INVOICE_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td className="font-medium">{invoice.invoiceNumber}</td>
                  <td>{invoice.customerSnapshot?.companyName}</td>
                  <td>{formatDate(invoice.invoiceDate)}</td>
                  <td>{formatCurrency(invoice.grandTotal)}</td>
                  <td>
                    <span className={`badge badge-${INVOICE_STATUS_COLORS[invoice.status]}`}>
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/proforma/${invoice._id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="View"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/proforma/${invoice._id}/edit`)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Edit"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(invoice._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Duplicate"
                      >
                        <FiCopy size={18} />
                      </button>
                      {/* <button
                        onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Download PDF"
                      >
                        <FiDownload size={18} />
                      </button> */}
                      <button
                        onClick={() => setShowDeleteModal(invoice._id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Invoice</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProformaListPage
