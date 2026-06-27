import { isRegisteredResource, type ResourceType } from '@/shared/lib/resource-registry'

export function hasResource(
  resourceNames: string[],
  _isSuperAdmin: boolean,
  name: string,
  type: ResourceType = 'PAGE',
): boolean {
  if (!isRegisteredResource(name, type)) return false
  return resourceNames.includes(name)
}

export function hasAnyResource(
  resourceNames: string[],
  isSuperAdmin: boolean,
  names: string[],
  type: ResourceType = 'PAGE',
): boolean {
  return names.some((name) => hasResource(resourceNames, isSuperAdmin, name, type))
}
