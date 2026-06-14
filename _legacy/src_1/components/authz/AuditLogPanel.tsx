interface AuditLogPanelProps {
  logs: {
    created_at: string
    permission_slug: string
    decision: string
    reason: string
  }[]
}

export function AuditLogPanel({ logs }: AuditLogPanelProps) {
  return (
    <div className="ios-panel p-4 overflow-x-auto">
      <h3 className="font-display font-bold uppercase mb-4">Audit log</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted">
            <th className="py-1 pr-4">Time</th>
            <th className="py-1 pr-4">Permission</th>
            <th className="py-1 pr-4">Decision</th>
            <th className="py-1">Reason</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="border-t border-border/50">
              <td className="py-1 pr-4">{new Date(log.created_at).toLocaleString()}</td>
              <td className="py-1 pr-4">{log.permission_slug}</td>
              <td className="py-1 pr-4">{log.decision}</td>
              <td className="py-1">{log.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
