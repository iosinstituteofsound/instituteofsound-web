import { useParams } from 'react-router-dom'
import { UserDetailPanel } from '@/modules/users/components/user-detail-panel'
import { Breadcrumb } from '@/shared/components/ui/breadcrumb'
import { Page, PageTitle } from '@/shared/components/layout/page-shell'

export function UserDetailPage() {
  const { id = '' } = useParams()

  return (
    <Page>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/users' },
          { label: 'Details' },
        ]}
      />
      <PageTitle>User Details</PageTitle>
      <UserDetailPanel userId={id} />
    </Page>
  )
}
