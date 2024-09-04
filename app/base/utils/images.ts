export type ImageVersions = {
  xs?: boolean, // 215
  sm?: boolean, // 512
  md?: boolean, // 1024
  lg?: boolean, // 2048
}

export type Image = {
  id: string,
  versions: ImageVersions,
  cdn: string,
  path: string,
  type: string,
  aspectRatio?: number,
}

const CDN_BASE = `cdn.evverydays.com`

export const imageURI = (image: Image, version?: keyof ImageVersions) => {
  if (! image) return null

  const name = (version && image.versions[version])
    ? `${image.id}@${version}.webp`
    : `${image.id}.${image.type}`

  return `https://${image.cdn}.${CDN_BASE}/${image.path}/${name}`
}
