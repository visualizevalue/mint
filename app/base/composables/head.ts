type HeadConfig = {
  title: string;
  description?: string;
  og?: string;
  append?: string;
  meta?: { name: string, content: string }[];
}

const makeHead = ({
  title,
  append = '',
  description = '',
  og = '',
  meta = [],
}: HeadConfig) => {
  const titleCompleted = `${title}${append}`
  return {
    title: titleCompleted,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: titleCompleted },
      { property: 'og:description', content: description },
      { property: 'og:image', content: og },
      ...meta,
    ]
  }
}

export const useMetaData = (config: HeadConfig) => useHead(makeHead(config))
