import { useEffect } from 'react'
import { useLocation } from 'wouter'

declare function gtag(...args: unknown[]): void

function resolveTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/':                                  'Home',
    '/playground':                        'Playground',
    '/dsl':                               'DSL Reference',
    '/architecture':                      'Architecture',
    '/roadmap':                           'Roadmap',
    '/about':                             'About',
    '/skills':                            'Agent Skills',
    '/walkthrough':                       'Walkthrough',
    '/walkthrough/purchase-approval':     'Walkthrough: Purchase Approval',
    '/walkthrough/employee-offboarding':  'Walkthrough: Employee Offboarding',
  }
  if (titles[pathname]) return titles[pathname]
  if (pathname.startsWith('/skills/')) return 'Agent Skills: Skill Detail'
  return pathname
}

export function usePageTracking(): void {
  const [pathname] = useLocation()
  useEffect(() => {
    if (typeof gtag !== 'function') return
    gtag('event', 'page_view', {
      page_path:     pathname,
      page_title:    resolveTitle(pathname),
      page_location: window.location.href,
    })
  }, [pathname])
}
