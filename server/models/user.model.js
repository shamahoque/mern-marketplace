import mongoose from 'mongoose'
import crypto from 'crypto'
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Name is required'
  },
  email: {
    type: String,
    trim: true,
    unique: 'Email already exists',
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    required: 'Email is required'
  },
  hashed_password: {
    type: String,
    required: "Password is required"
  },
  salt: String,
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  },
  seller: {
    type: Boolean,
    default: false
  },
  stripe_seller: {},
  stripe_customer: {}
})

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() {
    return this._password
  })

UserSchema.path('hashed_password').validate(function(v) {
  if (this._password && this._password.length < 6) {
    this.invalidate('password', 'Password must be at least 6 characters.')
  }
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Password is required')
  }
}, null)

// D-08: scrypt with a random salt. Hashes are stored as "scrypt$<hex>"; older unprefixed values are
// HMAC-SHA1 from the original code, still accepted at sign-in and upgraded (see auth.controller signin).
const HASH_PREFIX = 'scrypt$'

UserSchema.methods = {
  authenticate: function(plainText) {
    const expected = Buffer.from(this.isLegacyHash() ? this.legacyEncrypt(plainText) : this.encryptPassword(plainText))
    const actual = Buffer.from(this.hashed_password || '')
    return expected.length > 0 && expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  },
  encryptPassword: function(password) {
    if (!password) return ''
    // ponytail: sync scrypt (~50ms) blocks the event loop per sign-in; the mongoose virtual setter must be sync.
    return HASH_PREFIX + crypto.scryptSync(password, this.salt, 64).toString('hex')
  },
  isLegacyHash: function() {
    return !!this.hashed_password && !this.hashed_password.startsWith(HASH_PREFIX)
  },
  legacyEncrypt: function(password) {
    if (!password) return ''
    try {
      return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
    } catch (err) {
      return ''
    }
  },
  makeSalt: function() {
    return crypto.randomBytes(16).toString('hex')
  }
}

export default mongoose.model('User', UserSchema)
