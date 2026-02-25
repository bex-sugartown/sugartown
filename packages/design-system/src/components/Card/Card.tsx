import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /**
   * Eyebrow slot — mono, uppercase, pink accent.
   * Pass a string for the standard treatment, or ReactNode to compose
   * custom content (e.g. eyebrow label + status badge in a flex row).
   */
  eyebrow?: React.ReactNode;
  /**
   * Card title — rendered in brand pink.
   * Default/compact/dark variants use serif (1.4rem).
   * Listing variant uses sans-serif (1.0625rem) for archive density.
   */
  title: string;
  /**
   * When provided, wraps the title in an <a> tag.
   * For routing in apps/web, convert your canonical path to an href before passing.
   */
  titleHref?: string;
  /** Subtitle — ui font, muted, single-line ellipsis */
  subtitle?: string;
  /**
   * Body content of the card.
   * Accepts any React nodes; typically <p> elements or text.
   * In listing variant, content is clamped to 3 lines.
   */
  children?: React.ReactNode;
  /**
   * Footer slot — pinned to the bottom of the card with a dashed pink divider.
   * Intended for Chip rows, metadata, or action links.
   */
  footer?: React.ReactNode;
  /**
   * Visual variant.
   * - `default`  — white background, pink 1px border, full height (420px min)
   * - `compact`  — reduced padding (20px) and min-height (360px)
   * - `listing`  — archive density: 200px min, sans title, 3-line content clamp
   * - `dark`     — void-900 background, translucent white border, hover glow ring
   */
  variant?: 'default' | 'compact' | 'listing' | 'dark';
  /**
   * When provided (and no `as` override), the card renders as an <a> tag.
   * Pass a full URL; routing is the caller's responsibility.
   */
  href?: string;
  /**
   * Polymorphic root element. Overrides the default rendering element.
   * Defaults to 'article', or 'a' when href is provided.
   *
   * Use this for SPA routing — e.g. pass react-router's Link component
   * and add `to={path}` as an additional prop.
   *
   * @example
   * <Card as={Link} to="/articles/my-post" variant="listing" title="..." />
   */
  as?: React.ElementType;
  /** Extra class names for layout overrides from the parent grid */
  className?: string;
  /** Additional props forwarded to the root element (e.g. `to` for router Link) */
  [key: string]: unknown;
}

export const Card: React.FC<CardProps> = ({
  eyebrow,
  title,
  titleHref,
  subtitle,
  children,
  footer,
  variant = 'default',
  href,
  as: Root,
  className,
  ...restProps
}) => {
  const cardClassNames = [
    styles.card,
    variant === 'compact' && styles.compact,
    variant === 'listing' && styles.listing,
    variant === 'dark' && styles.dark,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const titleNode = titleHref ? (
    <a href={titleHref} className={styles.titleLink}>
      {title}
    </a>
  ) : (
    title
  );

  const inner = (
    <div className={styles.inner}>
      {/* Header — eyebrow + title + subtitle */}
      <div className={styles.header}>
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h3 className={styles.title}>{titleNode}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {/* Body content */}
      {children && <div className={styles.content}>{children}</div>}

      {/* Footer — pinned to bottom */}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );

  // Determine root element: caller override > <a> when href > <article>
  const Element = Root ?? (href ? 'a' : 'article');

  return (
    <Element
      className={cardClassNames}
      {...(href && !Root ? { href } : {})}
      {...(!Root && href ? { 'aria-label': title } : {})}
      {...restProps}
    >
      {inner}
    </Element>
  );
};
