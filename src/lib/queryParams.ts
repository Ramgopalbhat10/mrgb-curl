import { QueryParam } from '@/schemas'

const extractQueryString = (url: string) => {
  const queryStart = url.indexOf('?')
  if (queryStart === -1) return ''
  const hashStart = url.indexOf('#', queryStart + 1)
  return hashStart === -1
    ? url.slice(queryStart + 1)
    : url.slice(queryStart + 1, hashStart)
}

const parseQueryString = (queryString: string): QueryParam[] => {
  if (!queryString) return []
  const normalized = queryString.startsWith('?')
    ? queryString.slice(1)
    : queryString
  const params: QueryParam[] = []
  const searchParams = new URLSearchParams(normalized)
  searchParams.forEach((value, key) => {
    params.push({ key, value, enabled: true })
  })
  return params
}

export const parseUrlParams = (url: string): QueryParam[] => {
  if (!url) return []
  try {
    return parseQueryString(new URL(url).search)
  } catch {
    return parseQueryString(extractQueryString(url))
  }
}

export const buildUrlWithParams = (
  baseUrl: string,
  params: QueryParam[],
): string => {
  try {
    const urlObj = new URL(baseUrl)
    urlObj.search = ''
    params
      .filter((param) => param.enabled && param.key)
      .forEach((param) => {
        urlObj.searchParams.append(param.key, param.value)
      })
    return urlObj.toString()
  } catch {
    return baseUrl
  }
}
