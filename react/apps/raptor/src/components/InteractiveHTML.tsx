import { useEffect, useRef } from 'react'

interface InteractiveHTMLProps {
  html: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Component that renders HTML with WordPress Interactivity API directives
 * and ensures proper hydration
 */
export function InteractiveHTML({ html, className, style }: InteractiveHTMLProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Set the HTML
    containerRef.current.innerHTML = html

    // Check if WordPress Interactivity API is available and trigger hydration
    if (typeof window !== 'undefined' && (window as any).wp?.interactivity) {
      void (window as any).wp.interactivity
      
      // The Interactivity API automatically watches for new elements
      // with data-wp-interactive attributes, but we can manually trigger
      // re-hydration if needed by dispatching a custom event
      const event = new CustomEvent('wp-interactivity-navigate', {
        detail: { element: containerRef.current },
      })
      window.dispatchEvent(event)
    }
  }, [html])

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={style}
      suppressHydrationWarning
    />
  )
}
