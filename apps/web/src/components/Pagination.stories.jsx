import { useState } from 'react'
import Pagination from './Pagination'

export default {
  title: 'Patterns/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
    onPageChange: { table: { disable: true } },
  },
}

// ─── Single page — renders nothing ───────────────────────────────────────────

export const SinglePage = {
  args: { currentPage: 1, totalPages: 1, onPageChange: () => {} },
}

// ─── Few pages — no ellipsis ──────────────────────────────────────────────────

function FewPagesStory() {
  const [page, setPage] = useState(1)
  return <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
}
export const FewPages = { render: () => <FewPagesStory /> }

// ─── Many pages — ellipsis active ────────────────────────────────────────────

function ManyPagesStory() {
  const [page, setPage] = useState(6)
  return <Pagination currentPage={page} totalPages={20} onPageChange={setPage} />
}
export const ManyPages = { render: () => <ManyPagesStory /> }

// ─── Edge — first page ───────────────────────────────────────────────────────

function FirstPageStory() {
  const [page, setPage] = useState(1)
  return <Pagination currentPage={page} totalPages={12} onPageChange={setPage} />
}
export const FirstPage = { render: () => <FirstPageStory /> }

// ─── Edge — last page ────────────────────────────────────────────────────────

function LastPageStory() {
  const [page, setPage] = useState(12)
  return <Pagination currentPage={page} totalPages={12} onPageChange={setPage} />
}
export const LastPage = { render: () => <LastPageStory /> }
