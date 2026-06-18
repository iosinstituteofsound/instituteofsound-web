import { Card, CardContent } from '@/shared/components/ui/card'

type ProfileTabEmptyProps = {
  message: string
}

export function ProfileTabEmpty({ message }: ProfileTabEmptyProps) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">{message}</CardContent>
    </Card>
  )
}
