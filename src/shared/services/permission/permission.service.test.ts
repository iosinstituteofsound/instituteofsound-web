import { describe, expect, it } from 'vitest'
import {
  canAccess,
  canAccessAll,
  canAccessAny,
  matchPermission,
  toPermissionSlug,
} from '@/shared/services/permission/permission.service'

describe('permission.service', () => {
  const permissions = ['users.view', 'roles.create', 'articles.*']

  it('maps read action to view slug', () => {
    expect(toPermissionSlug('users', 'read')).toBe('users.view')
  })

  it('grants super admin all access', () => {
    expect(canAccess([], true, 'users', 'delete')).toBe(true)
  })

  it('checks exact permission match', () => {
    expect(canAccess(permissions, false, 'users', 'read')).toBe(true)
    expect(canAccess(permissions, false, 'users', 'delete')).toBe(false)
  })

  it('supports wildcard permissions', () => {
    expect(matchPermission(['*.*'], 'users.view')).toBe(true)
    expect(matchPermission(permissions, 'articles.publish')).toBe(true)
  })

  it('canAccessAny and canAccessAll work', () => {
    expect(
      canAccessAny(permissions, false, [
        ['users', 'read'],
        ['tribes', 'read'],
      ]),
    ).toBe(true)
    expect(
      canAccessAll(permissions, false, [
        ['users', 'read'],
        ['roles', 'create'],
      ]),
    ).toBe(true)
  })
})
