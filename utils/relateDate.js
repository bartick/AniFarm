'use strict';
const TimeAgo = require('javascript-time-ago')

// English.
const en = require('javascript-time-ago/locale/en')

TimeAgo.addDefaultLocale(en)

// Create formatter (English).
const timeAgo = new TimeAgo('en-US')

// timeAgo.format(Date.now() - 60 * 1000)
// // "1 minute ago"

module.exports = timeAgo