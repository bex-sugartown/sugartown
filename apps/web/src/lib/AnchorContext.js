/**
 * AnchorContext — true while rendering inside an anchor that a Portable Text mark already drew.
 *
 * A span can carry both a `link` mark and a `glossaryTermRef` mark. Each mark renderer draws its
 * own <a>, so the span rendered an <a> inside an <a> (invalid HTML, React hydration warning, #143).
 * Each anchor-drawing mark renderer reads this context: if an outer mark already drew an anchor it
 * renders its children without a second one, and otherwise it provides `true` to its children.
 * The outer mark (the first in the span's `marks` array) wins.
 */
import { createContext } from 'react'

export const AnchorContext = createContext(false)
