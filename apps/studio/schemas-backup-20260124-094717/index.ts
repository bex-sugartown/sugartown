// Import atomic objects (reusable building blocks)
import link from './objects/link'
import logo from './objects/logo'
import media from './objects/media'
import navigationItem from './objects/navigationItem'
import socialLink from './objects/socialLink'

// Import document schemas (top-level content types)
import header from './documents/header'
import footer from './documents/footer'
import hero from './documents/hero'
import contentBlock from './documents/contentBlock'

export const schemaTypes = [
  // Objects first (dependencies for documents)
  link,
  logo,
  media,
  navigationItem,
  socialLink,
  
  // Documents (top-level content types)
  header,
  footer,
  hero,
  contentBlock,
]
