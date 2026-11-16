import fs from 'fs'
import defaultImage from '../../client/assets/images/default.png'

export const applyImage = (doc, files) => {
  if (files && files.image) {
    doc.image.data = fs.readFileSync(files.image.path)
    doc.image.contentType = files.image.type
  }
}

export const photoHandler = key => (req, res, next) => {
  if (req[key].image.data) {
    res.set('Content-Type', req[key].image.contentType)
    return res.send(req[key].image.data)
  }
  next()
}

export const defaultPhoto = (req, res) => res.sendFile(process.cwd() + defaultImage)

export const readWithoutImage = key => (req, res) => {
  req[key].image = undefined
  return res.json(req[key])
}
