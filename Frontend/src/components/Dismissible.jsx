import { useState } from 'react'
import { X } from 'lucide-react'
import './Dismissible.css'

export default function Dismissible({ 
  children, 
  className = '', 
  inline = false,
  as: Component = 'div',
  crossPosition = 'top-right', // 'top-right' | 'top-left' | 'inside-right'
  style = {},
  ...props 
}) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return (
      <Component 
        className={`dismissed-ghost-space ${className}`} 
        style={{ ...style, visibility: 'hidden', pointerEvents: 'none' }} 
        aria-hidden="true"
        {...props}
      >
        {children}
      </Component>
    )
  }

  return (
    <Component 
      className={`dismissible-element ${inline ? 'dismissible-inline' : ''} ${className}`} 
      style={style}
      {...props}
    >
      {children}
      <button
        type="button"
        className={`universal-dismiss-cross-btn cross-pos-${crossPosition}`}
        onClick={(e) => {
          e.stopPropagation()
          setIsDismissed(true)
        }}
        title="Dismiss element temporarily"
        aria-label="Dismiss element"
      >
        <X size={10} />
      </button>
    </Component>
  )
}
