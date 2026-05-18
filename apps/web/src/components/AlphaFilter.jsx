/**
 * AlphaFilter — letter filter strip for indexed archive pages.
 *
 * Composite consumer of IndexGroup + IndexCell DS primitives.
 * Renders 27 cells (# + A–Z); active letters are clickable, others inactive.
 *
 * Props:
 *   activeLetters  {Set<string>}    — letters that have at least one item
 *   filterLetter   {string | null}  — currently selected letter (null = all)
 *   onSelect       {function}       — (letter: string) → void; called with same
 *                                     letter to deselect (toggle behaviour)
 */
import IndexGroup from '../design-system/components/index-group/IndexGroup'
import IndexCell from '../design-system/components/index-cell/IndexCell'

const ALL_LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function AlphaFilter({ activeLetters, filterLetter, onSelect }) {
  return (
    <IndexGroup label="Filter by letter">
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
