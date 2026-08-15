import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiEdit, FiArrowLeft, FiDownload, FiCopy, FiPrinter, FiRefreshCw } from 'react-icons/fi'
import { invoiceService } from '../../services/invoiceService'
import { formatDate } from '../../utils/dateUtils'
import { formatCurrency } from '../../utils/formatCurrency'
import { amountInWords } from '../../utils/amountInWords'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '../../config/constants'
import toast from 'react-hot-toast'
import { useCompany } from '../../context/CompanyContext'
import defaultLogo from '../../assets/datawyn-logo.png'

const ProformaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { companySettings } = useCompany()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    setLoading(true)
    try {
      const response = await invoiceService.getProformaInvoice(id)
      if (response.success) {
        setInvoice(response.data)
      }
    } catch (error) {
      toast.error('Failed to fetch invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await invoiceService.downloadPDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF downloaded successfully')
    } catch (error) {
      toast.error('Failed to download PDF')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDuplicate = async () => {
    try {
      const response = await invoiceService.duplicateProformaInvoice(id)
      if (response.success) {
        toast.success('Invoice duplicated successfully')
        navigate(`/proforma/${response.data._id}/edit`)
      }
    } catch (error) {
      toast.error('Failed to duplicate invoice')
    }
  }

  const handleConvert = async () => {
    try {
      const response = await invoiceService.convertToInvoice(id)
      if (response.success) {
        toast.success('Invoice converted successfully')
        navigate(`/invoices/${response.data._id}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to convert invoice')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <button
          onClick={() => navigate('/proforma')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
          Back to Invoices
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/proforma/${id}/edit`)}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiEdit size={20} />
            Edit
          </button>
          <button
            onClick={handleDuplicate}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiCopy size={20} />
            Duplicate
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiDownload size={20} />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiPrinter size={20} />
            Print
          </button>
          {!invoice.convertedInvoice && (
            <button
              onClick={handleConvert}
              className="btn btn-success flex items-center gap-2"
            >
              <FiRefreshCw size={20} />
              Convert to Invoice
            </button>
          )}
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="card bg-white p-8 print:shadow-none print:p-4">
        {/* Company Header */}
        <div className="border-b pb-4 mb-6">
          <div className="flex items-start gap-4">
            {companySettings?.logo && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={companySettings.logo}
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {companySettings?.companyName || 'Datawyn Technologies'}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {companySettings?.address?.street && `${companySettings.address.street}, `}
                {companySettings?.address?.city && `${companySettings.address.city}, `}
                {companySettings?.address?.state && `${companySettings.address.state} - `}
                {companySettings?.address?.pincode || '600001'}
              </p>
              <p className="text-sm text-gray-600">
                {companySettings?.gstin && `GSTIN: ${companySettings.gstin}`}
                {companySettings?.email && ` | Email: ${companySettings.email}`}
                {companySettings?.phone && ` | ${companySettings.phone}`}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">PROFORMA INVOICE</h2>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Invoice Number</p>
            <p className="font-medium">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valid Until</p>
            <p className="font-medium">{invoice.validUntil ? formatDate(invoice.validUntil) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`badge badge-${INVOICE_STATUS_COLORS[invoice.status]}`}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Bill To</h3>
          <p className="font-medium">{invoice.customerSnapshot?.companyName}</p>
          <p className="text-sm text-gray-600">{invoice.customerSnapshot?.contactPerson}</p>
          <p className="text-sm text-gray-600">{invoice.customerSnapshot?.email}</p>
          <p className="text-sm text-gray-600">{invoice.customerSnapshot?.phone}</p>
          <p className="text-sm text-gray-600">{invoice.customerSnapshot?.billingAddress?.street}</p>
          <p className="text-sm text-gray-600">
            {invoice.customerSnapshot?.billingAddress?.city}, {invoice.customerSnapshot?.billingAddress?.state} - {invoice.customerSnapshot?.billingAddress?.pincode}
          </p>
          <p className="text-sm text-gray-600">GSTIN: {invoice.customerSnapshot?.gstin}</p>
        </div>

        {/* Items Table */}
        <div className="table-container mb-6">
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Rate</th>
                <th className="text-right">GST %</th>
                <th className="text-right">Taxable</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.productSnapshot?.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.rate)}</td>
                  <td className="text-right">{item.gstRate}%</td>
                  <td className="text-right">{formatCurrency(item.taxableAmount)}</td>
                  <td className="text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="text-red-600">-{formatCurrency(invoice.itemDiscount + invoice.invoiceDiscount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CGST</span>
              <span>{formatCurrency(invoice.cgst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SGST</span>
              <span>{formatCurrency(invoice.sgst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IGST</span>
              <span>{formatCurrency(invoice.igst)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">Amount in Words:</p>
          <p className="font-medium">{invoice.amountInWords || amountInWords(invoice.grandTotal)}</p>
        </div>

        {/* Payment Terms */}
        {invoice.paymentTerms && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">Payment Terms:</p>
            <p className="font-medium">{invoice.paymentTerms}</p>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">Notes:</p>
            <p className="text-sm">{invoice.notes}</p>
          </div>
        )}

        {/* Terms */}
        {invoice.termsAndConditions && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">Terms & Conditions:</p>
            <p className="text-sm whitespace-pre-line">{invoice.termsAndConditions}</p>
          </div>
        )}

        {/* Bank Details */}
        {companySettings?.bankDetails && (
          <div className="border-t pt-4 mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Bank Details</h3>
            <p className="text-sm text-gray-600">
              Bank: {companySettings.bankDetails.bankName || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              A/C No: {companySettings.bankDetails.accountNumber || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              IFSC: {companySettings.bankDetails.ifsc || 'N/A'}
            </p>
            {companySettings.bankDetails.branch && (
              <p className="text-sm text-gray-600">
                Branch: {companySettings.bankDetails.branch}
              </p>
            )}
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 text-right">
          <p className="text-sm text-gray-600">Authorized Signature</p>
          <div className="border-b-2 border-gray-400 w-48 ml-auto mt-8"></div>
        </div>
      </div>
    </div>
  )
}

export default ProformaDetailPage
