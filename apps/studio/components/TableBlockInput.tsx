/**
 * TableBlockInput — Spreadsheet-style grid input for the `tableBlock` schema type.
 *
 * Replaces the default Sanity array-of-objects input with:
 *   - Grid layout: renders rows × cells as a <table> of <input> elements
 *   - Cell editing: click to focus, type to edit, Tab/Enter to advance
 *   - Clipboard paste: intercepts onPaste on the grid container
 *     → tab-delimited text (Excel/Sheets copy format)
 *     → HTML <table> from clipboard (browser copy format)
 *   - Row/column controls: add row, add column, remove row, remove column
 *   - Header row toggle: visual distinction for first row when hasHeaderRow is true
 *
 * SUG-34: Table Authoring UX + HTML Table Migration
 */

import {type ObjectInputProps, type PatchEvent, set, unset, useFormValue} from 'sanity'
import {useCallback, useRef, useState, type ClipboardEvent, type KeyboardEvent} from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Switch,
  Label,
  Select,
} from '@sanity/ui'
import {AddIcon, RemoveIcon, TrashIcon} from '@sanity/icons'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TableRow {
  _key: string
  _type?: string
  cells: string[]
}

interface TableBlockValue {
  _type: 'tableBlock'
  variant?: 'default' | 'responsive' | 'wide'
  hasHeaderRow?: boolean
  rows?: TableRow[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10)
}

function makeRow(cellCount: number, cells?: string[]): TableRow {
  const row: TableRow = {
    _key: generateKey(),
    _type: 'tableRow',
    cells: [],
  }
  for (let i = 0; i < cellCount; i++) {
    row.cells.push(cells?.[i] ?? '')
  }
  return row
}

/** Normalize column count — ensure all rows have the same number of cells. */
function normalizeRows(rows: TableRow[]): TableRow[] {
  const maxCols = rows.reduce((max, r) => Math.max(max, r.cells?.length ?? 0), 0)
  return rows.map((r) => ({
    ...r,
    cells: Array.from({length: maxCols}, (_, i) => r.cells?.[i] ?? ''),
  }))
}

/** Decode HTML entities in a string. */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
}

/** Strip HTML tags from a string, keeping text content. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Parse clipboard data into a 2D string array.
 * Supports: tab-delimited text (Excel/Sheets) and HTML <table> markup.
 */
function parseClipboard(e: ClipboardEvent): string[][] | null {
  // Try HTML table first (browser copies include both text and HTML)
  const html = e.clipboardData.getData('text/html')
  if (html && html.includes('<table') || html && html.includes('<TABLE')) {
    const parsed = parseHtmlTable(html)
    if (parsed && parsed.length > 0) return parsed
  }

  // Fall back to tab-delimited text
  const text = e.clipboardData.getData('text/plain')
  if (text) {
    const rows = text.split(/\r?\n/).filter((line) => line.length > 0)
    if (rows.length > 0) {
      const data = rows.map((row) => row.split('\t'))
      // Only treat as table data if there are multiple columns or rows
      if (data.length > 1 || (data[0] && data[0].length > 1)) {
        return data
      }
    }
  }

  return null
}

/** Parse an HTML string containing a <table> into a 2D array of cell text. */
function parseHtmlTable(html: string): string[][] | null {
  // Use a regex-based approach — works for well-formed table HTML without a DOM parser
  const tableMatch = html.match(/<table[\s\S]*?>([\s\S]*?)<\/table>/i)
  if (!tableMatch) return null

  const tableHtml = tableMatch[1]
  const rows: string[][] = []

  // Match <tr> elements
  const trRegex = /<tr[\s>][\s\S]*?<\/tr>/gi
  let trMatch
  while ((trMatch = trRegex.exec(tableHtml)) !== null) {
    const rowHtml = trMatch[0]
    const cells: string[] = []

    // Match <td> and <th> elements
    const cellRegex = /<(?:td|th)[\s>][\s\S]*?<\/(?:td|th)>/gi
    let cellMatch
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      const cellText = decodeEntities(stripHtml(cellMatch[0]))
      cells.push(cellText)
    }

    if (cells.length > 0) {
      rows.push(cells)
    }
  }

  return rows.length > 0 ? rows : null
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const gridStyles: Record<string, React.CSSProperties> = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    fontFamily: 'inherit',
  },
  headerCell: {
    background: 'var(--card-badge-caution-bg-color, #2a2520)',
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
  },
  cell: {
    border: '1px solid var(--card-border-color, #333)',
    padding: 0,
  },
  cellInput: {
    width: '100%',
    padding: '6px 8px',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  cellInputFocus: {
    boxShadow: 'inset 0 0 0 2px var(--card-focus-ring-color, #4e8ae6)',
  },
  colHeader: {
    padding: '4px 8px',
    fontSize: '11px',
    color: 'var(--card-muted-fg-color, #888)',
    textAlign: 'center' as const,
    fontFamily: 'monospace',
    userSelect: 'none' as const,
  },
  rowHeader: {
    padding: '4px 6px',
    fontSize: '11px',
    color: 'var(--card-muted-fg-color, #888)',
    textAlign: 'right' as const,
    fontFamily: 'monospace',
    width: '32px',
    userSelect: 'none' as const,
  },
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TableBlockInput(props: ObjectInputProps) {
  const {value, onChange, schemaType} = props
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const rows: TableRow[] = value?.rows ?? []
  const hasHeaderRow = value?.hasHeaderRow ?? true
  const variant = value?.variant ?? 'default'
  const colCount = rows.length > 0 ? Math.max(...rows.map((r) => r.cells?.length ?? 0), 1) : 3

  // ── Patch helpers ────────────────────────────────────────────────────────

  const patchRows = useCallback(
    (newRows: TableRow[]) => {
      const normalized = normalizeRows(newRows)
      onChange(set(normalized, ['rows']))
    },
    [onChange],
  )

  const patchCell = useCallback(
    (rowIdx: number, colIdx: number, cellValue: string) => {
      const newRows = rows.map((r, ri) => {
        if (ri !== rowIdx) return r
        const newCells = [...(r.cells ?? [])]
        // Expand cells array if needed
        while (newCells.length <= colIdx) newCells.push('')
        newCells[colIdx] = cellValue
        return {...r, cells: newCells}
      })
      patchRows(newRows)
    },
    [rows, patchRows],
  )

  // ── Row/column operations ────────────────────────────────────────────────

  const addRow = useCallback(
    (atIndex?: number) => {
      const newRow = makeRow(colCount)
      const newRows = [...rows]
      if (atIndex !== undefined) {
        newRows.splice(atIndex, 0, newRow)
      } else {
        newRows.push(newRow)
      }
      patchRows(newRows)
    },
    [rows, colCount, patchRows],
  )

  const removeRow = useCallback(
    (rowIdx: number) => {
      if (rows.length <= 1) return // Don't remove the last row
      const newRows = rows.filter((_, i) => i !== rowIdx)
      patchRows(newRows)
    },
    [rows, patchRows],
  )

  const addColumn = useCallback(() => {
    const newRows = rows.map((r) => ({
      ...r,
      cells: [...(r.cells ?? []), ''],
    }))
    patchRows(newRows)
  }, [rows, patchRows])

  const removeColumn = useCallback(
    (colIdx: number) => {
      if (colCount <= 1) return // Don't remove the last column
      const newRows = rows.map((r) => ({
        ...r,
        cells: (r.cells ?? []).filter((_, i) => i !== colIdx),
      }))
      patchRows(newRows)
    },
    [rows, colCount, patchRows],
  )

  // ── Initialize empty table ───────────────────────────────────────────────

  const initializeTable = useCallback(() => {
    const newRows = [makeRow(3), makeRow(3), makeRow(3)]
    patchRows(newRows)
  }, [patchRows])

  // ── Paste handler ────────────────────────────────────────────────────────

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const data = parseClipboard(e)
      if (!data) return // Let default paste behavior handle single-cell paste

      e.preventDefault()

      const [startRow, startCol] = focusedCell ?? [0, 0]

      // Build new rows array, expanding as needed
      const newRows = [...rows]
      const maxCol = Math.max(colCount, startCol + Math.max(...data.map((r) => r.length)))

      // Ensure enough rows exist
      while (newRows.length < startRow + data.length) {
        newRows.push(makeRow(maxCol))
      }

      // Ensure all rows have enough columns
      for (const row of newRows) {
        while ((row.cells?.length ?? 0) < maxCol) {
          row.cells = [...(row.cells ?? []), '']
        }
      }

      // Write pasted data into the grid
      for (let ri = 0; ri < data.length; ri++) {
        for (let ci = 0; ci < data[ri].length; ci++) {
          const targetRow = startRow + ri
          const targetCol = startCol + ci
          if (targetRow < newRows.length) {
            newRows[targetRow].cells[targetCol] = data[ri][ci]
          }
        }
      }

      patchRows(newRows)
    },
    [rows, colCount, focusedCell, patchRows],
  )

  // ── Keyboard navigation ──────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, rowIdx: number, colIdx: number) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const nextCol = e.shiftKey ? colIdx - 1 : colIdx + 1
        if (nextCol >= 0 && nextCol < colCount) {
          focusCell(rowIdx, nextCol)
        } else if (!e.shiftKey && rowIdx + 1 < rows.length) {
          focusCell(rowIdx + 1, 0)
        } else if (e.shiftKey && rowIdx > 0) {
          focusCell(rowIdx - 1, colCount - 1)
        }
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (rowIdx + 1 < rows.length) {
          focusCell(rowIdx + 1, colIdx)
        }
      } else if (e.key === 'ArrowDown' && rowIdx + 1 < rows.length) {
        e.preventDefault()
        focusCell(rowIdx + 1, colIdx)
      } else if (e.key === 'ArrowUp' && rowIdx > 0) {
        e.preventDefault()
        focusCell(rowIdx - 1, colIdx)
      }
    },
    [rows.length, colCount],
  )

  const focusCell = useCallback((rowIdx: number, colIdx: number) => {
    setFocusedCell([rowIdx, colIdx])
    // Use setTimeout to ensure the DOM has updated
    setTimeout(() => {
      const input = tableRef.current?.querySelector(
        `[data-row="${rowIdx}"][data-col="${colIdx}"]`,
      ) as HTMLInputElement | null
      input?.focus()
    }, 0)
  }, [])

  // ── Variant + header controls ────────────────────────────────────────────

  const handleVariantChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(set(e.currentTarget.value, ['variant']))
    },
    [onChange],
  )

  const handleHeaderToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(set(e.currentTarget.checked, ['hasHeaderRow']))
    },
    [onChange],
  )

  // ── Render: empty state ──────────────────────────────────────────────────

  if (rows.length === 0) {
    return (
      <Stack space={3} padding={3}>
        <Flex gap={3} align="center">
          <Box flex={1}>
            <Label size={1} muted>Table Variant</Label>
            <Box marginTop={2}>
              <Select fontSize={1} value={variant} onChange={handleVariantChange}>
                <option value="default">Default</option>
                <option value="responsive">Responsive (card layout on mobile)</option>
                <option value="wide">Wide (fixed columns)</option>
              </Select>
            </Box>
          </Box>
          <Flex align="center" gap={2}>
            <Switch checked={hasHeaderRow} onChange={handleHeaderToggle} />
            <Label size={1} muted>Header row</Label>
          </Flex>
        </Flex>
        <Card padding={4} border radius={2} tone="transparent">
          <Stack space={3} style={{textAlign: 'center'}}>
            <Text size={1} muted>
              No table data yet.
            </Text>
            <Button
              text="Create 3×3 table"
              icon={AddIcon}
              tone="primary"
              mode="ghost"
              onClick={initializeTable}
            />
            <Text size={0} muted>
              Or paste tabular data from Excel, Google Sheets, or an HTML table.
            </Text>
          </Stack>
        </Card>
      </Stack>
    )
  }

  // ── Render: grid ─────────────────────────────────────────────────────────

  return (
    <Stack space={3} padding={2}>
      {/* Controls bar */}
      <Flex gap={3} align="center" wrap="wrap">
        <Box flex={1} style={{minWidth: 160}}>
          <Label size={0} muted>Variant</Label>
          <Box marginTop={1}>
            <Select fontSize={1} value={variant} onChange={handleVariantChange}>
              <option value="default">Default</option>
              <option value="responsive">Responsive</option>
              <option value="wide">Wide</option>
            </Select>
          </Box>
        </Box>
        <Flex align="center" gap={2}>
          <Switch checked={hasHeaderRow} onChange={handleHeaderToggle} />
          <Label size={0} muted>Header row</Label>
        </Flex>
        <Flex gap={1}>
          <Tooltip
            content={<Box padding={2}><Text size={1}>Add row</Text></Box>}
            placement="top"
          >
            <Button
              icon={AddIcon}
              mode="ghost"
              tone="primary"
              fontSize={1}
              padding={2}
              onClick={() => addRow()}
            />
          </Tooltip>
          <Tooltip
            content={<Box padding={2}><Text size={1}>Add column</Text></Box>}
            placement="top"
          >
            <Button
              text="+ Col"
              mode="ghost"
              tone="primary"
              fontSize={0}
              padding={2}
              onClick={addColumn}
            />
          </Tooltip>
        </Flex>
      </Flex>

      {/* Table grid */}
      <Card border radius={2} style={{overflow: 'auto'}}>
        <table
          ref={tableRef}
          style={gridStyles.table}
          onPaste={handlePaste as any}
        >
          {/* Column headers (A, B, C...) */}
          <thead>
            <tr>
              <th style={gridStyles.colHeader}></th>
              {Array.from({length: colCount}, (_, ci) => (
                <th key={ci} style={gridStyles.colHeader}>
                  <Flex align="center" justify="center" gap={1}>
                    <span>{String.fromCharCode(65 + ci)}</span>
                    {colCount > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(ci)}
                        title={`Remove column ${String.fromCharCode(65 + ci)}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--card-muted-fg-color, #888)',
                          fontSize: '10px',
                          padding: '0 2px',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    )}
                  </Flex>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const isHeader = hasHeaderRow && ri === 0
              return (
                <tr key={row._key ?? ri}>
                  {/* Row number + remove button */}
                  <td style={gridStyles.rowHeader}>
                    <Flex align="center" gap={1}>
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(ri)}
                          title={`Remove row ${ri + 1}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--card-muted-fg-color, #888)',
                            fontSize: '10px',
                            padding: '0 2px',
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      )}
                      <span>{ri + 1}</span>
                    </Flex>
                  </td>
                  {/* Cells */}
                  {Array.from({length: colCount}, (_, ci) => (
                    <td
                      key={ci}
                      style={{
                        ...gridStyles.cell,
                        ...(isHeader ? gridStyles.headerCell : {}),
                      }}
                    >
                      <input
                        type="text"
                        data-row={ri}
                        data-col={ci}
                        value={row.cells?.[ci] ?? ''}
                        style={{
                          ...gridStyles.cellInput,
                          ...(isHeader ? {fontWeight: 600} : {}),
                          ...(focusedCell?.[0] === ri && focusedCell?.[1] === ci
                            ? gridStyles.cellInputFocus
                            : {}),
                        }}
                        onChange={(e) => patchCell(ri, ci, e.target.value)}
                        onFocus={() => setFocusedCell([ri, ci])}
                        onBlur={() => setFocusedCell(null)}
                        onKeyDown={(e) => handleKeyDown(e as any, ri, ci)}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* Footer info */}
      <Text size={0} muted>
        {rows.length} row{rows.length !== 1 ? 's' : ''} × {colCount} column
        {colCount !== 1 ? 's' : ''} · Paste from Excel/Sheets supported
      </Text>
    </Stack>
  )
}
