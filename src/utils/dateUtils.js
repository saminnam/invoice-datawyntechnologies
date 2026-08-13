import { format, parseISO } from 'date-fns'

export function formatDate(date, formatStr = 'dd-MM-yyyy') {
  if (!date) return '-'
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return format(parsedDate, formatStr)
  } catch (error) {
    return '-'
  }
}

export function formatDateTime(date) {
  return formatDate(date, 'dd-MM-yyyy HH:mm')
}

export function isValidDate(date) {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return !isNaN(parsedDate.getTime())
  } catch {
    return false
  }
}
