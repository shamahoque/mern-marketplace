import formidable from 'formidable'

export const parseMultipart = errorMessage => (req, res, next) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).json({ message: errorMessage })
    req.fields = fields
    req.files = files
    next()
  })
}
