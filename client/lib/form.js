// Form state helpers shared by the create/edit pages (D-10).
import {useState} from 'react'

// Form values plus an onChange factory: handleChange('name') reads the input's
// value, and handleChange('image') reads the chosen file.
export function useFormValues(initialValues) {
  const [values, setValues] = useState(initialValues)
  const handleChange = name => event => {
    const value = name === 'image'
      ? event.target.files[0]
      : event.target.value
    setValues({...values, [name]: value})
  }
  return [values, setValues, handleChange]
}

// Multipart body for shop, product and auction uploads. Only fields that have
// a value are sent, so the server keeps its defaults for the rest.
export function toFormData(values, fields) {
  const data = new FormData()
  fields.forEach(field => {
    values[field] && data.append(field, values[field])
  })
  return data
}
