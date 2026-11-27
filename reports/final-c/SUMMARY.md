# Metrics after Member C (client)

Source measured: `c040f7e` on `refactor/client`. Commands, tool versions and inputs are the same as in [COMPARISON.md](../COMPARISON.md): jscpd 4.3.0 (`--min-tokens 50`), es6-plato 1.2.3, madge 6.1.0 and ESLint 8.57.1, all over `server client`. Area C is `client/`. Area figures come from [`area-metrics.js`](area-metrics.js), which uses the same formulas as COMPARISON.md. Running it on `reports/baseline` and `reports/final` reproduces the published C figures exactly (30.51 / 30.44, 69.22 / 69.17, 5206 / 5218), so the third column is directly comparable.

## Overall

| Metric | Baseline | After A+B | After C |
|---|---:|---:|---:|
| Duplication (%) | 13.53 | 12.52 | **8.07** |
| Clone count | 73 | 66 | **46** |

## Area C (client/)

| Metric | Baseline | After A+B | After C | Change (A+B → C) |
|---|---:|---:|---:|---:|
| Duplication (%) | 30.51 | 30.44 | **19.56** | −10.88 |
| Clone pairs touching client | 63 | 63 | **43** | −20 |
| Average maintainability (Plato) | 69.22 | 69.17 | **71.66** | +2.49 |
| SLOC (physical) | 5206 | 5218 | **4690** | −528 |
| Plato files | 52 | 52 | 60 | +8 new modules |

Plato still cannot parse `client/auction/Auction.js`, `client/auction/Auctions.js` and `client/core/Menu.js`, the same as at baseline. They are excluded from maintainability and SLOC in every column.

## Changed files (SLOC / maintainability, after A+B → after C)

| File | Before | After |
|---|---|---|
| `auction/api-auction.js` | 114 / 64.7 | 33 / 83.1 |
| `auth/api-auth.js` | 30 / 66.3 | 13 / 88.7 |
| `order/api-order.js` | 139 / 63.0 | 37 / 79.7 |
| `product/api-product.js` | 134 / 66.0 | 42 / 85.6 |
| `shop/api-shop.js` | 97 / 64.9 | 29 / 83.1 |
| `user/api-user.js` | 110 / 62.8 | 29 / 80.2 |
| `cart/cart-helper.js` | 63 / 44.9 | 44 / 48.4 |
| `auth/auth-helper.js` | 40 / 94.5 | 34 / 94.5 |
| `auth/PrivateRoute.js` | 19 / 83.5 | 22 / 77.1 |
| `shop/NewShop.js` | 123 / 63.5 | 84 / 65.1 |
| `shop/EditShop.js` | 168 / 63.7 | 130 / 64.3 |
| `product/NewProduct.js` | 132 / 61.2 | 90 / 62.7 |
| `product/EditProduct.js` | 161 / 62.2 | 119 / 63.0 |
| `auction/NewAuction.js` | 173 / 60.1 | 123 / 60.4 |
| `auction/EditAuction.js` | 202 / 62.3 | 152 / 63.5 |
| `auction/Timer.js` | 60 / 68.3 | 44 / 72.8 |
| `auth/Signin.js` | 103 / 66.7 | 84 / 69.1 |
| `user/Signup.js` | 108 / 66.6 | 89 / 70.1 |
| `theme.js` | 24 / 58.6 | 40 / 52.2 |

New modules: `lib/api-client.js` 40 / 49.8, `lib/storage.js` 32 / 79.0, `lib/form.js` 26 / 81.5, `auth/AuthContext.js` 40 / 83.4, `components/ImageUpload.js` 30 / 69.1, `components/FormError.js` 20 / 78.3, `auction/auction-time.js` 31 / 70.0, `styles/form-styles.js` 32 / 78.0.

`theme.js` and `api-client.js` score lower because they are now dense configuration and branching code. That is where the knowledge moved from 38 copies, so a lower per-file score there is expected.

## Structural counts

| Count | Before | After |
|---|---:|---:|
| `fetch(` calls outside the API client | 38 | 0 |
| `auth.isAuthenticated()` reads in components | 34 | 0 |
| Hard-coded colour literals in `Menu.js` | 4 | 0 |
| Copies of `calculateTimeLeft` / `getDateString` | 2 / 2 | 1 / 1 |

## Remaining client clones (largest)

| Lines | Location | Location |
|---:|---|---|
| 24 | `auction/EditAuction.js:19-42` | `shop/Shop.js:12-43` (style blocks) |
| 22 | `auction/MyAuctions.js:10-31` | `auction/OpenAuctions.js:6-41` |
| 20 | `auction/MyAuctions.js:41-60` | `user/Profile.js:64-83` |
| 18 | `cart/CartItems.js:47-64` | `order/Order.js:23-40` |
| 17 | `order/ProductOrderEdit.js:131-147` | `order/ProductOrderEdit.js:82-97` |

These sit in list and order pages outside the five client defects. They are left as future work.

## Reproduce

```sh
OUT=reports/final-c
echo '{"parserOptions":{"ecmaVersion":2020,"sourceType":"module","ecmaFeatures":{"jsx":true}},"rules":{"complexity":["warn",1]}}' > /tmp/eslint-complexity.json
npx --yes jscpd@4.3.0 server client --min-tokens 50 --reporters json --output "$OUT/jscpd"
npx --yes es6-plato@1.2.3 -r -d "$OUT/plato" server client
npx --yes eslint@8.57.1 --no-eslintrc -c /tmp/eslint-complexity.json -f json server/ client/ > "$OUT/eslint-complexity.json"
npx --yes madge@6.1.0 --json server/ > "$OUT/madge-server.json"
npx --yes madge@6.1.0 --circular server/ > "$OUT/madge-circular.txt"   # exits 1: cycles exist, as before
node reports/final-c/area-metrics.js
```

Only the JSON outputs are kept, as for `baseline/` and `final/`. Tool versions: jscpd 4.3.0, es6-plato 1.2.3, madge 6.1.0, ESLint 8.57.1, Node v22.13.1.
