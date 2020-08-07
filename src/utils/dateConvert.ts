import fs from 'fs'

const define = JSON.parse(fs.readFileSync('src/define.json').toString())

const dateConvert = text => {
  const date = new Date()

  const setDate = (val, type) => {
    if (text.match(/전|저|지/)) {
      type === 'Y' ? date.setFullYear(date.getFullYear() - val) : type === 'M' ? date.setMonth(date.getMonth() - val) : date.setDate(date.getDate() - val)
    } else if (text.match(/후|뒤|다/)) {
      type === 'Y' ? date.setFullYear(date.getFullYear() + val) : type === 'M' ? date.setMonth(date.getMonth() + val) : date.setDate(date.getDate() + val)
    } else {
      type === 'Y' ? date.setFullYear(val) : type === 'M' ? date.setMonth(val - 1) : date.setDate(val)
    }
  }

  const setFixedDate = (val, type) => {
    type === 'Y' ? date.setFullYear(val) : type === 'M' ? date.setMonth(val - 1) : date.setDate(val)
  }

  if (text.match(/일|월|달/) && text.match(/[0-9]/)) {
    setDate(Number(text.replace(/[^0-9]/g, '')), text.match(/월|달/) ? 'M' : 'D')
  }

  for (const i in define.dateExp) {
    if (text.match(RegExp(define.dateExp[i]))) {
      setFixedDate(date.getDate() - 3 + Number(i), 'D')
    }
  }

  if (text.match(/주/)) {
    setDate(text.match(/다|저|지/g).length * 7, 'D')
  }

  if (text.match(/달/)) {
    setDate(text.match(/다|저|지/g).length, 'M')
  }

  if (text.match(/해/)) {
    setDate(text.match(/다|저|지/g).length, 'Y')
  }

  if (text.match(/년/)) {
    if (text.match(/[0-9]/)) {
      setDate(Number(text.replace(/[^0-9]/g, '')), 'Y')
    }

    const getFullYear = date.getFullYear()
    for (const i in define.dateYearExp) {
      if (text.match(RegExp(define.dateYearExp[i]))) {
        setFixedDate(getFullYear - 3 + Number(i), 'Y')
      }
    }
  }
  
  if (text.match(/열흘/)) {
    setFixedDate(10, 'D')
  } else if (text.match(/스무날/)) {
    setFixedDate(20, 'D')
  } else if (text.match(/보름/)) {
    setFixedDate(15, 'D')
  } else if (text.match(/그믐/)) {
    setFixedDate(30, 'D')
  } else {
    for (const key in define.dateCentury) {
      if (text.match(RegExp(`${define.dateCentury[key]}|${define.dateCenturyAbbr[key]}`))) {
        if (text.match(/열/)) {
          setFixedDate(Number(key) + 11, 'D')
        } else if (text.match(/스무/)) {
          setFixedDate(Number(key) + 21, 'D')
        } else {
          setFixedDate(Number(key) + 1, 'D')
        }
      }
    }
  }

  for (const i in define.week) {
    if (text.match(RegExp(define.week[i] + '요일'))) {
      setFixedDate(date.getDate() + (Number(i) - date.getDay()), 'D')
    }
  }

  return date
}

export default dateConvert
