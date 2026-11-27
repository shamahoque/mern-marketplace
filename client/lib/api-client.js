// Shared HTTP helper for every client API module (D-09).
// Before this, each of the 38 API functions repeated its own fetch call, headers,
// JSON parsing and try/catch. They now describe only what differs: URL, method,
// token and body.

/**
 * Send a request to the server and return the parsed JSON response.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {string} [options.method='GET']
 * @param {{t: string}} [options.credentials] signed-in user's token; adds the Bearer header
 * @param {*} [options.json] value sent as a JSON body
 * @param {FormData} [options.formData] multipart body (shop/product/auction images)
 * @param {AbortSignal} [options.signal] lets a component cancel the request on unmount
 * @param {boolean} [options.withCookies=false] send and receive cookies (sign-in only)
 * @returns {Promise<object|undefined>} the JSON body, or undefined if the request failed
 */
const request = async (url, {method = 'GET', credentials, json, formData, signal, withCookies = false} = {}) => {
  const headers = {}
  if (credentials || json !== undefined || formData) headers['Accept'] = 'application/json'
  if (json !== undefined) headers['Content-Type'] = 'application/json'
  if (credentials) headers['Authorization'] = 'Bearer ' + credentials.t

  const options = {method, headers, signal}
  if (json !== undefined) options.body = JSON.stringify(json)
  if (formData) options.body = formData
  if (withCookies) options.credentials = 'include'

  try {
    const response = await fetch(url, options)
    return await response.json()
  } catch (err) {
    // Same as the original modules: log the failure and resolve to undefined.
    console.log(err)
  }
}

export default request
