import { useEffect, useRef } from 'react'
import './ScrambledText.css'

export default function ScrambledText({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  children
}) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current) return

    const p = rootRef.current.querySelector('p')
    if (!p) return

    const originalText = typeof children === 'string' ? children : p.innerText
    
    // Wrap characters in span elements
    p.innerHTML = originalText
      .split('')
      .map((char) => {
        if (char === ' ') return '<span class="char char-space">&nbsp;</span>'
        return `<span class="char" data-orig="${char}">${char}</span>`
      })
      .join('')

    const charElements = Array.from(p.querySelectorAll('.char:not(.char-space)'))
    const activeTimers = new Map()

    const handleMove = (e) => {
      charElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy)

        if (dist < radius && !activeTimers.has(el)) {
          const orig = el.dataset.orig
          let step = 0
          // Smooth & gentle step count (2 to 4 steps)
          const maxSteps = Math.floor(3 * (1 - dist / radius)) + 2

          // Slower comfortable step delay (~160ms per step)
          const stepDelay = 160

          const interval = setInterval(() => {
            step++
            if (step >= maxSteps) {
              clearInterval(interval)
              activeTimers.delete(el)
              el.innerText = orig
              el.classList.remove('scrambling')
            } else {
              el.classList.add('scrambling')
              const randChar = scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
              el.innerText = randChar
            }
          }, stepDelay)

          activeTimers.set(el, interval)
        }
      })
    }

    const container = rootRef.current
    container.addEventListener('pointermove', handleMove)

    return () => {
      container.removeEventListener('pointermove', handleMove)
      activeTimers.forEach((timer) => clearInterval(timer))
    }
  }, [children, radius, duration, speed, scrambleChars])

  return (
    <div ref={rootRef} className={`scrambled-text-block ${className}`} style={style}>
      <p>{children}</p>
    </div>
  )
}
