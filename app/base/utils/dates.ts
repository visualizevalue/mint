import { DateTime } from 'luxon'

export const formatDate = (date: string) => {
  return DateTime.fromISO(date)
    .setLocale('en')
    .toLocaleString(DateTime.DATE_MED)
}

export const formatDateTime = (date: string) => {
  return DateTime.fromISO(date).setLocale('en-US').toLocaleString({ year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
}

export const formatTime = (date: string) => {
  return DateTime.fromISO(date).setLocale('en-US').toLocaleString({ hour: 'numeric', minute: 'numeric' })
}

export const timeAgo = (date: string) => {
  const parsed = DateTime.fromISO(date)

  return DateTime.now().diff(parsed).as('days') > 2
    ? formatDate(date)
    : parsed.toRelative({ style: 'short', locale: 'us' })
}
