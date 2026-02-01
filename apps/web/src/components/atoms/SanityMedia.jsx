import { urlFor } from '../../lib/sanity'
import Media from '../../design-system/components/media/Media'

export default function SanityMedia({ image, caption, width = 800, quality = 90 }) {
  if (!image?.asset) return null

  const src = urlFor(image.asset).width(width).quality(quality).url()
  const alt = image.alt || ''

  return <Media src={src} alt={alt} caption={caption} />
}

