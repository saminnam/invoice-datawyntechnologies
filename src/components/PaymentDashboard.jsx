import { useState, useEffect } from 'react'
import { FiCheckCircle, FiClock, FiAlertCircle, FiDollarSign, FiCalendar, FiCreditCard, FiArrowUp, FiArrowDown, FiX } from 'react-icons/fi'
import { paymentService } from '../services/paymentService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dateUtils'
import toast from 'react-hot-toast'
import PaymentModal from './PaymentModal'

const PaymentDashboard = ({ customerId }) => {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [paymentPlans, setPaymentPlans] = useState([])
  const [installments, setInstallments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedInstallment, setSelectedInstallment] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [activeTab, setActiveTab] = useState('schedule')

  useEffect(() => {
    fetchPaymentData()
  }, [customerId])

  const fetchPaymentData = async () => {
    setLoading(true)
    try {
      const [summaryRes, historyRes] = await Promise.all([
        paymentService.getCustomerPaymentSummary(customerId),
        paymentService.getPaymentHistory(customerId)
      ])

      console.log('Customer ID:', customerId)
      console.log('Payment Summary Response:', summaryRes)
      console.log('Payment History Response:', historyRes)

      if (summaryRes && summaryRes.success) {
        console.log('Summary data:', summaryRes.data)
        setSummary(summaryRes.data.summary)
        setPaymentPlans(summaryRes.data.paymentPlans || [])
        setInstallments(summaryRes.data.installments || [])
        console.log('Payment Plans:', summaryRes.data.paymentPlans?.length || 0)
        console.log('Installments:', summaryRes.data.installments?.length || 0)
      } else {
        console.error('Summary fetch failed or no data:', summaryRes)
        // Even if summary fails, try to set empty arrays
        setSummary(null)
        setPaymentPlans(summaryRes?.data?.paymentPlans || [])
        setInstallments(summaryRes?.data?.installments || [])
      }

      if (historyRes && historyRes.success) {
        setTransactions(historyRes.data || [])
      } else {
        console.error('History fetch failed:', historyRes)
        setTransactions([])
      }
    } catch (error) {
      console.error('Error fetching payment data:', error)
      toast.error('Failed to fetch payment data')
      setSummary(null)
      setPaymentPlans([])
      setInstallments([])
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedInstallment(null)
    fetchPaymentData()
    toast.success('Payment recorded successfully')
  }

  const handleQuickMarkAsPaid = async (installment) => {
    if (!confirm(`Mark "${installment.paymentName}" as fully paid? Amount: ${formatCurrency(installment.remainingAmount)}`)) {
      return
    }

    try {
      await paymentService.recordPayment({
        installmentId: installment._id,
        amount: installment.remainingAmount,
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        notes: 'Quick mark as paid'
      })
      fetchPaymentData()
      toast.success('Payment marked as paid')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as paid')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FiClock /> },
      partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiClock /> },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheckCircle /> },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: <FiAlertCircle /> }
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getProgressPercentage = () => {
    if (!displaySummary || displaySummary.totalInvoiceAmount === 0) return 0
    return Math.round((displaySummary.totalPaid / displaySummary.totalInvoiceAmount) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (paymentPlans.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h3>
        <div className="text-center py-12">
          <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No payment plans found for this customer</p>
          <p className="text-xs text-gray-400 mt-1">Create a proforma invoice with a payment plan to get started</p>
        </div>
      </div>
    )
  }

  // Use summary if available, otherwise calculate from payment plans
  const displaySummary = summary || {
    totalInvoiceAmount: paymentPlans.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
    totalPaid: paymentPlans.reduce((sum, p) => sum + (p.totalPaid || 0), 0),
    totalRemaining: paymentPlans.reduce((sum, p) => sum + (p.remainingAmount || 0), 0),
    pendingInstallments: installments.filter(inst => inst.status === 'pending').length,
    paidInstallments: installments.filter(inst => inst.status === 'paid').length,
    overdueInstallments: installments.filter(inst => inst.isOverdue).length,
    nextPayment: installments.find(inst => inst.status === 'pending' && !inst.isOverdue),
    progressPercentage: 0
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Invoice Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(displaySummary.totalInvoiceAmount)}</p>
            </div>
            <FiDollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(displaySummary.totalPaid)}</p>
            </div>
            <FiArrowUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(displaySummary.totalRemaining)}</p>
            </div>
            <FiArrowDown className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</p>
            </div>
            <FiCreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Payment Progress</span>
          <span className="text-sm text-gray-600">{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{formatCurrency(displaySummary.totalPaid)} Paid</span>
          <span>{formatCurrency(displaySummary.totalRemaining)} Remaining</span>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gray-50">
          <p className="text-sm text-gray-600">Next Payment</p>
          <p className="text-lg font-bold text-gray-900">
            {displaySummary.nextPayment ? formatCurrency(displaySummary.nextPayment.scheduledAmount) : '-'}
          </p>
          {displaySummary.nextPayment && (
            <p className="text-xs text-gray-500">
              Due: {formatDate(displaySummary.nextPayment.dueDate)}
            </p>
          )}
        </div>

        <div className="card bg-gray-50">
          <p className="text-sm text-gray-600">Paid Installments</p>
          <p className="text-lg font-bold text-green-600">{displaySummary.paidInstallments}</p>
        </div>

        <div className="card bg-gray-50">
          <p className="text-sm text-gray-600">Pending Installments</p>
          <p className="text-lg font-bold text-yellow-600">{displaySummary.pendingInstallments}</p>
        </div>

        <div className="card bg-gray-50">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-lg font-bold text-red-600">{displaySummary.overdueInstallments}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment Schedule
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment History
            </button>
          </nav>
        </div>

        {/* Payment Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="mt-6">
            {installments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No installments found</p>
                <p className="text-xs text-gray-400 mt-1">Payment plans: {paymentPlans.length}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remaining</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quick Mark</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {installments.map((installment) => (
                      <tr key={installment._id} className={installment.isOverdue ? 'bg-red-50' : ''}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {installment.installmentNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{installment.paymentName}</div>
                          {installment.isOverdue && (
                            <div className="text-xs text-red-600 font-medium">
                              ⚠ {installment.daysOverdue} days overdue
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(installment.dueDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(installment.scheduledAmount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(installment.amountPaid)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(installment.remainingAmount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {getStatusBadge(installment.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {installment.status !== 'paid' && (
                            <input
                              type="checkbox"
                              checked={installment.status === 'paid'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleQuickMarkAsPaid(installment)
                                }
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {installment.status !== 'paid' && (
                            <button
                              onClick={() => {
                                setSelectedInstallment(installment)
                                setShowPaymentModal(true)
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="mt-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No payment history found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.transactionDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {transaction.installment?.paymentName || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {transaction.paymentMethod.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {transaction.referenceNumber || transaction.transactionId || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {getStatusBadge(transaction.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInstallment && (
        <PaymentModal
          installment={selectedInstallment}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedInstallment(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

export default PaymentDashboard
