import fs from 'fs'

export const applyImage = (doc, files) => {
  if (files && files.image) {
    doc.image.data = fs.readFileSync(files.image.path)
    doc.image.contentType = files.image.type
  }
}
