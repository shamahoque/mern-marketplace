# Final metrics

Measurements target source at `b5295dd`; the commands ran in place without a snapshot or worktree. Input directories are exactly `server client` (madge: `server/`), so `tests/`, `reports/` and `node_modules/` are outside metric inputs. No added exclusion flag is needed. Config ownership is A, but `config/` is outside the jscpd/Plato/ESLint inputs. Madge follows local transitive imports, including client SSR modules and config/assets.

Area B includes the domain controllers/models/routes and the new shop/product/order/auction services, upload/ownership middleware, image helper and bidding socket. Area A includes all remaining backend files, including payment and central errors; C is client/. The image helper belongs to B here despite the baseline's blanket helpers ownership definition. This explicit attribution avoids counting extracted domain logic as A work.

Duplication percentages by area sum jscpd duplicatedLines / lines, including tool-reported overlaps. Overall uses jscpd's total percentage. Maintainability is an unweighted average of successful Plato reports; SLOC is physical lines. Fan-in/out count resolved local madge dependencies, including assets, excluding npm packages. Complexity defaults to 1 when no function exceeds the ESLint threshold. This does not imply every file contains a function.

Plato omits `client/auction/Auction.js`, `client/auction/Auctions.js` and `client/core/Menu.js` after parser failures, just as baseline; the runs reported them as parser errors. ESLint has no parsing failures. Graphviz emitted the SVG. Madge circular exits 1 because cycles exist; all other metric commands exited 0. Tool versions are jscpd 4.3.0, es6-plato 1.2.3, madge 6.1.0, ESLint 8.57.1, Node v22.23.1 and npm 10.9.8.

## Overall

| Duplication (%) | Clone count | Average maintainability | SLOC (physical) | Plato files |
|---|---|---|---|---|
| 12.52 | 66 | 69.11 | 6684 | 84 |


## Areas


| Area | Duplication (%) | Average maintainability | SLOC | Plato files |
|---|---|---|---|---|
| A | 0.0 | 71.53 | 504 | 12 |
| B | 6.58 | 67.51 | 962 | 20 |
| C | 30.44 | 69.17 | 5218 | 52 |


## Member B files


| File | SLOC | Maintainability | Max complexity | Fan-out | Fan-in |
|---|---|---|---|---|---|
| `server/controllers/auction.controller.js` | 94 | 69.173 | 2 | 5 | 1 |
| `server/controllers/order.controller.js` | 81 | 71.924 | 3 | 3 | 1 |
| `server/controllers/product.controller.js` | 142 | 70.439 | 2 | 4 | 2 |
| `server/controllers/shop.controller.js` | 82 | 69.21 | 2 | 5 | 3 |
| `server/helpers/image.js` | 25 | 84.746 | 3 | 1 | 6 |
| `server/middleware/ownership.js` | 6 | 77.171 | 4 | 0 | 2 |
| `server/middleware/upload.js` | 14 | 79.392 | 2 | 1 | 3 |
| `server/models/auction.model.js` | 42 | 48.875 | 1 | 0 | 1 |
| `server/models/order.model.js` | 43 | 44.19 | 1 | 0 | 1 |
| `server/models/product.model.js` | 36 | 52.114 | 1 | 0 | 1 |
| `server/models/shop.model.js` | 25 | 56.369 | 1 | 0 | 2 |
| `server/routes/auction.routes.js` | 36 | 59.763 | 1 | 5 | 1 |
| `server/routes/order.routes.js` | 41 | 56.896 | 1 | 7 | 1 |
| `server/routes/product.routes.js` | 41 | 57.772 | 1 | 5 | 1 |
| `server/routes/shop.routes.js` | 33 | 60.983 | 1 | 5 | 1 |
| `server/services/auction.service.js` | 47 | 72.081 | 3 | 2 | 2 |
| `server/services/order.service.js` | 36 | 80.428 | 2 | 2 | 1 |
| `server/services/product.service.js` | 70 | 78.955 | 4 | 2 | 2 |
| `server/services/shop.service.js` | 33 | 82.767 | 1 | 3 | 1 |
| `server/sockets/bidding.socket.js` | 35 | 76.921 | 3 | 1 | 1 |

## Clones touching Member B

| First location | Second location | Tokens |
|---|---|---|
| `server/controllers/product.controller.js:33-44` | `server/controllers/shop.controller.js:27-38` | 90 |
| `server/controllers/auction.controller.js:9-18` | `server/controllers/shop.controller.js:9-18` | 77 |
| `server/controllers/auction.controller.js:27-38` | `server/controllers/shop.controller.js:27-38` | 91 |

## Reproduction

```sh
REPO=$(git rev-parse --show-toplevel)
cd "$REPO"
OUT="$REPO/reports/final"
mkdir -p "$OUT"
npx --yes jscpd@4.3.0 server client --min-tokens 50 --reporters json,console --output "$OUT/jscpd"
npx --yes es6-plato@1.2.3 -r -d "$OUT/plato" server client
npx --yes madge@6.1.0 --json server/ > "$OUT/madge-server.json"
npx --yes madge@6.1.0 --circular server/ > "$OUT/madge-circular.txt"
npx --yes madge@6.1.0 --image "$OUT/madge-server.svg" server/
cat > /tmp/member-b-eslint-complexity.json <<'EOF'
{"parserOptions":{"ecmaVersion":2020,"sourceType":"module","ecmaFeatures":{"jsx":true}},"rules":{"complexity":["warn",1]}}
EOF
npx --yes eslint@8.57.1 --no-eslintrc -c /tmp/member-b-eslint-complexity.json -f json server/ client/ > "$OUT/eslint-complexity.json"
npm test
```

Verification: `npm test` passed 11 suites and 88 tests (0 failed; 0 snapshots), with no open-handle warning. The metric step did not rerun the server bundle build, as specified.
