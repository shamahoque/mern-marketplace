# Baseline and final comparison

Measurements target source at `b5295dd`; the commands ran in place without a snapshot or worktree. Input directories are exactly `server client` (madge: `server/`), so `tests/`, `reports/` and `node_modules/` are outside metric inputs. No added exclusion flag is needed. Config ownership is A, but `config/` is outside the jscpd/Plato/ESLint inputs. Madge follows local transitive imports, including client SSR modules and config/assets.

Area B includes the domain controllers/models/routes and the new shop/product/order/auction services, upload/ownership middleware, image helper and bidding socket. Area A includes all remaining backend files, including payment and central errors; C is client/. The image helper belongs to B here despite the baseline's blanket helpers ownership definition. This explicit attribution avoids counting extracted domain logic as A work.

Duplication percentages by area sum jscpd duplicatedLines / lines, including tool-reported overlaps. Overall uses jscpd's total percentage. Maintainability is an unweighted average of successful Plato reports; SLOC is physical lines. Fan-in/out count resolved local madge dependencies, including assets, excluding npm packages. Complexity defaults to 1 when no function exceeds the ESLint threshold. This does not imply every file contains a function.

Plato omits `client/auction/Auction.js`, `client/auction/Auctions.js` and `client/core/Menu.js` after parser failures, just as baseline; the runs reported them as parser errors. ESLint has no parsing failures. Graphviz emitted the SVG. Madge circular exits 1 because cycles exist; all other metric commands exited 0. Tool versions are jscpd 4.3.0, es6-plato 1.2.3, madge 6.1.0, ESLint 8.57.1, Node v22.23.1 and npm 10.9.8.


## Overall


| Metric | Baseline | Final | Change |
|---|---|---|---|
| Duplication (%) | 13.53 | 12.52 | -1.01 |
| Clone count | 73 | 66 | -7 |
| Average maintainability | 67.73 | 69.11 | +1.38 |
| SLOC (physical) | 6681 | 6684 | +3 |
| Plato files | 74 | 84 | +10 |

## Areas


| Area / metric | Baseline | Final | Change |
|---|---|---|---|
| A / Duplication (%) | 0.0 | 0.0 | 0.0 |
| A / Average maintainability | 70.18 | 71.53 | +1.35 |
| A / SLOC (physical) | 538 | 504 | -34 |
| A / Plato files | 9 | 12 | +3 |
| B / Duplication (%) | 22.1 | 6.58 | -15.52 |
| B / Average maintainability | 60.08 | 67.51 | +7.43 |
| B / SLOC (physical) | 937 | 962 | +25 |
| B / Plato files | 13 | 20 | +7 |
| C / Duplication (%) | 30.51 | 30.44 | -0.07 |
| C / Average maintainability | 69.22 | 69.17 | -0.05 |
| C / SLOC (physical) | 5206 | 5218 | +12 |
| C / Plato files | 52 | 52 | 0 |

## Member B files

Each cell shows baseline → final (change). A dash indicates absent/new/removed rather than zero. `bidding.controller.js` was removed; its replacement is `bidding.socket.js` plus auction service.

| File | SLOC | Maintainability | Max complexity | Fan-out | Fan-in |
|---|---|---|---|---|---|
| `server/controllers/auction.controller.js` | 161 → 94 (-67) | 67.069 → 69.173 (+2.104) | 4 → 2 (-2) | 3 → 5 (+2) | 1 → 1 (0) |
| `server/controllers/bidding.controller.js` | 31 → — (removed) | 73.75 → — (removed) | 2 → — (removed) | 1 → — (removed) | 1 → — (removed) |
| `server/controllers/order.controller.js` | 90 → 81 (-9) | 67.979 → 71.924 (+3.945) | 3 → 3 (0) | 2 → 3 (+1) | 1 → 1 (0) |
| `server/controllers/product.controller.js` | 213 → 142 (-71) | 66.244 → 70.439 (+4.195) | 5 → 2 (-3) | 3 → 4 (+1) | 2 → 2 (0) |
| `server/controllers/shop.controller.js` | 149 → 82 (-67) | 67.492 → 69.21 (+1.718) | 4 → 2 (-2) | 3 → 5 (+2) | 3 → 3 (0) |
| `server/helpers/image.js` | — → 25 (new) | — → 84.746 (new) | — → 3 (new) | — → 1 (new) | — → 6 (new) |
| `server/middleware/ownership.js` | — → 6 (new) | — → 77.171 (new) | — → 4 (new) | — → 0 (new) | — → 2 (new) |
| `server/middleware/upload.js` | — → 14 (new) | — → 79.392 (new) | — → 2 (new) | — → 1 (new) | — → 3 (new) |
| `server/models/auction.model.js` | 42 → 42 (0) | 48.875 → 48.875 (0.0) | 1 → 1 (0) | 0 → 0 (0) | 2 → 1 (-1) |
| `server/models/order.model.js` | 43 → 43 (0) | 44.19 → 44.19 (0.0) | 1 → 1 (0) | 0 → 0 (0) | 1 → 1 (0) |
| `server/models/product.model.js` | 36 → 36 (0) | 52.114 → 52.114 (0.0) | 1 → 1 (0) | 0 → 0 (0) | 1 → 1 (0) |
| `server/models/shop.model.js` | 25 → 25 (0) | 56.369 → 56.369 (0.0) | 1 → 1 (0) | 0 → 0 (0) | 1 → 2 (+1) |
| `server/routes/auction.routes.js` | 35 → 36 (+1) | 60.149 → 59.763 (-0.386) | 1 → 1 (0) | 4 → 5 (+1) | 1 → 1 (0) |
| `server/routes/order.routes.js` | 40 → 41 (+1) | 57.126 → 56.896 (-0.23) | 1 → 1 (0) | 6 → 7 (+1) | 1 → 1 (0) |
| `server/routes/product.routes.js` | 40 → 41 (+1) | 58.254 → 57.772 (-0.482) | 1 → 1 (0) | 4 → 5 (+1) | 1 → 1 (0) |
| `server/routes/shop.routes.js` | 32 → 33 (+1) | 61.386 → 60.983 (-0.403) | 1 → 1 (0) | 4 → 5 (+1) | 1 → 1 (0) |
| `server/services/auction.service.js` | — → 47 (new) | — → 72.081 (new) | — → 3 (new) | — → 2 (new) | — → 2 (new) |
| `server/services/order.service.js` | — → 36 (new) | — → 80.428 (new) | — → 2 (new) | — → 2 (new) | — → 1 (new) |
| `server/services/product.service.js` | — → 70 (new) | — → 78.955 (new) | — → 4 (new) | — → 2 (new) | — → 2 (new) |
| `server/services/shop.service.js` | — → 33 (new) | — → 82.767 (new) | — → 1 (new) | — → 3 (new) | — → 1 (new) |
| `server/sockets/bidding.socket.js` | — → 35 (new) | — → 76.921 (new) | — → 3 (new) | — → 1 (new) | — → 1 (new) |

## Clones touching Member B

Baseline: 10 clones. Final: 3 clones. These are clone-pair counts, not unique duplicated-line counts. The reversed baseline line range is reproduced from the raw tool output, not corrected.

### Baseline

| First location | Second location | Tokens |
|---|---|---|
| `server/controllers/shop.controller.js:66-72` | `server/controllers/shop.controller.js:8-14` | 86 |
| `server/controllers/product.controller.js:66-72` | `server/controllers/product.controller.js:8-14` | 81 |
| `server/controllers/product.controller.js:78-93` | `server/controllers/product.controller.js:19-34` | 124 |
| `server/controllers/product.controller.js:83-95` | `server/controllers/shop.controller.js:83-95` | 87 |
| `server/controllers/product.controller.js:130-139` | `server/controllers/product.controller.js:119-128` | 74 |
| `server/controllers/auction.controller.js:4-17` | `server/controllers/shop.controller.js:4-17` | 127 |
| `server/controllers/auction.controller.js:63-75` | `server/controllers/shop.controller.js:63-75` | 107 |
| `server/controllers/auction.controller.js:83-95` | `server/controllers/shop.controller.js:83-95` | 88 |
| `server/controllers/auction.controller.js:119-127` | `server/controllers/auction.controller.js:107-117` | 72 |
| `server/controllers/auction.controller.js:129-138` | `server/controllers/auction.controller.js:119-117` | 81 |

### Final

| First location | Second location | Tokens |
|---|---|---|
| `server/controllers/product.controller.js:33-44` | `server/controllers/shop.controller.js:27-38` | 90 |
| `server/controllers/auction.controller.js:9-18` | `server/controllers/shop.controller.js:9-18` | 77 |
| `server/controllers/auction.controller.js:27-38` | `server/controllers/shop.controller.js:27-38` | 91 |

## Dependencies and cycles


| Entry point | Baseline fan-out | Final fan-out | Change |
|---|---|---|---|
| `server/controllers/auction.controller.js` | 3 | 5 | +2 |
| `server/controllers/bidding.controller.js` | 1 | — | removed |
| `server/controllers/order.controller.js` | 2 | 3 | +1 |
| `server/controllers/product.controller.js` | 3 | 4 | +1 |
| `server/controllers/shop.controller.js` | 3 | 5 | +2 |
| `server/routes/order.routes.js` | 6 | 7 | +1 |

### Baseline circular output

```text
- Finding files
Processed 80 files (437ms) (71 warnings)

✖ Found 7 circular dependencies!

1) express.js
2) express.js > routes/auction.routes.js
3) express.js > routes/auth.routes.js
4) express.js > routes/order.routes.js
5) express.js > routes/product.routes.js
6) express.js > routes/shop.routes.js
7) express.js > routes/user.routes.js
```

### Final circular output

```text
Processed 91 files (356ms) 

1) express.js
2) express.js > routes/auction.routes.js
3) express.js > routes/auth.routes.js
4) express.js > routes/order.routes.js
5) express.js > routes/product.routes.js
6) express.js > routes/shop.routes.js
7) express.js > routes/user.routes.js
```

The same seven SSR/express cycles remain. Source layering changes did not remove those existing cycles.

## Defect-to-commit mapping

Hashes were matched to subjects and inspected source changes. Metrics were collected only at baseline and final, so the figures below are endpoint associations, not isolated causal measurements for individual commits.

| Defect | Commit(s) | Change | Metric or behavioral evidence | Quality attribute |
|---|---|---|---|---|
| D-01 | 5be5ea9; f142ed5; 92aa31d | Extracted upload, image/read and ownership functions | B duplication 22.10% → 6.58%; B clone pairs 10 → 3 | Maintainability; modifiability |
| D-02 (partial) | 20812fd | Converted four param loaders and stock-decrease fixed-error handling; ordinary CRUD catches remain | Four-controller physical SLOC changes appear above; repeated ordinary catch blocks remain | Maintainability; reliability of forwarded async errors |
| D-04 | 7b69fae; c196c9f; a1da027; 8a5ebf3 | Moved domain persistence and inventory work to four services | B Plato modules 13 → 20; B SLOC 937 → 962; controllers shrink while new services add lines | Testability; modifiability; layering |
| D-05 | f5988ed | Moved socket transport and bid query to socket/service modules | bidding.controller removed; socket/service fan-out shown above | Maintainability; responsibility separation |
| D-07 (upload) | 350eb52 | Upload failures now use central 400 { error } response | Regression assertions changed; static source metrics do not measure contract consistency | Consistency; reliability |
| BUG-1 | c83db79 | Awaited shop and auction removal | Delete response/document assertions changed; no isolated static metric established | Reliability; correctness |
| BUG-2 | 81faf6a | Returned immediately after four upload error responses | Four regression cases add no-create/no-modify checks; no isolated static metric established | Reliability; correctness |
| BUG-4 | e2e1398 | Rejected null bid result emits only sender rejection | Socket tests check room silence and sender rejection; no isolated static metric established | Reliability |
| D-14 | 993ff8f | Product/shop membership guard added to update/delete/restock | Cross-shop tests assert 403 and unchanged product state | Security |
| D-15 | 86d9545 | Scoped item update with same-element id/shop match | Cross-shop test now asserts 404 and unchanged status | Security |
| D-16 | 826d442 | Validated finite positive amount and atomic auction-window/starting-price filter | Socket tests cover closed/future auctions, nonnumeric and first-bid rules; service max complexity appears above | Reliability; correctness |
| D-17 | b5295dd | Deleted shop products after deleting shop | Cascade test checks only the deleted shop products disappear | Data integrity; reliability |

## Interpretation and limits

Overall SLOC increased by 3 and successful Plato modules by 10; maintainability rose from 67.73 to 69.11. B increased 25 physical lines and seven net modules while average maintainability rose from 60.08 to 67.51 and duplication fell 15.52 percentage points. Extraction adds named boundaries and functions; fewer lines was not a universal result. New module averages and changing file counts also influence unweighted maintainability. Controller metrics improve in several cases, but service/socket complexity and dependency edges must be assessed alongside them. Every B controller has more resolved imports after extraction, and all four routes show slightly lower maintainability as shared middleware/imports are added. More explicit dependencies improve separation without making fan-out decrease.

Global changes include Member A's auth/payment/error work and inherited frontend changes (`53e6b2d`, `5d0d7cc`, `9a13e9a`, confirmed by `git log baseline..HEAD -- client`). C SLOC increased 12 and average maintainability decreased slightly (69.22 → 69.17); those are not attributed to B. Payment and core errors add A modules. Security/reliability fixes are supported by targeted tests, not inferred from a maintainability score or clone reduction.

D-02 is deliberately partial: ordinary CRUD catches remain to retain `dbErrorHandler` behavior for reachable filesystem/network errors. Param loaders and stock fallback use shared wrappers. `orderByID` has no fallback as requested; unusual non-Mongoose errors can consequently use central `Name: message` formatting instead of the prior formatter. Moving `applyImage` inside service calls also brings filesystem exceptions under controller catches, whereas baseline upload processing occurred outside those catches. These limits preclude a claim that every failure path is byte-for-byte preserved.

The cancellation chain restores stock before the order-item check, and the charge chain calls Stripe before that check. The new 404 therefore does not guarantee either side effect was avoided. Shop/product deletion is nontransactional; partial failure or a racing product creation can leave orphaned data. Historical orders retain product references. Bidder identity remains client-supplied without socket authentication; malformed socket objects may merely log an error. These are deferred risks, not guarantees provided by the completed changes.

## Test evidence

| Measure | Baseline | Final | Change |
|---|---:|---:|---:|
| Tests | 0 | 88 | +88 |
| Suites | 0 | 11 | +11 |
| Failed tests | — | 0 | — |

The final `npm test` run passed all 88 tests in 11 suites, with no open-handle warning. Test summaries provide behavioral evidence for covered cases, not exhaustive equivalence. Characterization tests were added in `3638fa0`. BUG-1, BUG-4, D-14 and D-15 intentionally changed old assertions; BUG-2, D-16 and D-17 added regression cases; optional D-07 intentionally changed upload error keys. Existing Member A test assertions were retained.

Verification used a local dependency workaround installing `@babel/core@7.29.0` without saving; package manifests and lockfiles remain unchanged. The workaround affects the local verification environment, not the measured source. No repository dependency changes were made by this metrics step.

## Reproduction

The metric command versions and arguments match the baseline; only the destination and temporary ESLint configuration path differ. Tests and reports remain outside source inputs. The raw reports are in `final/`; baseline reports remain unchanged.

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

