import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiDownload, FiTrash2 } from 'react-icons/fi'
import { invoiceService } from '../../services/invoiceService'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/dateUtils'
import { formatCurrency } from '../../utils/formatCurrency'

const InvoiceListPage = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await invoiceService.getInvoices()
      if (response.success) {
        setInvoices(response.data.items || response.data)
      }
    } catch (error) {
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      const response = await invoiceService.downloadInvoicePDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF downloaded successfully')
    } catch (error) {
      toast.error('Failed to download PDF')
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await invoiceService.deleteInvoice(id)
      if (response.success) {
        toast.success('Invoice deleted successfully')
        fetchInvoices()
      }
    } catch (error) {
      toast.error('Failed to delete invoice')
    } finally {
      setShowDeleteModal(null)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600">Final invoices converted from proforma invoices</p>
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
                    <span className={`badge badge-${invoice.status === 'paid' ? 'green' : invoice.status === 'sent' ? 'blue' : 'gray'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/invoices/${invoice._id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="View"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Download PDF"
                      >
                        <FiDownload size={18} />
                      </button>
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
                  No invoices found. Convert proforma invoices to create final invoices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default InvoiceListPage
