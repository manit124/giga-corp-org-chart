const short = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const full = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export const money = (n) => short.format(n)
export const moneyFull = (n) => full.format(n)
export const num = (n) => n.toLocaleString('en-US')
export const ratio = (r) => (r == null ? '—' : `${r.toFixed(1)} : 1`)

export const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
