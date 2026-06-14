import { useParams } from 'react-router-dom'
import { UserDetailPanel } from '@/modules/users/components/user-detail-panel'
import { Breadcrumb } from '@/shared/components/ui/breadcrumb'

export function UserDetailPage() {
  const { id = '' } = useParams()

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/users' },
          { label: 'Details' },
        ]}
      />
      <h1 className="text-2xl font-bold">User Details</h1>
      <UserDetailPanel userId={id} />
    </div>
  )
}
