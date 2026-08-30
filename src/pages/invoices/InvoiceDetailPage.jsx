import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiPrinter, FiLoader, FiMail } from 'react-icons/fi'
import { invoiceService } from '../../services/invoiceService'
import { formatDate } from '../../utils/dateUtils'
import { formatCurrency } from '../../utils/formatCurrency'
import { amountInWords } from '../../utils/amountInWords'
import toast from 'react-hot-toast'
import { useCompany } from '../../context/CompanyContext'
import defaultLogo from '../../assets/datawyn-logo.png'
import html2pdf from 'html2pdf.js'

const InvoiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { companySettings } = useCompany()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailData, setEmailData] = useState({
    email: '',
    emailType: 'customer',
    message: ''
  })
  const invoiceRef = useRef(null)

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    setLoading(true)
    try {
      const response = await invoiceService.getInvoice(id)
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
    if (!invoiceRef.current) return
    
    setGeneratingPDF(true)
    try {
      const element = invoiceRef.current
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${invoice.invoiceNumber}.pdf`,
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
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }
      
      await html2pdf().set(opt).from(element).save()
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSendEmail = () => {
    setShowEmailModal(true)
    setEmailData({
      email: invoice?.customerSnapshot?.email || '',
      emailType: 'customer',
      message: ''
    })
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    
    if (!emailData.email) {
      toast.error('Please enter an email address')
      return
    }
    
    setSendingEmail(true)
    try {
      const response = await invoiceService.sendInvoiceEmail(id, emailData)
      if (response.success) {
        toast.success('Invoice sent successfully')
        setShowEmailModal(false)
        fetchInvoice()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email')
    } finally {
      setSendingEmail(false)
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
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
          Back to Invoices
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleSendEmail}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiMail size={20} />
            Send Email
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPDF ? (
              <>
                <FiLoader size={20} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiDownload size={20} />
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiPrinter size={20} />
            Print
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div ref={invoiceRef} className="bg-white shadow-lg overflow-hidden print:shadow-none">
        {/* Invoice Header */}
        <div className="px-8 py-6 print:px-6 print:py-4 border-b-2 border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg p-2 flex-shrink-0">
                <img
                  src={companySettings?.logo || defaultLogo}
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {companySettings?.companyName || 'Datawyn Technologies'}
                </h1>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  {companySettings?.address?.street && (
                    <p>{companySettings.address.street}</p>
                  )}
                  {(companySettings?.address?.city || companySettings?.address?.state || companySettings?.address?.pincode) && (
                    <p>
                      {companySettings?.address?.city && `${companySettings.address.city}, `}
                      {companySettings?.address?.state && `${companySettings.address.state} - `}
                      {companySettings?.address?.pincode || '600001'}
                    </p>
                  )}
                  {companySettings?.email && <p>{companySettings.email}</p>}
                  {companySettings?.phone && <p>{companySettings.phone}</p>}
                  {companySettings?.gstin && <p className="font-medium">GSTIN: {companySettings.gstin}</p>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-black text-white px-4 py-2 rounded-t-lg">
                <h2 className="text-xl font-bold tracking-wider">TAX INVOICE</h2>
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-b-lg border border-gray-200 border-t-0">
                <p className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 print:p-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Invoice Details */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Invoice Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Invoice No:</span>
                  <span className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(invoice.invoiceDate)}</span>
                </div>
                {invoice.proformaInvoice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Proforma Ref:</span>
                    <span className="text-sm font-medium text-gray-900">{invoice.proformaInvoice.invoiceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : invoice.status === 'sent' 
                      ? 'text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{invoice.customerSnapshot?.companyName}</p>
                <p className="text-sm text-gray-600">{invoice.customerSnapshot?.contactPerson}</p>
                <p className="text-sm text-gray-600">{invoice.customerSnapshot?.email}</p>
                <p className="text-sm text-gray-600">{invoice.customerSnapshot?.phone}</p>
                {invoice.customerSnapshot?.billingAddress?.street && (
                  <p className="text-sm text-gray-600">{invoice.customerSnapshot.billingAddress.street}</p>
                )}
                {(invoice.customerSnapshot?.billingAddress?.city || invoice.customerSnapshot?.billingAddress?.state) && (
                  <p className="text-sm text-gray-600">
                    {invoice.customerSnapshot?.billingAddress?.city}, {invoice.customerSnapshot?.billingAddress?.state} - {invoice.customerSnapshot?.billingAddress?.pincode}
                  </p>
                )}
                {invoice.customerSnapshot?.gstin && (
                  <p className="text-sm text-gray-600">GSTIN: {invoice.customerSnapshot.gstin}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50 border-b">Description</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50 border-b w-16">Qty</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50 border-b w-24">Rate</th>
                  {invoice.enableGST && (
                    <>
                      <th className="text-center py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50 border-b w-16">GST %</th>
                      <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50 border-b w-24">Taxable</th>
                    </>
                  )}
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50 border-b w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-4 align-top">
                      <p className="font-medium text-gray-900 text-sm">{item.productSnapshot?.name}</p>
                      {item.productSnapshot?.description && (
                        <p className="text-xs text-gray-500 mt-1">{item.productSnapshot.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 text-sm">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-700 text-sm">{formatCurrency(item.rate)}</td>
                    {invoice.enableGST && (
                      <>
                        <td className="py-3 px-4 text-center text-gray-700 text-sm">{item.gstRate}%</td>
                        <td className="py-3 px-4 text-right text-gray-700 text-sm">{formatCurrency(item.taxableAmount)}</td>
                      </>
                    )}
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 text-sm">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {(invoice.itemDiscount + invoice.invoiceDiscount) > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Discount</span>
                  <span className="text-sm font-medium text-red-600">-{formatCurrency(invoice.itemDiscount + invoice.invoiceDiscount)}</span>
                </div>
              )}
              {invoice.enableGST && (
                <>
                  {invoice.cgst > 0 && (
                    <div className="flex justify-between items-center py-1 border-b border-gray-200">
                      <span className="text-sm text-gray-600">CGST</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.cgst)}</span>
                    </div>
                  )}
                  {invoice.sgst > 0 && (
                    <div className="flex justify-between items-center py-1 border-b border-gray-200">
                      <span className="text-sm text-gray-600">SGST</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.sgst)}</span>
                    </div>
                  )}
                  {invoice.igst > 0 && (
                    <div className="flex justify-between items-center py-1 border-b border-gray-200">
                      <span className="text-sm text-gray-600">IGST</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.igst)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between items-center py-2 border-t-2 border-gray-200 mt-2">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-lg font-bold text-black">{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-8">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount in Words</p>
            <p className="text-sm font-semibold text-gray-900">{invoice.amountInWords || amountInWords(invoice.grandTotal)}</p>
          </div>

          {/* Payment Terms */}
          {invoice.paymentTerms && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Terms</p>
              <p className="text-sm text-gray-600">{invoice.paymentTerms}</p>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Terms */}
          {invoice.termsAndConditions && (
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Terms & Conditions</p>
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-xs text-gray-600 whitespace-pre-line">{invoice.termsAndConditions}</p>
              </div>
            </div>
          )}

          {/* Bank Details */}
          {companySettings?.bankDetails?.bankName || companySettings?.bankDetails?.accountNumber || companySettings?.bankDetails?.ifsc ? (
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {companySettings?.bankDetails?.bankName && (
                  <div>
                    <p className="text-xs text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">{companySettings.bankDetails.bankName}</p>
                  </div>
                )}
                {companySettings?.bankDetails?.accountNumber && (
                  <div>
                    <p className="text-xs text-gray-500">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">{companySettings.bankDetails.accountNumber}</p>
                  </div>
                )}
                {companySettings?.bankDetails?.ifsc && (
                  <div>
                    <p className="text-xs text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">{companySettings.bankDetails.ifsc}</p>
                  </div>
                )}
                {companySettings?.bankDetails?.branch && (
                  <div>
                    <p className="text-xs text-gray-500">Branch</p>
                    <p className="text-sm font-medium text-gray-900">{companySettings.bankDetails.branch}</p>
                  </div>
                )}
                {companySettings?.bankDetails?.accountHolderName && (
                  <div>
                    <p className="text-xs text-gray-500">Account Holder</p>
                    <p className="text-sm font-medium text-gray-900">{companySettings.bankDetails.accountHolderName}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Signature */}
          <div className="flex justify-end mt-12">
            <div className="text-center">
              {companySettings?.authorizedSignatory?.signatureImage && (
                <div className="mb-1">
                  <img
                    src={companySettings.authorizedSignatory.signatureImage}
                    alt="Authorized Signature"
                    className="w-40 h-24 object-contain mx-auto"
                  />
                </div>
              )}
              {!companySettings?.authorizedSignatory?.signatureImage && (
                <div className="border-b-2 border-gray-200 w-48 mb-1"></div>
              )}
              <p className="text-sm font-bold text-gray-900">
                {companySettings?.authorizedSignatory?.name || 'Authorized Signatory'}
              </p>
              {companySettings?.authorizedSignatory?.designation && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {companySettings.authorizedSignatory.designation}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                {companySettings?.companyName || 'Datawyn Technologies'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 print:px-6 print:py-3">
          <p className="text-xs text-gray-500 text-center">
            This is a computer-generated invoice and does not require a physical signature.
          </p>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Invoice via Email</h3>
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Type
                </label>
                <select
                  value={emailData.emailType}
                  onChange={(e) => {
                    const newType = e.target.value
                    setEmailData(prev => ({
                      ...prev,
                      emailType: newType,
                      email: newType === 'customer' ? invoice?.customerSnapshot?.email || '' : prev.email
                    }))
                  }}
                  className="input"
                >
                  <option value="customer">Customer Email</option>
                  <option value="custom">Custom Email</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={emailData.email}
                  onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  required
                  placeholder="Enter email address"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  className="input"
                  rows={3}
                  placeholder="Add a custom message..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="btn btn-secondary"
                  disabled={sendingEmail}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="btn bg-black text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <>
                      <FiLoader size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiMail size={20} />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceDetailPage
