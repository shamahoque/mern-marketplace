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

// Local time as "YYYY-MM-DDTHH:MM", the value format of a datetime-local input.
export const getDateString = (date) => {
  let year = date.getFullYear()
  let day = date.getDate().toString().length === 1 ? '0' + date.getDate() : date.getDate()
  let month = date.getMonth().toString().length === 1 ? '0' + (date.getMonth()+1) : date.getMonth() + 1
  let hours = date.getHours().toString().length === 1 ? '0' + date.getHours() : date.getHours()
  let minutes = date.getMinutes().toString().length === 1 ? '0' + date.getMinutes() : date.getMinutes()
  let dateString = `${year}-${month}-${day}T${hours}:${minutes}`
  return dateString
}
