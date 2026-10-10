import { useState, useEffect } from 'react'
import { FiDollarSign, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import { paymentService } from '../../services/paymentService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateUtils'
import toast from 'react-hot-toast'

const PaymentListPage = () => {
  const [loading, setLoading] = useState(true)
  const [paymentPlans, setPaymentPlans] = useState([])
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    activePlans: 0
  })

  useEffect(() => {
    fetchPaymentPlans()
  }, [])

  const fetchPaymentPlans = async () => {
    setLoading(true)
    try {
      const response = await paymentService.getAllPaymentPlans()
      if (response.success) {
        setPaymentPlans(response.data.paymentPlans || [])
        setStats(response.data.stats || stats)
      }
    } catch (error) {
      toast.error('Failed to fetch payment plans')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="text-green-600" />
      case 'completed':
        return <FiCheckCircle className="text-green-600" />
      case 'pending':
        return <FiClock className="text-yellow-600" />
      case 'overdue':
        return <FiAlertCircle className="text-red-600" />
      default:
        return <FiClock className="text-gray-400" />
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payment Plans</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <FiDollarSign size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Paid</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</p>
            </div>
            <FiCheckCircle size={32} className="text-green-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalPending)}</p>
            </div>
            <FiClock size={32} className="text-yellow-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Plans</p>
              <p className="text-2xl font-bold">{stats.activePlans}</p>
            </div>
            <FiCalendar size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Payment Plans Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Payment Plans</h2>
        {paymentPlans.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer</th>
                  <th>Plan Type</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentPlans.map((plan) => (
                  <tr key={plan._id}>
                    <td className="font-medium">{plan.invoiceNumber}</td>
                    <td>{plan.customer?.companyName || plan.customer?.name || '-'}</td>
                    <td className="capitalize">{plan.planType.replace('_', ' ')}</td>
                    <td>{formatCurrency(plan.totalAmount)}</td>
                    <td>{formatCurrency(plan.totalPaid)}</td>
                    <td>{formatCurrency(plan.remainingAmount)}</td>
                    <td>
                      <span className={`badge badge-${plan.status === 'active' ? 'green' : plan.status === 'completed' ? 'blue' : 'gray'}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td>{formatDate(plan.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No payment plans found</p>
        )}
      </div>
    </div>
  )
}

export default PaymentListPage
