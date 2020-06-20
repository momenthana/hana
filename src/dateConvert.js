const fs = require('fs')

const define = JSON.parse(fs.readFileSync('src/define.json').toString())

const index = (text) => {
  const date = new Date()

  const setDate = (val, type) => {
    if (text.includes('전')) {
      type === 'Y' ? date.setFullYear(date.getFullYear() - val) : type === 'M' ? date.setMonth(date.getMonth() - val) : date.setDate(date.getDate() - val)
    } else if (text.match(/(후|뒤)/)) {
      type === 'Y' ? date.setFullYear(date.getFullYear() + val) : type === 'M' ? date.setMonth(date.getMonth() + val) : date.setDate(date.getDate() + val)
    } else {
      type === 'Y' ? date.setFullYear(val) : type === 'M' ? date.setMonth(val - 1) : date.setDate(val)
    }
  }

  if (text.includes('일') && text.replace(/[^{0-9}]/gi, '')) {
    setDate(Number(text.replace(/[^{0-9}]/gi, '')))
  }

  for (const i in define.week) {
    if (text.match(RegExp(define.week[i] + '요일'))) {
      date.setDate(date.getDate() + (Number(i) - date.getDay()))
    }
  }

  if (text.match(/(월|달)/) && text.replace(/[^{0-9}]/gi, '')) {
    setDate(Number(text.replace(/[^{0-9}]/gi, '')), 'M')
  }

  if (text.includes('주')) {
    if ((text.match(/다/g) || []).length) {
      date.setDate(date.getDate() + text.match(/다/g).length * 7)
    } else if ((text.match(/지/g) || []).length) {
      date.setDate(date.getDate() - text.match(/지/g).length * 7)
    }
  }

  if (text.includes('해')) {
    if ((text.match(/다/g) || []).length) {
      date.setDate(date.getFullYear() + text.match(/다/g).length, 'Y')
    } else if ((text.match(/지/g) || []).length) {
      date.setDate(date.getFullYear() - text.match(/지/g).length, 'Y')
    }
  }

  for (const i in define.dateExp) {
    if (text.match(RegExp(define.dateExp[i]))) {
      date.setDate(date.getDate() - 3 + Number(i))
    }
  }

  if (text.includes('년')) {
    setDate(Number(text.replace(/[^{0-9}]/gi, '')), 'Y')
    for (const i in define.dateYearExp) {
      if (text.match(RegExp(define.dateYearExp[i]))) {
        date.setDate(date.getFullYear() - 3 + Number(i), 'Y')
      }
    }
  } else if (text.includes('열흘')) {
    setDate(10)
  } else if (text.includes('스무날')) {
    setDate(20)
  } else if (text.includes('보름')) {
    setDate(15)
  } else if (text.includes('그믐')) {
    setDate(30)
  } else {
    for (const key in define.dateCentury) {
      if (text.includes(define.dateCentury[key]) || text.includes(define.dateCenturyAbbr[key])) {
        if (text.includes('열')) {
          setDate(Number(key) + 11)
        } else if (text.includes('스무')) {
          setDate(Number(key) + 21)
        } else {
          setDate(Number(key) + 1)
        }

        return date
      }
    }
  }

  return date
}

module.exports = index
