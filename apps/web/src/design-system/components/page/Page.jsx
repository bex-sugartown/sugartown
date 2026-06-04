import Container from '../container/Container'
import styles from './Page.module.css'

export default function Page({ size = 'reading', header, footer, children, className }) {
  return (
    <div className={[styles.page, className].filter(Boolean).join(' ')}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.main}>
        <Container size={size}>{children}</Container>
      </main>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}
