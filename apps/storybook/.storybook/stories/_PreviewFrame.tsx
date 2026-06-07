import React, { useState } from 'react';

// ─── Shared inline styles ─────────────────────────────────────────────────────

const f = {
  wrapper:   { border: '1px solid var(--st-color-border-default)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' } as React.CSSProperties,
  canvas:    { padding: '2rem', background: 'var(--st-color-bg)' } as React.CSSProperties,
  tabBar:    { display: 'flex', gap: '0', borderBottom: '1px solid var(--st-color-border-default)', background: 'var(--st-color-bg-surface)' } as React.CSSProperties,
  tabBtn:    (active: boolean): React.CSSProperties => ({
    background: active ? 'var(--st-color-bg)' : 'transparent',
    border: 'none',
    borderRight: '1px solid var(--st-color-border-default)',
    borderBottom: active ? '2px solid var(--st-color-brand-primary)' : '2px solid transparent',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    color: active ? 'var(--st-color-text-primary)' : 'var(--st-color-text-muted)',
    fontFamily: 'var(--st-font-family-ui)',
    fontWeight: active ? 600 : 400,
  }),
  footer:    { borderTop: '1px solid var(--st-color-border-default)', padding: '0.4rem 0.75rem', display: 'flex', gap: '0.5rem', background: 'var(--st-color-bg-surface)' } as React.CSSProperties,
  codeBtn:   { background: 'none', border: '1px solid var(--st-color-border-default)', borderRadius: '3px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--st-color-text-secondary)', fontFamily: 'var(--st-font-family-ui)' } as React.CSSProperties,
  codeBlock: { margin: 0, padding: '1rem', background: 'var(--st-color-bg-surface-strong)', borderTop: '1px solid var(--st-color-border-default)', fontSize: '0.8rem', fontFamily: 'var(--st-font-family-mono)', whiteSpace: 'pre-wrap' as const, overflowX: 'auto' as const } as React.CSSProperties,
};

// ─── PreviewFrame ─────────────────────────────────────────────────────────────
// Bordered canvas wrapper with optional Show/Hide code toggle.

export function PreviewFrame({ children, code }: { children: React.ReactNode; code?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={f.wrapper}>
      <div style={f.canvas}>{children}</div>
      {code && (
        <>
          <div style={f.footer}>
            <button style={f.codeBtn} onClick={() => setOpen(v => !v)}>
              {open ? 'Hide code' : 'Show code'}
            </button>
          </div>
          {open && <pre style={f.codeBlock}>{code}</pre>}
        </>
      )}
    </div>
  );
}

// ─── VariantFrame ─────────────────────────────────────────────────────────────
// Tab-switcher + PreviewFrame. Each variant may carry its own code snippet.

export interface Variant {
  key: string;
  label: string;
  content: React.ReactNode;
  code?: string;
}

export function VariantFrame({ variants }: { variants: Variant[] }) {
  const [activeKey, setActiveKey] = useState(variants[0].key);
  const active = variants.find(v => v.key === activeKey) ?? variants[0];
  return (
    <div style={{ ...f.wrapper, marginBottom: '1.5rem' }}>
      <div style={f.tabBar}>
        {variants.map(v => (
          <button key={v.key} style={f.tabBtn(v.key === activeKey)} onClick={() => setActiveKey(v.key)}>
            {v.label}
          </button>
        ))}
      </div>
      <div style={f.canvas}>{active.content}</div>
      {active.code && <CodeFooter code={active.code} />}
    </div>
  );
}

function CodeFooter({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={f.footer}>
        <button style={f.codeBtn} onClick={() => setOpen(v => !v)}>
          {open ? 'Hide code' : 'Show code'}
        </button>
      </div>
      {open && <pre style={f.codeBlock}>{code}</pre>}
    </>
  );
}

// DoRow removed — use DoItem/DontItem from helpers/docs.tsx for prose items,
// or inline the ddGrid/ddCol pattern from helpers/docs.tsx for code/visual content.
