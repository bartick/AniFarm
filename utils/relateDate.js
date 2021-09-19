const TimeAgo = require('javascript-time-ago')

// English.
const en = require('javascript-time-ago/locale/en')

TimeAgo.addDefaultLocale(en)

// Create formatter (English).
const timeAgo = new TimeAgo('en-US')

// timeAgo.format(new Date())
// // "just now"

// timeAgo.format(Date.now() - 60 * 1000)
// // "1 minute ago"

// timeAgo.format(Date.now() - 2 * 60 * 60 * 1000)
// // "2 hours ago"

// timeAgo.format(Date.now() - 24 * 60 * 60 * 1000)
// // "1 day ago"

module.exports = timeAgo