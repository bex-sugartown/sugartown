import { useSanityDoc } from './useSanityDoc'
import { releaseNoteByVersionQuery } from './queries'
import { getCanonicalPath, TRUST_LINKS } from './routes'

/**
 * useReleaseNoteHref(version)
 *
 * Path of the published release note for a version, or the changelog URL when
 * none is published (an unpublished draft is invisible to the published client).
 */
export function useReleaseNoteHref(version) {
  const { data } = useSanityDoc(releaseNoteByVersionQuery, { version: version ?? '' })
  return data?.slug
    ? getCanonicalPath({ docType: 'releaseNote', slug: data.slug })
    : TRUST_LINKS.changelog
}
