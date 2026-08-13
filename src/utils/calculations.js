// Frontend calculation utility for UI preview
// Backend calculations remain authoritative

export function calculateItem(item) {
  const { quantity = 0, rate = 0, discount = 0, discountType = 'fixed', gstRate = 0 } = item
  
  const subtotal = quantity * rate
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : discount
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = (taxableAmount * gstRate) / 100
  const total = taxableAmount + taxAmount
  
  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total
  }
}

export function calculateInvoiceTotals(items, invoiceDiscount = 0, invoiceDiscountType = 'fixed') {
  const calculatedItems = items.map(item => {
    const itemCalc = calculateItem(item)
    return {
      ...item,
      taxableAmount: itemCalc.taxableAmount,
      taxAmount: itemCalc.taxAmount,
      total: itemCalc.total
    }
  })
  
  const subtotal = calculatedItems.reduce((sum, item) => sum + item.subtotal, 0)
  const itemDiscount = calculatedItems.reduce((sum, item) => sum + item.discountAmount, 0)
  
  const invoiceDiscountAmount = invoiceDiscountType === 'percentage'
    ? (subtotal * invoiceDiscount) / 100
    : invoiceDiscount
  
  const totalDiscount = itemDiscount + invoiceDiscountAmount
  const taxableAmount = Math.max(0, subtotal - totalDiscount)
  
  const totalTax = calculatedItems.reduce((sum, item) => sum + item.taxAmount, 0)
  const grandTotal = taxableAmount + totalTax
  const roundOff = Math.round(grandTotal) - grandTotal
  const finalAmount = Math.round(grandTotal)
  
  return {
    items: calculatedItems,
    subtotal,
    itemDiscount,
    invoiceDiscount: invoiceDiscountAmount,
    taxableAmount,
    totalTax,
    roundOff,
    grandTotal,
    finalAmount
  }
}

export function calculateGST(taxableAmount, gstRate, isInterState = false) {
  const totalTax = (taxableAmount * gstRate) / 100
  
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      totalTax
    }
  } else {
    const halfTax = totalTax / 2
    return {
      cgst: halfTax,
      sgst: halfTax,
      igst: 0,
      totalTax
    }
  }
}
