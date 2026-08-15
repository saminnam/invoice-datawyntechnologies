// Frontend calculation utility for UI preview
// Backend calculations remain authoritative

export function calculateItem(item) {
  const { quantity = 0, rate = 0, discount = 0, discountType = 'fixed', gstRate = 0 } = item
  
  // Ensure numeric values
  const qty = Number(quantity) || 0
  const rt = Number(rate) || 0
  const disc = Number(discount) || 0
  const gst = Number(gstRate) || 0
  
  const subtotal = qty * rt
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * disc) / 100 
    : disc
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = (taxableAmount * gst) / 100
  const total = taxableAmount + taxAmount
  
  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total
  }
}

export function calculateInvoiceTotals(items, invoiceDiscount = 0, invoiceDiscountType = 'fixed', enableGST = true) {
  if (!items || items.length === 0) {
    return {
      items: [],
      subtotal: 0,
      itemDiscount: 0,
      invoiceDiscount: 0,
      taxableAmount: 0,
      totalTax: 0,
      roundOff: 0,
      grandTotal: 0,
      finalAmount: 0
    }
  }
  
  const calculatedItems = items.map(item => {
    // If GST is disabled, set gstRate to 0 for calculation
    const itemWithGST = enableGST ? item : { ...item, gstRate: 0 }
    const itemCalc = calculateItem(itemWithGST)
    return {
      ...item,
      subtotal: itemCalc.subtotal,
      discountAmount: itemCalc.discountAmount,
      taxableAmount: itemCalc.taxableAmount,
      taxAmount: itemCalc.taxAmount,
      total: itemCalc.total
    }
  })
  
  const subtotal = calculatedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const itemDiscount = calculatedItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
  
  const invoiceDiscountAmount = invoiceDiscountType === 'percentage'
    ? (subtotal * invoiceDiscount) / 100
    : invoiceDiscount
  
  const totalDiscount = itemDiscount + invoiceDiscountAmount
  const taxableAmount = Math.max(0, subtotal - totalDiscount)
  
  // Recalculate tax based on the discounted taxable amount
  // Get the average GST rate from all items
  const totalTaxableAmount = calculatedItems.reduce((sum, item) => sum + item.taxableAmount, 0)
  const totalItemTax = calculatedItems.reduce((sum, item) => sum + item.taxAmount, 0)
  
  // Calculate the tax proportionally based on the discount
  const taxRatio = totalTaxableAmount > 0 ? taxableAmount / totalTaxableAmount : 0
  const totalTax = totalItemTax * taxRatio
  
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
