/**
 * Sidebar style Notion - Navigation principale avec rétraction
 */

'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Users, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Devis', href: '/devis', icon: FileText },
  { name: 'Import Excel', href: '/import', icon: Upload },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Paramètres', href: '/parametres', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Charger l'état depuis localStorage uniquement après le montage (côté client)
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('sidebarCollapsed', String(isCollapsed))
    
    // Mettre à jour l'attribut data sur le body pour synchroniser le CSS
    if (isCollapsed) {
      document.body.setAttribute('data-sidebar-collapsed', 'true')
    } else {
      document.body.removeAttribute('data-sidebar-collapsed')
    }
  }, [isCollapsed, mounted])
  
  // Initialiser l'attribut au montage
  useEffect(() => {
    if (mounted) {
      if (isCollapsed) {
        document.body.setAttribute('data-sidebar-collapsed', 'true')
      } else {
        document.body.removeAttribute('data-sidebar-collapsed')
      }
    }
  }, [mounted, isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Overlay pour mobile quand sidebar est ouverte */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        data-sidebar
        className={`fixed left-0 top-0 z-50 h-full border-r border-gray-200 bg-white transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo / Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            {!isCollapsed && (
              <h1 className="text-lg font-semibold text-gray-900">Devis Manager</h1>
            )}
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1.5 hover:bg-gray-100 transition-colors"
              aria-label={isCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname?.startsWith(item.href))
              const Icon = item.icon

              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-label={item.name}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </>
                  )}
                  {/* Tooltip pour mode réduit */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 rounded-md bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all pointer-events-none">
                      {item.name}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900" />
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

