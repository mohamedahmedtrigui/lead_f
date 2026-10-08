/** Saves a Blob returned by the API as a file. */
export function saveBlob(blob, fallbackName, contentDisposition) {
  const match = /filename="?([^";]+)"?/i.exec(contentDisposition ?? '')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = match?.[1] ?? fallbackName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
