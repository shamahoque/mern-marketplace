import {local} from './../lib/storage'

const CART = 'cart'

const cart = {
  itemTotal() {
    return local.read(CART, []).length
  },
  addItem(item, cb) {
    if (!local.available()) return
    const items = local.read(CART, [])
    items.push({
      product: item,
      quantity: 1,
      shop: item.shop._id
    })
    local.write(CART, items)
    cb()
  },
  updateCart(itemIndex, quantity) {
    if (!local.available()) return
    const items = local.read(CART, [])
    items[itemIndex].quantity = quantity
    local.write(CART, items)
  },
  getCart() {
    return local.read(CART, [])
  },
  removeItem(itemIndex) {
    const items = local.read(CART, [])
    if (!local.available()) return items
    items.splice(itemIndex, 1)
    local.write(CART, items)
    return items
  },
  emptyCart(cb) {
    if (!local.available()) return
    local.remove(CART)
    cb()
  }
}

export default cart
