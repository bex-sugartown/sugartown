/**
 * AlphaFilter — letter filter strip for indexed archive pages.
 *
 * Composite consumer of IndexGroup + IndexCell DS primitives.
 * Renders an "All" clear cell, then 27 cells (# + A–Z).
 *
 * Props:
 *   activeLetters  {Set<string>}          — letters that have at least one item
 *   filterLetter   {string | null}        — currently selected letter (null = all)
 *   onSelect       {function}             — (letter: string | null) → void
 */
import { IndexGroup, IndexCell } from '@sugartown/design-system'
import styles from './AlphaFilter.module.css'

const ALL_LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function AlphaFilter({ activeLetters, filterLetter, onSelect }) {
  return (
    <IndexGroup label="Filter by letter">
      <IndexCell
        state={filterLetter === null ? 'selected' : 'active'}
        onClick={() => onSelect(null)}
        aria-pressed={filterLetter === null}
        aria-label="Show all"
        className={styles.allCell}
      >
        All
      </IndexCell>

      {ALL_LETTERS.map((letter) => {
        const isActive = activeLetters.has(letter)
        const isSelected = letter === filterLetter

        if (!isActive) {
          return (
            <IndexCell key={letter} state="inactive" as="span" aria-hidden="true">
              {letter}
            </IndexCell>
          )
        }

        return (
          <IndexCell
            key={letter}
            state={isSelected ? 'selected' : 'active'}
            onClick={() => onSelect(letter)}
            aria-pressed={isSelected}
          >
            {letter}
          </IndexCell>
        )
      })}
    </IndexGroup>
  )
}
