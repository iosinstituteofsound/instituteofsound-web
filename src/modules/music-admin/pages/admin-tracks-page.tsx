import { useMemo, useState } from 'react'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import {
  useAdminTracks,
  useBulkDeleteAdminTracks,
  useDeleteAdminTrack,
  useUpdateAdminTrack,
} from '@/modules/music-admin/hooks/use-music-admin'
import type { AdminTrackDto } from '@/modules/music/types/music.types'
import { DuplicateTrackAlert } from '@/modules/music/components/duplicate-track-alert'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Pagination } from '@/shared/components/ui/pagination'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState, EmptyState } from '@/shared/components/feedback/states'
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderMain,
  PageTitle,
} from '@/shared/components/layout/page-shell'
import { toast } from '@/shared/components/ui/sonner'
import { usePermission } from '@/shared/hooks/use-permission'
import { probeDuplicateAudio, type DuplicateProbeResult } from '@/modules/music-admin/api/music-admin.api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'

function stripArtistPrefix(artistName: string, title: string) {
  const prefix = `${artistName.trim()} - `
  if (title.toLowerCase().startsWith(prefix.toLowerCase())) {
    return title.slice(prefix.length).trim()
  }
  return title
}

function formatDuration(sec?: number) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

type EditFormValues = { title: string }

export function AdminTracksPage() {
  const { isSuperAdmin } = usePermission()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'ready' | 'failed'>('all')
  const [page, setPage] = useState(1)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [editTarget, setEditTarget] = useState<AdminTrackDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminTrackDto | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [probeFile, setProbeFile] = useState<File | null>(null)
  const [probeResult, setProbeResult] = useState<DuplicateProbeResult | null>(null)
  const [probeLoading, setProbeLoading] = useState(false)

  const queryParams = {
    q: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 25,
  }

  const { data, isLoading, isError, refetch } = useAdminTracks(queryParams)
  const updateTrack = useUpdateAdminTrack()
  const deleteTrack = useDeleteAdminTrack()
  const bulkDelete = useBulkDeleteAdminTracks()

  const form = useForm<EditFormValues>({ defaultValues: { title: '' } })

  const rows = data?.tracks ?? []

  const selectedIds = useMemo(
    () =>
      Object.entries(rowSelection)
        .filter(([, selected]) => selected)
        .map(([index]) => rows[Number(index)]?.id)
        .filter((id): id is string => Boolean(id)),
    [rowSelection, rows],
  )

  const columns = useMemo<ColumnDef<AdminTrackDto>[]>(
    () => [
      ...(isSuperAdmin
        ? [
            {
              id: 'select',
              header: ({ table }) => (
                <Checkbox
                  checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                  }
                  onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
                  aria-label="Select all tracks on this page"
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
                  aria-label={`Select ${row.original.title}`}
                />
              ),
              enableSorting: false,
            } satisfies ColumnDef<AdminTrackDto>,
          ]
        : []),
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="max-w-[240px]">
            <p className="truncate font-medium">{row.original.title}</p>
            {row.original.duplicateInfo?.isDuplicate ? (
              <DuplicateTrackAlert
                duplicateInfo={row.original.duplicateInfo}
                variant="inline"
                className="mt-1"
              />
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'artistName',
        header: 'Artist',
        cell: ({ row }) => row.original.artistName,
      },
      {
        id: 'release',
        header: 'Release',
        cell: ({ row }) => row.original.releaseTitle ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'ready' ? 'secondary' : 'outline'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => formatDuration(row.original.durationSec),
      },
      {
        accessorKey: 'playCount',
        header: 'Plays',
      },
      ...(isSuperAdmin
        ? [
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }) => (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditTarget(row.original)
                      form.reset({
                        title: stripArtistPrefix(row.original.artistName, row.original.title),
                      })
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(row.original)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            } satisfies ColumnDef<AdminTrackDto>,
          ]
        : []),
    ],
    [form, isSuperAdmin],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: isSuperAdmin,
    getRowId: (row) => row.id,
  })

  const handleSearch = () => {
    setPage(1)
    setRowSelection({})
    setSearch(searchInput.trim())
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteTrack.mutateAsync(deleteTarget.id)
      toast.success('Track deleted permanently')
      setDeleteTarget(null)
      setRowSelection({})
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Delete failed'
      toast.error(message)
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    try {
      const result = await bulkDelete.mutateAsync(selectedIds)
      if (result.failedCount > 0) {
        toast.warning(`Deleted ${result.deletedCount}, failed ${result.failedCount}`)
      } else {
        toast.success(`Deleted ${result.deletedCount} track(s)`)
      }
      setBulkDeleteOpen(false)
      setRowSelection({})
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Bulk delete failed'
      toast.error(message)
    }
  }

  const handleProbe = async () => {
    if (!probeFile) {
      toast.error('Choose an audio file first')
      return
    }
    setProbeLoading(true)
    try {
      const result = await probeDuplicateAudio(probeFile)
      setProbeResult(result)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Probe failed'
      toast.error(message)
    } finally {
      setProbeLoading(false)
    }
  }

  const onSubmitEdit = async (values: EditFormValues) => {
    if (!editTarget) return
    const title = values.title.trim()
    if (!title) {
      toast.error('Title is required')
      return
    }
    try {
      await updateTrack.mutateAsync({ id: editTarget.id, title })
      toast.success('Track updated')
      setEditTarget(null)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Update failed'
      toast.error(message)
    }
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderMain>
          <PageTitle>Track Library</PageTitle>
          <PageDescription>
            Super admins can edit or permanently delete any track. Deletion removes audio from R2,
            waveform peaks, fingerprints, playlist references, and analytics.
          </PageDescription>
        </PageHeaderMain>
        {isSuperAdmin && selectedIds.length > 0 ? (
          <Button variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
            Delete selected ({selectedIds.length})
          </Button>
        ) : null}
      </PageHeader>

      {isSuperAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Duplicate probe</CardTitle>
            <CardDescription>
              Upload a remaster or test file to see similarity scores against the catalog (normalized
              fingerprints + sliding windows).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  setProbeFile(e.target.files?.[0] ?? null)
                  setProbeResult(null)
                }}
                className="max-w-md"
              />
              <Button onClick={handleProbe} disabled={probeLoading || !probeFile}>
                {probeLoading ? 'Analyzing…' : 'Run probe'}
              </Button>
            </div>
            {probeResult ? (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  {probeResult.segmentCount} fingerprint segments · {Math.round(probeResult.durationSec)}s
                  · thresholds: exact {probeResult.thresholds.exact}% / likely{' '}
                  {probeResult.thresholds.likely}%
                </p>
                {probeResult.matches.length === 0 ? (
                  <p>No matches above noise. Nearest below threshold:{' '}
                    {probeResult.nearestBelowThreshold
                      ? `${probeResult.nearestBelowThreshold.title} (${Math.round(probeResult.nearestBelowThreshold.score)}%)`
                      : 'none'}
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Track</TableHead>
                          <TableHead>Artist</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Flag</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {probeResult.matches.map((row) => (
                          <TableRow key={row.trackId}>
                            <TableCell className="max-w-[200px] truncate">{row.title}</TableCell>
                            <TableCell>{row.artistName}</TableCell>
                            <TableCell>{Math.round(row.score)}%</TableCell>
                            <TableCell>
                              {row.wouldFlag ? (
                                <Badge variant={row.matchConfidence === 'confirmed' ? 'default' : 'secondary'}>
                                  {row.matchConfidence === 'confirmed' ? 'Confirmed' : 'Likely'}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-end gap-2">
        <Input
          placeholder="Search by title..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as typeof statusFilter)
            setPage(1)
            setRowSelection({})
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>Search</Button>
        {search ? (
          <Button
            variant="outline"
            onClick={() => {
              setSearchInput('')
              setSearch('')
              setPage(1)
              setRowSelection({})
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No tracks found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data && data.totalPages > 1 ? (
            <Pagination page={data.page} pageCount={data.totalPages} onPageChange={setPage} />
          ) : null}
          <p className="text-sm text-muted-foreground">
            Showing {rows.length} of {data?.total ?? 0} tracks
          </p>
        </>
      )}

      <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit track</DialogTitle>
            <DialogDescription>
              Update title for {editTarget?.artistName}. The artist prefix is added automatically.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Track name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTrack.isPending}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete track permanently?</DialogTitle>
            <DialogDescription>
              This removes <span className="font-medium text-foreground">{deleteTarget?.title}</span>{' '}
              from the database, Cloudflare R2 (audio + peaks), fingerprint data, playlists, and
              analytics. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteTrack.isPending}>
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.length} tracks?</DialogTitle>
            <DialogDescription>
              All selected tracks will be permanently removed including R2 audio, peaks, fingerprints,
              and related data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDelete.isPending}>
              Delete {selectedIds.length} tracks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
