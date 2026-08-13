export function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined) return '₹0.00'
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}

export function formatNumber(amount) {
  if (amount === null || amount === undefined) return '0'
  
  return new Intl.NumberFormat('en-IN').format(amount)
}
