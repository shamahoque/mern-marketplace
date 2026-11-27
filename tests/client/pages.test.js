// Characterization test for D-10, D-11 and D-13. Renders real pages through MainRouter,
// the way server-side rendering does, for a visitor, a signed-in buyer and a signed-in
// seller, and records the HTML. The refactors must leave every page's markup unchanged.
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import theme from '../../client/theme'
import MainRouter from '../../client/MainRouter'

class MemoryStorage {
  constructor () { this.data = {} }
  getItem (key) { return key in this.data ? this.data[key] : null }
  setItem (key, value) { this.data[key] = String(value) }
  removeItem (key) { delete this.data[key] }
}

const users = {
  visitor: null,
  buyer: { token: 'TOKEN', user: { _id: 'u1', name: 'Ann', email: 'ann@example.com', seller: false } },
  seller: { token: 'TOKEN', user: { _id: 'u2', name: 'Sam', email: 'sam@example.com', seller: true } }
}

const cartItem = {
  product: { _id: 'p1', name: 'Unicorn bike', price: 120, quantity: 4, shop: { _id: 's1', name: 'Bike Shop' } },
  quantity: 2,
  shop: 's1'
}

const pages = [
  '/',
  '/cart',
  '/signin',
  '/signup',
  '/users',
  '/user/u1',
  '/user/edit/u1',
  '/shops/all',
  '/order/o1',
  '/seller/shops',
  '/seller/shop/new',
  '/seller/shop/edit/s1',
  '/seller/s1/products/new',
  '/seller/s1/p1/edit',
  '/seller/orders/Bike%20Shop/s1',
  '/myauctions',
  '/auction/new',
  '/auction/edit/a1',
  '/auctions/all'
]

// Material-UI numbers generated class names in creation order (makeStyles-card-12,
// PrivateSwitchBase-root-479). Only the readable part matters for behaviour, so the
// counter is removed. The New Auction form pre-fills the current time, which changes
// every run, so that value is masked too.
const normalize = html => html
  .replace(/\b((?:makeStyles|Private[A-Za-z]+)-[A-Za-z]+)-\d+\b/g, '$1')
  .replace(/value="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}"/g, 'value="(current time)"')

const render = (url) => {
  const context = {}
  const html = ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      <ThemeProvider theme={theme}>
        <MainRouter/>
      </ThemeProvider>
    </StaticRouter>
  )
  return context.url ? 'REDIRECT ' + context.url : normalize(html)
}

let errorSpy
beforeEach(() => {
  global.window = {}
  global.localStorage = new MemoryStorage()
  global.sessionStorage = new MemoryStorage()
  localStorage.setItem('cart', JSON.stringify([cartItem]))
  // React logs a warning for useLayoutEffect during server rendering; it is noise here.
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  delete global.window
  delete global.localStorage
  delete global.sessionStorage
  errorSpy.mockRestore()
})

describe.each(Object.keys(users))('as %s', (who) => {
  beforeEach(() => {
    if (users[who]) sessionStorage.setItem('jwt', JSON.stringify(users[who]))
  })

  test.each(pages)('%s renders the same', (url) => {
    expect(render(url)).toMatchSnapshot()
  })
})
