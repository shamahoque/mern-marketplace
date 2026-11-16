# Architecture and request lifecycle

Phase 1 (system understanding) for the backend core. Diagrams describe the original system at tag
`baseline` (commit `bf3fc45`); the last section shows the same views after the `refactor/backend-core`
changes, for the Phase 4 before/after comparison. Diagrams are Mermaid: GitHub renders them, and
<https://mermaid.live> exports PNG/SVG for the report.

## 1. Architectural style

A **layered client-server monolith**, organised **by feature** (user, auth, shop, product, order,
auction) on both sides. One Node process serves three things:

1. the REST API (`/api/*`, `/auth/*`),
2. the React app, server-side rendered for every other URL and then hydrated in the browser,
3. a Socket.io channel for live auction bidding.

Within the API, the layers are **routes → middleware chain → controller → Mongoose model → MongoDB**.
There is no service layer at baseline: controllers mix HTTP handling, business rules and data access
(D-04), and `user.controller.js` also talks to Stripe (D-03).

## 2. Component overview (baseline)

```mermaid
flowchart LR
  subgraph Browser["Browser"]
    direction TB
    Pages["React pages<br/>user · shop · product · cart · order · auction"]
    Api["api-*.js<br/>fetch wrappers"]
    Store["auth-helper (sessionStorage JWT)<br/>cart-helper (localStorage cart)"]
    SockC["Bidding.js<br/>socket.io-client"]
    Pages --> Api
    Pages --> Store
    Pages --> SockC
  end

  subgraph Server["Node process (server.js)"]
    direction TB
    MW["express.js global middleware<br/>bodyParser · cookieParser · compress · helmet · cors · static /dist"]
    Routers["Feature routers<br/>*.routes.js"]
    Guards["Guard middleware<br/>requireSignin · hasAuthorization · isOwner · isSeller<br/>router.param loaders: userByID, shopByID, ..."]
    Ctrl["Controllers<br/>*.controller.js"]
    SSR["SSR catch-all  GET *<br/>renders client/MainRouter"]
    ErrH["Error handler<br/>(JWT errors, parse errors)"]
    Bid["bidding.controller.js<br/>Socket.io server"]
    Models["Mongoose models<br/>User · Shop · Product · Order · Auction"]
    MW --> Routers --> Guards --> Ctrl --> Models
    MW --> SSR
    Guards -. "next(err)" .-> ErrH
    Bid --> Models
  end

  Api -- "REST + JWT (Authorization: Bearer)" --> MW
  SockC <-- "join room / new bid" --> Bid
  Ctrl -- "customers, charges, Connect OAuth" --> Stripe[("Stripe API")]
  Models --> DB[("MongoDB")]
  Config["config/config.js<br/>JWT secret, Stripe keys (hard-coded, D-06)"] -.-> Ctrl
  Config -. "imported by Cart.js / Profile.js:<br/>bundled into the browser" .-> Pages
```

Notes:

- `config/config.js` is imported by both server and client code, so webpack shipped the whole config,
  including the Stripe secret key, to every browser (D-06).
- `client/auction/Bidding.js` opens a socket at import time, which also happens on the server during
  SSR (found while setting up tests).
- `bidding.controller.js` is not an HTTP controller: it starts the Socket.io server and writes bids to
  the database (D-05). Its `new bid` event has **no authentication**: any socket client can bid as any
  `bidder` id it sends.

## 3. Request lifecycle

### 3.1 Order of processing in Express

```mermaid
flowchart TD
  A["HTTP request"] --> B["bodyParser.json / urlencoded"]
  B -- "malformed JSON" --> ERR
  B --> C["cookieParser → compress → helmet → cors"]
  C --> D{"/dist/* ?"}
  D -- yes --> S["express.static(dist)"]
  D -- no --> E{"Matches a feature router?"}
  E -- no --> SSR["GET *  → SSR React render<br/>303 redirect if PrivateRoute"]
  E -- yes --> P["router.param loaders<br/>userByID · shopByID · productByID · orderByID · auctionByID<br/>set req.profile / req.shop / ..."]
  P -- "not found / bad id → 400 sent directly" --> R400["400 {error}"]
  P --> G["Route chain (left to right)<br/>requireSignin → hasAuthorization / isOwner / isSeller → ..."]
  G -- "no / bad JWT" --> ERR
  G -- "not owner → 403 sent directly" --> R403["403 {error}"]
  G --> H["Final handler<br/>controller: Mongoose query, JSON response"]
  H -- "try/catch in every handler (D-02)<br/>→ 400 sent directly" --> R400
  H --> OK["200 JSON"]
  ERR["Global error handler (express.js)<br/>UnauthorizedError → 401<br/>anything else → 400 'Name: message'"]
```

Two details that matter for behaviour:

- **Param loaders run before the route chain.** `router.param('userId', userByID)` executes before
  `requireSignin`, so `GET /api/users/<unknown id>` answers `400 User not found` even without a token.
- At baseline almost every error is answered **inside** the middleware or controller that hit it; the
  global handler only sees express-jwt and body-parser errors. Each controller builds its own error
  body, which is why codes and shapes drifted (`'400'` strings, `{message}` vs `{error}`, D-07).

### 3.2 Example: a seller updates their profile

`PUT /api/users/:userId` with chain `requireSignin → hasAuthorization → update`.

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser (EditProfile.js)
  participant E as Express
  participant P as userByID (param)
  participant J as requireSignin (express-jwt)
  participant A as hasAuthorization
  participant U as userCtrl.update
  participant M as User model / MongoDB

  B->>E: PUT /api/users/42  Authorization: Bearer JWT  {name}
  E->>P: id = 42
  P->>M: User.findById(42)
  alt not found / bad id
    P-->>B: 400 {error: "User not found" / "Could not retrieve user"}
  end
  P->>J: req.profile = user
  J->>J: verify JWT with config.jwtSecret
  alt missing / invalid token
    J-->>B: 401 via global error handler
  end
  J->>A: req.auth = {_id}
  A->>A: req.profile._id == req.auth._id ?
  alt different user
    A-->>B: 403 {error: "User is not authorized"}
  end
  A->>U: next()
  U->>M: extend(profile, body); save()
  alt validation error
    U-->>B: 400 {error: dbErrorHandler message}
  end
  U-->>B: 200 user (hashed_password, salt removed)
```

### 3.3 Guards per route (baseline)

What protects each API route at baseline. Gaps are marked; ✔ = fixed on `refactor/backend-core`.

| Route | Chain before the handler | Gap |
|---|---|---|
| `POST /api/users` | none (sign-up) | |
| `GET /api/users` | none | Lists every name and email publicly (D-08 ✔) |
| `GET /api/users/:userId` | requireSignin | Any signed-in user can read any profile |
| `PUT/DELETE /api/users/:userId` | requireSignin, hasAuthorization | |
| `PUT /api/stripe_auth/:userId` | requireSignin, hasAuthorization | |
| `POST /api/shops/by/:userId`, `POST /api/auctions/by/:userId` | requireSignin, hasAuthorization, isSeller | |
| `PUT/DELETE /api/shops/:shopId`, products by shop | requireSignin, isOwner | |
| `PUT/DELETE /api/auctions/:auctionId` | requireSignin, auctionCtrl.isSeller | |
| `POST /api/orders/:userId` (checkout) | requireSignin, stripeCustomer, decreaseQuantity | No hasAuthorization: the order is filed under the `:userId` in the URL, not the token's user (D-08 ✔) |
| `GET /api/orders/user/:userId` | requireSignin | **Any signed-in user can list anyone's orders** (D-08 ✔) |
| `GET /api/orders/shop/:shopId`, order status/cancel/charge | requireSignin, isOwner | |
| `GET /api/order/:orderId` | none | Any order's name, email, address readable by id (D-08 ✔) |
| Socket `new bid` | none | Unauthenticated bids under any bidder id |
| `GET` shops, products, auctions, images | none (public catalogue) | |

## 4. After refactoring (backend core)

### 4.1 Components that changed

```mermaid
flowchart LR
  subgraph Server["Node process"]
    direction TB
    Routers["*.routes.js"] --> Guards["Guards + param loaders"]
    Guards --> Ctrl["user · auth · shop · product · order · auction controllers"]
    Guards --> PayC["payment.controller.js<br/>stripeAuth · stripeCustomer · createCharge"]
    PayC --> PayS["services/payment.service.js<br/>connectSeller · saveCustomer · chargeCustomer"]
    Ctrl --> Models["Mongoose models"]
    PayC --> Models
    Ctrl -. "throw HttpError / rejected promise<br/>via asyncHandler" .-> ErrM["helpers/errors.js<br/>errorMiddleware"]
    PayC -.-> ErrM
    Guards -.-> ErrM
  end
  PayS --> Stripe[("Stripe API")]
  Env[".env (git-ignored)"] --> Config["config/config.js<br/>server only"]
  Config -.-> Ctrl
  Config -.-> PayS
  Pub["config/public.js<br/>publishable keys only"] -.-> Client["Browser bundle"]
```

### 4.2 Error path

```mermaid
flowchart TD
  H["Handler wrapped in asyncHandler(fn, fallback?)"] -- "throw HttpError(status, msg)" --> M
  H -- "Mongoose / Mongo error" --> M
  H -- "other error, fallback given" --> F["fallback HttpError<br/>e.g. 400 'Could not retrieve user'"] --> M
  J["express-jwt / body-parser"] --> M
  M["errorMiddleware (single place)"] --> R1["HttpError → its status, {error: msg}"]
  M --> R2["UnauthorizedError → 401 {error}"]
  M --> R3["Mongoose → 400 {error: dbErrorHandler msg}"]
  M --> R4["anything else → 400 {error: 'Name: message'}"]
```

Every error body is `{ error: string }`, and status codes are numbers. Controllers no longer repeat
try/catch (D-02, D-07). Shop/product/order/auction controllers adopt the same pattern in the
domain-modules branch.
