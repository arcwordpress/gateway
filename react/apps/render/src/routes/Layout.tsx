import { useState, useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { appConfig } from '../config'

export default function Layout() {
  const [shellHeight, setShellHeight] = useState(0)
  const [topOffset, setTopOffset] = useState(0)
  const isWP = appConfig.isWordPress

  useEffect(() => {
    const updateGeometry = () => {
      const adminBar = document.getElementById('wpadminbar')
      const top = isWP ? (adminBar ? adminBar.offsetHeight : 32) : 0
      setTopOffset(top)
      setShellHeight(Math.max(window.innerHeight - top, 0))
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

  const shellStyle = isWP
    ? { position: 'fixed' as const, top: topOffset, left: 0, right: 0, height: shellHeight }
    : { height: '100vh' }

  return (
    <div
      id="gateway-render-shell"
      className="flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden"
      style={shellStyle}
    >
      <Outlet />
    </div>
  )
}
