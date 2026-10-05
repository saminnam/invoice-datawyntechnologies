import { useState } from 'react'
import { FiX, FiUpload, FiDollarSign, FiCalendar, FiCreditCard, FiFileText } from 'react-icons/fi'
import { paymentService } from '../services/paymentService'
import { formatCurrency } from '../utils/formatCurrency'
import toast from 'react-hot-toast'

const PaymentModal = ({ installment, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: installment.remainingAmount,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: '',
    receiptUrl: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (formData.amount > installment.remainingAmount) {
      toast.error(`Amount cannot exceed remaining amount of ${formatCurrency(installment.remainingAmount)}`)
      return
    }

    setLoading(true)
    try {
      await paymentService.recordPayment({
        installmentId: installment._id,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
        receiptUrl: formData.receiptUrl
      })

      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Installment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{installment.paymentName}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Scheduled Amount</p>
                <p className="font-medium">{formatCurrency(installment.scheduledAmount)}</p>
              </div>
              <div>
                <p className="text-gray-600">Remaining Amount</p>
                <p className="font-medium text-orange-600">{formatCurrency(installment.remainingAmount)}</p>
              </div>
              <div>
                <p className="text-gray-600">Due Date</p>
                <p className="font-medium">{new Date(installment.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium capitalize">{installment.status}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDollarSign className="text-gray-400" />
                </div>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="input pl-10"
                  placeholder="0.00"
                  min="0"
                  max={installment.remainingAmount}
                  step="0.01"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {formatCurrency(installment.remainingAmount)}
              </p>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCreditCard className="text-gray-400" />
                </div>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="input pl-10"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction / Reference ID
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="input"
                placeholder="e.g., TXN123456789"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FiFileText className="text-gray-400" />
                </div>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input pl-10"
                  rows={3}
                  placeholder="Optional notes about this payment..."
                />
              </div>
            </div>

            {/* Receipt Upload (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Receipt (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUpload className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.receiptUrl}
                  onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  className="input pl-10"
                  placeholder="Receipt URL"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the URL of the uploaded receipt
              </p>
            </div>

            {/* Warning for partial payment */}
            {formData.amount < installment.remainingAmount && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  ⚠️ This is a partial payment. The installment status will be marked as "Partial".
                  Remaining amount: {formatCurrency(installment.remainingAmount - formData.amount)}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn bg-blue-600 text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
