import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

/**
 * Accordion — Sugartown Design System
 *
 * Expand/collapse component using CSS grid-row animation.
 * Supports single-expand (one panel open at a time) or multi-expand mode.
 * Full a11y: aria-expanded, aria-controls, role="region", keyboard nav.
 */

export interface AccordionItem {
  /** Unique identifier for this item */
  id: string;
  /** Content rendered in the trigger button */
  trigger: React.ReactNode;
  /** Content revealed when expanded */
  content: React.ReactNode;
}

export interface AccordionProps {
  /** Array of accordion items */
  items: AccordionItem[];
  /** Allow multiple items open at once (default: false — single-expand) */
  multi?: boolean;
  /** IDs of items that should be open initially */
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({
  items,
  multi = false,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen));
  const baseId = useId();

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(multi ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const classNames = [styles.accordion, className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const triggerId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
          >
            <button
              id={triggerId}
              type="button"
              className={styles.trigger}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
            >
              <span className={styles.triggerLabel}>{item.trigger}</span>
              <ChevronDown
                size={20}
                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                aria-hidden="true"
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
            >
              <div className={styles.panelInner}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
