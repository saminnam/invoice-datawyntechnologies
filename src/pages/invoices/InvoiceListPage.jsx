import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiDownload, FiTrash2 } from 'react-icons/fi'
import { invoiceService } from '../../services/invoiceService'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/dateUtils'
import { formatCurrency } from '../../utils/formatCurrency'
import html2pdf from 'html2pdf.js'

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
      // Fetch invoice details first for proper PDF generation
      const invoiceResponse = await invoiceService.getInvoice(id)
      if (!invoiceResponse.success) {
        toast.error('Failed to fetch invoice details')
        return
      }
      
      const invoice = invoiceResponse.data
      
      // Create a temporary container for the invoice HTML
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '210mm'
      container.style.padding = '10mm'
      container.style.backgroundColor = 'white'
      document.body.appendChild(container)
      
      // Build the invoice HTML (simplified version matching CRM UI)
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h2 style="margin: 0; font-size: 22px; font-weight: bold;">TAX INVOICE</h2>
              <p style="margin: 5px 0 0 0; color: #666;">Invoice No: ${invoice.invoiceNumber}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: #666;">Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">BILL TO</h3>
            <p style="margin: 5px 0; font-weight: bold;">${invoice.customerSnapshot?.companyName || 'N/A'}</p>
            ${invoice.customerSnapshot?.contactPerson ? `<p style="margin: 5px 0; color: #666;">${invoice.customerSnapshot.contactPerson}</p>` : ''}
            ${invoice.customerSnapshot?.email ? `<p style="margin: 5px 0; color: #666;">${invoice.customerSnapshot.email}</p>` : ''}
            ${invoice.customerSnapshot?.phone ? `<p style="margin: 5px 0; color: #666;">${invoice.customerSnapshot.phone}</p>` : ''}
            ${invoice.customerSnapshot?.billingAddress ? `<p style="margin: 5px 0; color: #666;">${[invoice.customerSnapshot.billingAddress.street, invoice.customerSnapshot.billingAddress.city, invoice.customerSnapshot.billingAddress.state, invoice.customerSnapshot.billingAddress.pincode].filter(Boolean).join(', ')}</p>` : ''}
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-size: 10px; color: #374151;">DESCRIPTION</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-size: 10px; color: #374151;">QTY</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb; font-size: 10px; color: #374151;">RATE</th>
                ${invoice.enableGST ? '<th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-size: 10px; color: #374151;">GST %</th><th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb; font-size: 10px; color: #374151;">TAXABLE</th>' : ''}
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb; font-size: 10px; color: #374151;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items?.map((item, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f3f4f6'};">
                  <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 10px;">${item.productSnapshot?.name || item.description || 'N/A'}</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 10px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 10px; text-align: right;">₹${parseFloat(item.rate).toFixed(2)}</td>
                  ${invoice.enableGST ? `<td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 10px; text-align: center;">${item.gstRate}%</td><td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 10px; text-align: right;">₹${parseFloat(item.taxableAmount || (item.rate * item.quantity)).toFixed(2)}</td>` : ''}
                  <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 10px; text-align: right; font-weight: bold;">₹${parseFloat(item.total).toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-bottom: 20px;">
            <p style="margin: 5px 0; color: #4b5563; font-size: 11px;">Subtotal: <span style="font-weight: bold; color: #333;">₹${parseFloat(invoice.subtotal).toFixed(2)}</span></p>
            ${(invoice.itemDiscount + invoice.invoiceDiscount) > 0 ? `<p style="margin: 5px 0; color: #4b5563; font-size: 11px;">Discount: <span style="font-weight: bold; color: #dc2626;">-₹${parseFloat(invoice.itemDiscount + invoice.invoiceDiscount).toFixed(2)}</span></p>` : ''}
            ${invoice.enableGST && invoice.cgst > 0 ? `<p style="margin: 5px 0; color: #4b5563; font-size: 11px;">CGST: <span style="font-weight: bold; color: #333;">₹${parseFloat(invoice.cgst).toFixed(2)}</span></p>` : ''}
            ${invoice.enableGST && invoice.sgst > 0 ? `<p style="margin: 5px 0; color: #4b5563; font-size: 11px;">SGST: <span style="font-weight: bold; color: #333;">₹${parseFloat(invoice.sgst).toFixed(2)}</span></p>` : ''}
            ${invoice.enableGST && invoice.igst > 0 ? `<p style="margin: 5px 0; color: #4b5563; font-size: 11px;">IGST: <span style="font-weight: bold; color: #333;">₹${parseFloat(invoice.igst).toFixed(2)}</span></p>` : ''}
            <p style="margin: 10px 0 5px 0; border-top: 2px solid #e5e7eb; padding-top: 10px; color: #111827; font-size: 14px; font-weight: bold;">Grand Total: <span style="font-size: 16px;">₹${parseFloat(invoice.grandTotal).toFixed(2)}</span></p>
          </div>
          
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 10px; margin-bottom: 20px;">
            <p style="margin: 0; color: #6b7280; font-size: 10px; font-weight: bold;">AMOUNT IN WORDS</p>
            <p style="margin: 5px 0 0 0; color: #111827; font-size: 11px; font-weight: bold;">${invoice.amountInWords || 'Rupees Only'}</p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 9px; margin-top: 20px;">
            This is a computer-generated invoice and does not require a physical signature.
          </div>
        </div>
      `
      
      // Generate PDF using html2pdf
      const opt = {
        margin: 10,
        filename: `${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      }
      
      await html2pdf().set(opt).from(container).save()
      
      // Clean up
      document.body.removeChild(container)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
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
