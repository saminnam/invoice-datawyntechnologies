import api from './api'

export const invoiceService = {
  getProformaInvoices: async (params = {}) => {
    const response = await api.get('/proforma', { params })
    return response.data
  },

  getProformaInvoice: async (id) => {
    const response = await api.get(`/proforma/${id}`)
    return response.data
  },

  createProformaInvoice: async (invoiceData) => {
    const response = await api.post('/proforma', invoiceData)
    return response.data
  },

  updateProformaInvoice: async (id, invoiceData) => {
    const response = await api.put(`/proforma/${id}`, invoiceData)
    return response.data
  },

  deleteProformaInvoice: async (id) => {
    const response = await api.delete(`/proforma/${id}`)
    return response.data
  },

  duplicateProformaInvoice: async (id) => {
    const response = await api.post(`/proforma/${id}/duplicate`)
    return response.data
  },

  updateInvoiceStatus: async (id, status) => {
    const response = await api.patch(`/proforma/${id}/status`, { status })
    return response.data
  },

  convertToInvoice: async (id) => {
    const response = await api.post(`/proforma/${id}/convert`)
    return response.data
  },

  downloadPDF: async (id) => {
    const response = await api.get(`/proforma/${id}/pdf`, {
      responseType: 'blob'
    })
    return response
  },

  getInvoices: async (params = {}) => {
    const response = await api.get('/invoices', { params })
    return response.data
  },

  getInvoice: async (id) => {
    const response = await api.get(`/invoices/${id}`)
    return response.data
  },

  downloadInvoicePDF: async (id) => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    })
    return response
  },

  deleteInvoice: async (id) => {
    const response = await api.delete(`/invoices/${id}`)
    return response.data
  },
}
