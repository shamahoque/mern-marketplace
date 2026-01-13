import config from './../config/config'
import app from './express'
import mongoose from 'mongoose'
import bidding from './controllers/bidding.controller'

import watchlistRoutes from './routes/watchlist.routes'

// MongoDB Connection
mongoose.Promise = global.Promise
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true
})

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.mongoUri}`)
})

app.use('/api/watchlist', watchlistRoutes)

// Start Server
const server = app.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
})

// Socket / bidding logic
bidding(server)
