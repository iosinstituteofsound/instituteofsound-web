import { useEffect, useState } from 'react'
import { collabSkillLabel } from '@/lib/collab/constants'
import { fetchCollabCompletedCount, fetchProfileCollabSkills } from '@/lib/collab/service'

interface MemberCollabSkillsProps {
  handle: string
  userId: string
}

export function MemberCollabSkills({ handle, userId }: MemberCollabSkillsProps) {
  const [skills, setSkills] = useState<string[]>([])
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    void fetchProfileCollabSkills(handle, userId).then(setSkills)
    void fetchCollabCompletedCount(userId).then(setCompleted)
  }, [handle, userId])

  if (skills.length === 0 && completed === 0) return null

  return (
    <div className="member-collab-skills">
      {skills.length > 0 && (
        <>
          <p className="member-profile-kicker">Collab skills</p>
          <ul className="member-collab-skill-list">
            {skills.map((s) => (
              <li key={s}>{collabSkillLabel(s)}</li>
            ))}
          </ul>
        </>
      )}
      {completed > 0 && (
        <p className="member-collab-trust text-xs text-muted mt-2">
          {completed} verified collab{completed === 1 ? '' : 's'} on the network
        </p>
      )}
    </div>
  )
}
