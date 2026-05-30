import type { PathVerificationInfo } from '@/lib/verification/requirements'

type Props = {
  info: PathVerificationInfo
  className?: string
}

export function VerificationRequirementsList({ info, className }: Props) {
  return (
    <div className={className ?? 'member-verification-reqs'}>
      <p className="member-verification-reqs__title">{info.title}</p>
      <ul className="member-verification-reqs__list">
        {info.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {info.note && <p className="member-verification-reqs__note">{info.note}</p>}
    </div>
  )
}
