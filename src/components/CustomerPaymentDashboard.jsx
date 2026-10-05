import { useState, useEffect } from 'react'
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { paymentService } from '../services/paymentService'
import { formatCurrency, formatDate } from '../utils/dateUtils'
import toast from 'react-hot-toast'

const CustomerPaymentDashboard = ({ customerId }) => {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [paymentPlans, setPaymentPlans] = useState([])
  const [installments, setInstallments] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedInstallment, setSelectedInstallment] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: '',
  })

  useEffect(() => {
    if (customerId) {
      fetchPaymentSummary()
    }
  }, [customerId])

  const fetchPaymentSummary = async () => {
    setLoading(true)
    try {
      const response = await paymentService.getCustomerPaymentSummary(customerId)
      if (response.success) {
        setSummary(response.data.summary)
        setPaymentPlans(response.data.paymentPlans)
        setInstallments(response.data.installments)
      }
    } catch (error) {
      toast.error('Failed to load payment summary')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = (installment) => {
    setSelectedInstallment(installment)
    setPaymentForm({
      amount: installment.remainingAmount,
      paymentMethod: 'bank_transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      notes: '',
    })
    setShowPaymentModal(true)
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    
    try {
      const response = await paymentService.recordPayment({
        installmentId: selectedInstallment._id,
        ...paymentForm,
      })
      
      if (response.success) {
        toast.success('Payment recorded successfully')
        setShowPaymentModal(false)
        fetchPaymentSummary()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment')
    }
  }

  const getStatusBadge = (status, isOverdue) => {
    if (isOverdue) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Overdue
        </span>
      )
    }
    
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'} rounded-full`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No payment data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Invoice Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalInvoiceAmount)}</p>
            </div>
            <FiDollarSign size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Paid</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</p>
            </div>
            <FiCheckCircle size={32} className="text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Remaining Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalRemaining)}</p>
            </div>
            <FiArrowDown size={32} className="text-orange-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Next Payment</p>
              <p className="text-2xl font-bold">
                {summary.nextPayment ? formatCurrency(summary.nextPayment.scheduledAmount) : 'N/A'}
              </p>
            </div>
            <FiClock size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Paid Installments</p>
            <p className="text-2xl font-bold text-green-600">{summary.paidInstallments}</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Pending Installments</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.pendingInstallments}</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Overdue Payments</p>
            <p className="text-2xl font-bold text-red-600">{summary.overdueInstallments}</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Progress</p>
            <p className="text-2xl font-bold text-blue-600">{summary.progressPercentage.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Payment Progress</h3>
          <span className="text-sm text-gray-600">{summary.progressPercentage.toFixed(1)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${summary.progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{formatCurrency(summary.totalPaid)} Paid</span>
          <span>{formatCurrency(summary.totalRemaining)} Remaining</span>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h3>
        {installments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payment schedule available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Payment</th>
                  <th>Due Date</th>
                  <th>Scheduled</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((installment) => (
                  <tr key={installment._id} className={installment.isOverdue ? 'bg-red-50' : ''}>
                    <td>{installment.installmentNumber}</td>
                    <td className="font-medium">{installment.paymentName}</td>
                    <td>{formatDate(installment.dueDate)}</td>
                    <td>{formatCurrency(installment.scheduledAmount)}</td>
                    <td className="text-green-600">{formatCurrency(installment.amountPaid)}</td>
                    <td className="text-orange-600">{formatCurrency(installment.remainingAmount)}</td>
                    <td>{getStatusBadge(installment.status, installment.isOverdue)}</td>
                    <td>
                      {installment.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(installment)}
                          className="btn btn-sm btn-primary"
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

      {/* Payment History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        <div className="text-center py-8 text-gray-500">
          Payment history will be displayed here
        </div>
      </div>

      {/* Mark as Paid Modal */}
      {showPaymentModal && selectedInstallment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Record Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">Payment: {selectedInstallment.paymentName}</p>
              <p className="text-sm text-gray-600">Scheduled: {formatCurrency(selectedInstallment.scheduledAmount)}</p>
              <p className="text-sm text-gray-600">Remaining: {formatCurrency(selectedInstallment.remainingAmount)}</p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="input"
                  required
                  max={selectedInstallment.remainingAmount}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="input"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number (Optional)
                </label>
                <input
                  type="text"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  className="input"
                  placeholder="Transaction ID, Cheque Number, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerPaymentDashboard
