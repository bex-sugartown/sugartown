import { Link } from 'react-router-dom'
import styles from './pages.module.css'

export default function NotFoundPage() {
  return (
    <main className={styles.placeholderPage}>
      <div className={styles.placeholderContent}>
        <p className={styles.placeholderEyebrow}>404</p>
        <h1 className={styles.placeholderHeading}>Page Not Found</h1>
        <p className={styles.placeholderBody}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className={styles.placeholderLink}>
          ← Back to home
        </Link>
      </div>
    </main>
  )
}
