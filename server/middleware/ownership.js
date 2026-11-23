export const requireOwner = (key, ownerField) => (req, res, next) => {
  const ok = req[key] && req.auth && req[key][ownerField]._id == req.auth._id
  if (!ok) return res.status('403').json({ error: 'User is not authorized' })
  next()
}
