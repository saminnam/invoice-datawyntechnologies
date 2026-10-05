import api from './api'

export const paymentService = {
  // Create Payment Plan
  createPaymentPlan: async (data) => {
    const response = await api.post('/payments', data)
    return response.data
  },

  // Get Payment Plan by Invoice
  getPaymentPlanByInvoice: async (invoiceType, invoiceId) => {
    const response = await api.get(`/payments/invoice/${invoiceType}/${invoiceId}`)
    return response.data
  },

  // Record Payment
  recordPayment: async (data) => {
    const response = await api.post('/payments/record', data)
    return response.data
  },

  // Get Payment History
  getPaymentHistory: async (customerId) => {
    const response = await api.get(`/payments/history/${customerId}`)
    return response.data
  },

  // Get Customer Payment Summary
  getCustomerPaymentSummary: async (customerId) => {
    const response = await api.get(`/payments/summary/${customerId}`)
    return response.data
  },

  // Update Payment Plan
  updatePaymentPlan: async (id, data) => {
    const response = await api.put(`/payments/${id}`, data)
    return response.data
  },

  // Delete Payment Plan
  deletePaymentPlan: async (id) => {
    const response = await api.delete(`/payments/${id}`)
    return response.data
  },
}
