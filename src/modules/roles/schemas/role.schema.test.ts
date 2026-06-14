import { describe, expect, it } from 'vitest'
import { createRoleSchema } from '@/modules/roles/schemas/role.schema'

describe('createRoleSchema', () => {
  it('accepts valid role input', () => {
    const result = createRoleSchema.safeParse({
      name: 'Editor',
      layoutId: '507f1f77bcf86cd799439011',
      featureIds: ['507f1f77bcf86cd799439012'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid layout id', () => {
    const result = createRoleSchema.safeParse({
      name: 'Editor',
      layoutId: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('requires name', () => {
    const result = createRoleSchema.safeParse({
      name: '',
      layoutId: '507f1f77bcf86cd799439011',
    })
    expect(result.success).toBe(false)
  })
})
