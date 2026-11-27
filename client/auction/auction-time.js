// Time helpers shared by the auction pages (D-10). Each was previously copied
// into two components: calculateTimeLeft into Auctions and Timer,
// getDateString into NewAuction and EditAuction.

// Days, hours, minutes and seconds until `date`, or {timeEnd: true} once it has passed.
export const calculateTimeLeft = (date) => {
  const difference = date - new Date()
  let timeLeft = {}

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      timeEnd: false
    }
  } else {
    timeLeft = {timeEnd: true}
  }
  return timeLeft
}

const pad = (n) => String(n).padStart(2, '0')

// Local time as "YYYY-MM-DDTHH:MM", the value format of a datetime-local input.
// BUG-5: the month used to be padded by checking getMonth() (0-based) instead of
// the month number itself, so October came out as "010" and browsers rejected it.
export const getDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
