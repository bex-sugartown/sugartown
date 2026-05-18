import { useState } from 'react'
import AlphaFilter from './AlphaFilter'

export default {
  title: 'Patterns/AlphaFilter',
  component: AlphaFilter,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

const SAMPLE_LETTERS = new Set(['A', 'B', 'C', 'D', 'E', 'M', 'N', 'R', 'S', 'T', 'Z'])
const ALL_LETTERS = new Set('#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))

// ─── Full strip — all letters active ─────────────────────────────────────────

function AllActiveStory() {
  const [filter, setFilter] = useState(null)
  return (
    <AlphaFilter
      activeLetters={ALL_LETTERS}
      filterLetter={filter}
      onSelect={(l) => setFilter(l === filter ? null : l)}
    />
  )
}
export const AllActive = { render: () => <AllActiveStory /> }

// ─── Partial strip — some letters inactive ────────────────────────────────────

function PartialActiveStory() {
  const [filter, setFilter] = useState(null)
  return (
    <AlphaFilter
      activeLetters={SAMPLE_LETTERS}
      filterLetter={filter}
      onSelect={(l) => setFilter(l === filter ? null : l)}
    />
  )
}
export const PartialActive = { render: () => <PartialActiveStory /> }

// ─── Filtered state — letter selected ────────────────────────────────────────

function FilteredStory() {
  const [filter, setFilter] = useState('S')
  return (
    <AlphaFilter
      activeLetters={SAMPLE_LETTERS}
      filterLetter={filter}
      onSelect={(l) => setFilter(l === filter ? null : l)}
    />
  )
}
export const Filtered = { render: () => <FilteredStory /> }

// ─── No active letters — all inactive ────────────────────────────────────────

export const NoResults = {
  render: () => (
    <AlphaFilter
      activeLetters={new Set()}
      filterLetter={null}
      onSelect={() => {}}
    />
  ),
}
