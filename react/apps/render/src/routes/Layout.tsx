import { useState, useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { appConfig } from '../config'

export default function Layout() {
  const [shellStyle, setShellStyle] = useState<React.CSSProperties>({})
  const isWP = appConfig.isWordPress

  useEffect(() => {
    const updateGeometry = () => {
      const adminBar = document.getElementById('wpadminbar')
      const top = isWP ? (adminBar ? adminBar.offsetHeight : 32) : 0
      const height = Math.max(window.innerHeight - top, 0)

      setShellStyle(
        isWP
          ? { position: 'fixed', top, left: 0, right: 0, height }
          : { height: '100vh' },
      )
    }

    updateGeometry()
    window.addEventListener('resize', updateGeometry)

    const root = document.getElementById('gateway-render-root')
    if (root) {
      root.style.marginLeft = '-20px'
      root.style.boxSizing = 'border-box'
    }

    const wpFooter = document.getElementById('wpfooter')
    if (wpFooter) wpFooter.style.display = 'none'

    return () => window.removeEventListener('resize', updateGeometry)
  }, [isWP])

  return (
    <div className="render-shell" style={shellStyle}>
      <Outlet />
    </div>
  )
}
