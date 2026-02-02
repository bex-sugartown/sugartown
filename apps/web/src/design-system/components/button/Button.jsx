import styles from './Button.module.css'

export default function Button({
  variant = 'primary',
  href,
  onClick,
  children,
  className = '',
  ...props
}) {
  const variantClass =
    variant === 'secondary' ? styles.buttonSecondary : styles.buttonPrimary

  const classes = `${styles.button} ${variantClass} ${className}`.trim()

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} onClick={onClick} type="button" {...props}>
      {children}
    </button>
  )
}
