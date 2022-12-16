import TimeAgo from "javascript-time-ago";

// English.
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

// Create formatter (English).
const timeAgo = new TimeAgo('en-US')

// timeAgo.format(Date.now() - 60 * 1000)
// // "1 minute ago"

export default timeAgo;


