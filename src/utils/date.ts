import dayjs from 'dayjs'

export const unixToStringFormat = (str?: string) => {
  return str ? dayjs.unix(Number(str)).format('YYYY年MM月DD日 hh:mm:ss') : '-'
}

export const stringDateToStringFormat = (str?: string) => {
  return str ? dayjs(str).format('YYYY年MM月DD日 hh:mm:ss') : '-'
}
