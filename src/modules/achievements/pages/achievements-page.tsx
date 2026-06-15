import type { ColumnDef } from '@tanstack/react-table'
import { useGamificationCatalog, useMyGamificationProgress } from '@/modules/badges/hooks/use-gamification'
import type { AchievementDto } from '@/modules/badges/api/gamification.api'
import { DataTable } from '@/shared/components/data-table/data-table'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Page, PageTitle } from '@/shared/components/layout/page-shell'

const columns: ColumnDef<AchievementDto>[] = [
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
]

export function AchievementsPage() {
  const { data, isLoading, isError, refetch } = useGamificationCatalog()
  const { data: progress } = useMyGamificationProgress()

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <Page>
      <PageTitle>Achievements</PageTitle>
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>My Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {progress.achievements.length} achievements unlocked · {progress.badges.length} badges earned
          </CardContent>
        </Card>
      )}
      <DataTable columns={columns} data={data?.achievements ?? []} />
    </Page>
  )
}
