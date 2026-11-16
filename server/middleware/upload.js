import formidable from 'formidable'
import { HttpError } from '../helpers/errors'

export const parseMultipart = errorMessage => (req, res, next) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) return next(new HttpError(400, errorMessage))
    req.fields = fields
    req.files = files
    next()
  })
}
