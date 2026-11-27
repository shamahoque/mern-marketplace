// Auction time helpers shared by the auction pages (D-10), with the BUG-5 regression.
import { calculateTimeLeft, getDateString } from '../../client/auction/auction-time'

describe('getDateString formats a datetime-local value', () => {
  test.each([
    [new Date(2026, 0, 5, 9, 7), '2026-01-05T09:07'],
    [new Date(2026, 8, 30, 23, 59), '2026-09-30T23:59'],
    // BUG-5: October (month index 9) used to come out as "010".
    [new Date(2026, 9, 5, 9, 7), '2026-10-05T09:07'],
    [new Date(2026, 9, 31, 0, 0), '2026-10-31T00:00'],
    [new Date(2026, 11, 25, 18, 30), '2026-12-25T18:30']
  ])('%s -> %s', (date, expected) => {
    expect(getDateString(date)).toBe(expected)
  })
})

describe('calculateTimeLeft', () => {
  test('splits the remaining time into days, hours, minutes and seconds', () => {
    const ms = ((1 * 24 + 2) * 60 * 60 + 3 * 60 + 4) * 1000 + 500
    expect(calculateTimeLeft(new Date(Date.now() + ms))).toEqual({
      days: 1, hours: 2, minutes: 3, seconds: 4, timeEnd: false
    })
  })

  test('reports the end once the date has passed', () => {
    expect(calculateTimeLeft(new Date(Date.now() - 1000))).toEqual({ timeEnd: true })
  })
})
