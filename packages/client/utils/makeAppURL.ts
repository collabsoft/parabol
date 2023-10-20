interface UTMParams {
  utm_source: string
  utm_medium?: string
  utm_campaign?: string
}

interface Options {
  // Don't require UTMs, but if one UTM param is present, the others should be present, too.
  searchParams?: {
    openNotifs?: string
    responseId?: string
    redirectTo?: string
  } & (UTMParams | Partial<Record<keyof UTMParams, never>>)
}

const makeAppURL = (appOrigin: string, pathname: string, options?: Options) => {
  const searchParams = options?.searchParams ?? ({} as Record<string, string>)
  const url = new URL(appOrigin)
  url.pathname = pathname
  Object.entries(searchParams).forEach((entry) => {
    url.searchParams.append(...entry)
  })
  return url.toString()
}

export default makeAppURL
