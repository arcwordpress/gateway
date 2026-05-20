import { useState, useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { appConfig } from '../config'

export default function Layout() {
  const [shellHeight, setShellHeight] = useState<string>('100vh')
  const isWP = appConfig.isWordPress

  useEffect(() => {
    const update = () => {
      const adminBar = document.getElementById('wpadminbar')
      const topH = isWP ? (adminBar ? adminBar.offsetHeight : 32) : 0
      setShellHeight(`${Math.max(window.innerHeight - topH, 0)}px`)
    }

    update()
    window.addEventListener('resize', update)

    // Mirror raptor's WP admin corrections — pull back WP's horizontal padding
    // and remove the bottom padding that would push the footer down.
    const root = document.getElementById('gateway-render-root')
    if (root) {
      root.style.marginLeft = '-20px'
      root.style.boxSizing = 'border-box'
    }

    const wpBodyContent = document.querySelector<HTMLElement>('#wpbody-content')
    if (wpBodyContent) wpBodyContent.style.paddingBottom = '0'

    const wpFooter = document.getElementById('wpfooter')
    if (wpFooter) wpFooter.style.display = 'none'

    return () => window.removeEventListener('resize', update)
  }, [isWP])

  return (
    // Not position:fixed — stays in normal WP page flow so the sidebar menu
    // is unaffected. Height is set to the available viewport below the admin bar.
    <div
      className="render-shell"
      style={{ height: shellHeight }}
    >
      <Outlet />
    </div>
  )
}
