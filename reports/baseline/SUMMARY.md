# Baseline metrics

Original snapshot: `baseline` (`bf3fc45`). Commands ran in a plain archive, with no source changes.

## Overall

| Duplication | Clone count | Average maintainability | SLOC (Plato physical) |
|---|---:|---:|---:|
| 13.53% | 73 | 67.73 | 6681 |

## Areas

| Area | Duplication | Average maintainability | SLOC | Plato files |
|---|---:|---:|---:|---:|
| A | 0.00% | 70.18 | 538 | 9 |
| B | 22.10% | 60.08 | 937 | 13 |
| C | 30.51% | 69.22 | 5206 | 52 |

A includes backend entry points, auth/user modules and helpers; B includes domain controllers/models/routes; C is client/. `config/` is part of A ownership but is outside the requested `server client` metric inputs, so no config metrics are included.

Duplication per area is sum of jscpd duplicatedLines / sum of jscpd lines. Overlapping clones are counted as the tool reports them. Maintainability averages are unweighted over successful Plato files; SLOC uses their physical lines, matching Plato total.

## Member B files

| File | SLOC | Maintainability | Max cyclomatic complexity | Fan-out | Fan-in |
|---|---:|---:|---:|---:|---:|
| `server/controllers/auction.controller.js` | 161 | 67.069 | 4 | 3 | 1 |
| `server/controllers/bidding.controller.js` | 31 | 73.75 | 2 | 1 | 1 |
| `server/controllers/order.controller.js` | 90 | 67.979 | 3 | 2 | 1 |
| `server/controllers/product.controller.js` | 213 | 66.244 | 5 | 3 | 2 |
| `server/controllers/shop.controller.js` | 149 | 67.492 | 4 | 3 | 3 |
| `server/models/auction.model.js` | 42 | 48.875 | 1 | 0 | 2 |
| `server/models/order.model.js` | 43 | 44.19 | 1 | 0 | 1 |
| `server/models/product.model.js` | 36 | 52.114 | 1 | 0 | 1 |
| `server/models/shop.model.js` | 25 | 56.369 | 1 | 0 | 1 |
| `server/routes/auction.routes.js` | 35 | 60.149 | 1 | 4 | 1 |
| `server/routes/order.routes.js` | 40 | 57.126 | 1 | 6 | 1 |
| `server/routes/product.routes.js` | 40 | 58.254 | 1 | 4 | 1 |
| `server/routes/shop.routes.js` | 32 | 61.386 | 1 | 4 | 1 |

Fan-out/fan-in count resolved local dependencies in madge, including assets; external npm imports are not counted. Complexity 1 means no function exceeded the threshold (or no functions).

## Clones touching Member B

| First location | Second location | Tokens |
|---|---|---:|
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

The clone locations above preserve jscpd output verbatim, including its anomalous reversed `119-117` range; consult the raw clone fragment rather than interpreting that range as valid source coordinates.

## Coverage and limitations

Plato processed 80 inputs and produced 74 reports. Parser failures (excluded from maintainability/SLOC totals): `client/auction/Auction.js`, `client/auction/Auctions.js`, `client/core/Menu.js`.

ESLint parsing failures: none.

Graphviz was available and the SVG was written. Madge includes transitive client imports reached from the server SSR entry point. 

## Reproduction

Resolved versions: jscpd 4.3.0, es6-plato 1.2.3, madge 6.1.0, ESLint 8.57.1; Node v22.23.1, npm 10.9.8. The repeated run uses the exact pins below.

All metric commands run with cwd `$BASE`. Set `$OUT` to the absolute destination and `$TMP` to a temporary directory outside the repository. No dependencies were installed in the repo.

```sh
REPO=$(git rev-parse --show-toplevel)
BASE_PARENT=$(mktemp -d)
BASE="$BASE_PARENT/mp-baseline"
mkdir -p "$BASE"
git archive baseline | tar -x -C "$BASE"
OUT="$REPO/reports/baseline"
mkdir -p "$OUT"
cd "$BASE"
npx --yes jscpd@4.3.0 server client --min-tokens 50 --reporters json,console --output "$OUT/jscpd"
npx --yes es6-plato@1.2.3 -r -d "$OUT/plato" server client
npx --yes madge@6.1.0 --json server/ > "$OUT/madge-server.json"
npx --yes madge@6.1.0 --circular server/ > "$OUT/madge-circular.txt"
npx --yes madge@6.1.0 --image "$OUT/madge-server.svg" server/
cat > "$BASE_PARENT/eslint-complexity.json" <<'EOF'
{"parserOptions":{"ecmaVersion":2020,"sourceType":"module","ecmaFeatures":{"jsx":true}},"rules":{"complexity":["warn",1]}}
EOF
npx --yes eslint@8.57.1 --no-eslintrc -c "$BASE_PARENT/eslint-complexity.json" -f json server/ client/ > "$OUT/eslint-complexity.json"
cd "$REPO"
rm -rf "$BASE_PARENT"
```

Console and warning output from the runs is not kept in the repository. Tests and build were deliberately skipped for this snapshot-only metrics task.

Verification: all six metric commands were repeated against a fresh archive of `bf3fc45e7782b13dcaefdae8939c621a3c9a65e3`. jscpd, Plato, madge JSON/image and ESLint exited 0. Madge circular exited 1 because it found the seven cycles listed in `madge-circular.txt`. The temporary archive and ESLint configuration were removed afterwards.
