export interface LayoutNavLink {
  label: string
  href: string
}

export interface LayoutFooterLinkGroup {
  title: string
  links: LayoutNavLink[]
}

export interface LayoutConfig {
  dashboard: {
    shell: 'standard'
    header: {
      visible: boolean
      showMenuToggle: boolean
      showIdentity: boolean
      showProfileMenu: boolean
      brandTitle?: string | null
    }
    sidebar: {
      visible: boolean
      width: 'compact' | 'default'
      defaultCollapsed: boolean
    }
    main: {
      padding: 'none' | 'sm' | 'md' | 'lg'
      maxWidth: 'full' | 'xl' | '2xl'
    }
  }
  public: {
    enabled: boolean
    header: {
      brandTitle?: string | null
      showAuthButtons: boolean
      navLinks: LayoutNavLink[]
    }
    footer: {
      enabled: boolean
      copyright?: string | null
      linkGroups: LayoutFooterLinkGroup[]
    }
  }
}

export interface LayoutDto {
  id: string
  slug: string
  name: string
  shell: string
  defaultRoute: string
  defaultSidebarItemId?: string
  config: LayoutConfig
  sidebarItemIds: string[]
  isActive?: boolean
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  dashboard: {
    shell: 'standard',
    header: {
      visible: true,
      showMenuToggle: true,
      showIdentity: true,
      showProfileMenu: true,
      brandTitle: null,
    },
    sidebar: {
      visible: true,
      width: 'default',
      defaultCollapsed: false,
    },
    main: {
      padding: 'md',
      maxWidth: 'full',
    },
  },
  public: {
    enabled: true,
    header: {
      brandTitle: null,
      showAuthButtons: true,
      navLinks: [
        { label: 'Home', href: '/' },
        { label: 'Sign in', href: '/auth/login' },
      ],
    },
    footer: {
      enabled: true,
      copyright: '© Institute of Sound',
      linkGroups: [],
    },
  },
}
