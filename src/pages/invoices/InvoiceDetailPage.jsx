import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiPrinter, FiLoader } from 'react-icons/fi'
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
      <div ref={invoiceRef} className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
        {/* Invoice Header */}
        <div className="bg-gray-50 px-8 py-6 print:from-white print:to-white print:bg-white print:border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white rounded-lg p-2 shadow-sm print:shadow-none">
                <img
                  src={companySettings?.logo || defaultLogo}
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 print:text-gray-900">
                <h1 className="text-2xl font-bold">
                  {companySettings?.companyName || 'Datawyn Technologies'}
                </h1>
                <p className="text-sm opacity-90 mt-1">
                  {companySettings?.address?.street && `${companySettings.address.street}, `}
                  {companySettings?.address?.city && `${companySettings.address.city}, `}
                  {companySettings?.address?.state && `${companySettings.address.state} - `}
                  {companySettings?.address?.pincode || '600001'}
                </p>
              </div>
            </div>
            <div className="text-right print:text-gray-900">
              <h2 className="text-3xl font-bold tracking-wide">TAX INVOICE</h2>
              <p className="text-sm opacity-90 mt-1">
                {companySettings?.gstin && `GSTIN: ${companySettings.gstin}`}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 print:p-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Invoice Details */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-gray-500 text-sm w-28">Invoice No:</span>
                <span className="font-semibold text-lg">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-gray-500 text-sm w-28">Date:</span>
                <span className="font-medium">{formatDate(invoice.invoiceDate)}</span>
              </div>
              {invoice.proformaInvoice && (
                <div className="flex items-baseline gap-3">
                  <span className="text-gray-500 text-sm w-28">Proforma Ref:</span>
                  <span className="font-medium">{invoice.proformaInvoice.invoiceNumber}</span>
                </div>
              )}
              <div className="flex items-baseline gap-3">
                <span className="text-gray-500 text-sm w-28">Status:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  invoice.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : invoice.status === 'sent' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:border">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Bill To</h3>
              <p className="font-medium text-gray-900">{invoice.customerSnapshot?.companyName}</p>
              <p className="text-sm text-gray-600 mt-1">{invoice.customerSnapshot?.contactPerson}</p>
              <p className="text-sm text-gray-600">{invoice.customerSnapshot?.email}</p>
              <p className="text-sm text-gray-600">{invoice.customerSnapshot?.phone}</p>
              <p className="text-sm text-gray-600 mt-2">{invoice.customerSnapshot?.billingAddress?.street}</p>
              <p className="text-sm text-gray-600">
                {invoice.customerSnapshot?.billingAddress?.city}, {invoice.customerSnapshot?.billingAddress?.state} - {invoice.customerSnapshot?.billingAddress?.pincode}
              </p>
              {invoice.customerSnapshot?.gstin && (
                <p className="text-sm text-gray-600 mt-1">GSTIN: {invoice.customerSnapshot.gstin}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50">Description</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50 w-20">Qty</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50 w-28">Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50 w-20">GST %</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50 w-28">Taxable</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50 w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 print:hover:bg-white">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{item.productSnapshot?.name}</p>
                      {item.productSnapshot?.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.productSnapshot.description}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700">{item.quantity}</td>
                    <td className="py-4 px-4 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                    <td className="py-4 px-4 text-right text-gray-700">{item.gstRate}%</td>
                    <td className="py-4 px-4 text-right text-gray-700">{formatCurrency(item.taxableAmount)}</td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {(invoice.itemDiscount + invoice.invoiceDiscount) > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">-{formatCurrency(invoice.itemDiscount + invoice.invoiceDiscount)}</span>
                </div>
              )}
              {invoice.cgst > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">CGST</span>
                  <span className="font-medium">{formatCurrency(invoice.cgst)}</span>
                </div>
              )}
              {invoice.sgst > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">SGST</span>
                  <span className="font-medium">{formatCurrency(invoice.sgst)}</span>
                </div>
              )}
              {invoice.igst > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">IGST</span>
                  <span className="font-medium">{formatCurrency(invoice.igst)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Grand Total</span>
                <span className="text-2xl font-bold text-primary-600">{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="bg-primary-50 rounded-lg p-4 mb-8 print:bg-white print:border">
            <p className="text-sm text-gray-600 mb-1">Amount in Words:</p>
            <p className="font-semibold text-gray-900">{invoice.amountInWords || amountInWords(invoice.grandTotal)}</p>
          </div>

          {/* Payment Terms */}
          {invoice.paymentTerms && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-1">Payment Terms:</p>
              <p className="text-sm text-gray-600">{invoice.paymentTerms}</p>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Terms */}
          {invoice.termsAndConditions && (
            <div className="mb-8">
              <p className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions:</p>
              <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:border">
                <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.termsAndConditions}</p>
              </div>
            </div>
          )}

          {/* Bank Details */}
          {companySettings?.bankDetails?.bankName || companySettings?.bankDetails?.accountNumber || companySettings?.bankDetails?.ifsc ? (
            <div className="border-t pt-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-600 rounded"></span>
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companySettings?.bankDetails?.bankName && (
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="font-medium text-gray-900">{companySettings.bankDetails.bankName}</p>
                  </div>
                )}
                {companySettings?.bankDetails?.accountNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium text-gray-900">{companySettings.bankDetails.accountNumber}</p>
                  </div>
                )}
                {companySettings?.bankDetails?.ifsc && (
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="font-medium text-gray-900">{companySettings.bankDetails.ifsc}</p>
                  </div>
                )}
                {companySettings?.bankDetails?.branch && (
                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="font-medium text-gray-900">{companySettings.bankDetails.branch}</p>
                  </div>
                )}
                {companySettings?.bankDetails?.accountHolderName && (
                  <div>
                    <p className="text-sm text-gray-500">Account Holder</p>
                    <p className="font-medium text-gray-900">{companySettings.bankDetails.accountHolderName}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Signature */}
          <div className="flex justify-end">
            <div className="text-center">
              {companySettings?.authorizedSignatory?.signatureImage && (
                <div className="mb-2">
                  <img
                    src={companySettings.authorizedSignatory.signatureImage}
                    alt="Authorized Signature"
                    className="w-32 h-20 object-contain mx-auto"
                  />
                </div>
              )}
              {!companySettings?.authorizedSignatory?.signatureImage && (
                <div className="border-b-2 border-gray-300 w-48 mb-2"></div>
              )}
              <p className="text-sm font-medium text-gray-900">
                {companySettings?.authorizedSignatory?.name || 'Authorized Signatory'}
              </p>
              {companySettings?.authorizedSignatory?.designation && (
                <p className="text-xs text-gray-500 mt-1">
                  {companySettings.authorizedSignatory.designation}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {companySettings?.companyName || 'Datawyn Technologies'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetailPage
