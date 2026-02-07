const MAX_PREVIEW_LENGTH = 800

const escapeXml = (str: string) => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const toBase64DataUri = (mime: string, content: string) =>
  `data:${mime};base64,${btoa(unescape(encodeURIComponent(content)))}`

/**
 * Generate an SVG preview matching the on-chain MarkdownRenderer output.
 */
export const getMarkdownSvg = (title: string, content: string) => {
  const truncated = content.length > MAX_PREVIEW_LENGTH
    ? content.slice(0, MAX_PREVIEW_LENGTH) + '...'
    : content

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">` +
    `<rect width="400" height="400" fill="#111"/>` +
    `<text x="20" y="36" font-family="monospace" font-size="18" font-weight="bold" fill="white">${escapeXml(title)}</text>` +
    `<line x1="20" y1="50" x2="380" y2="50" stroke="#333" stroke-width="1"/>` +
    `<foreignObject x="20" y="60" width="360" height="320">` +
      `<div xmlns="http://www.w3.org/1999/xhtml" style="` +
        `font-family:monospace;font-size:12px;color:#999;` +
        `white-space:pre-wrap;word-break:break-word;` +
        `overflow:hidden;height:320px;` +
        `mask-image:linear-gradient(to bottom,black 60%,transparent 100%);` +
        `-webkit-mask-image:linear-gradient(to bottom,black 60%,transparent 100%)` +
      `">${escapeXml(truncated)}</div>` +
    `</foreignObject>` +
  `</svg>`
}

export const getMarkdownSvgUri = (title: string, content: string) =>
  toBase64DataUri('image/svg+xml', getMarkdownSvg(title, content))

/**
 * Generate a markdown data URI matching the on-chain MarkdownRenderer output.
 */
export const getMarkdownUri = (content: string) =>
  toBase64DataUri('text/markdown', content)
