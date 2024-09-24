export const useBaseURL = () => {
  const config = useRuntimeConfig()

  return config.app.baseURL.endsWith('/')
    ? config.app.baseURL
    : config.app.baseURL + '/'
}
