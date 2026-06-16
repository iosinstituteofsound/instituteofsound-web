import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import type {
  AboutProfile,
  AboutSectionId,
  ProfileVisibility,
} from '@/modules/profile/types/about-profile.types'
import { ABOUT_SECTIONS } from '@/modules/profile/types/about-profile.types'
import type { UserDto } from '@/shared/types/auth.types'
import { useUpdateProfile } from '@/modules/profile/hooks/use-profile'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/components/ui/sonner'

type AboutEditDialogProps = {
  section: AboutSectionId
  user: UserDto
  about: AboutProfile
  open: boolean
  onOpenChange: (open: boolean) => void
}

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'friends', label: 'Friends' },
  { value: 'private', label: 'Only me' },
]

export function AboutEditDialog({ section, user, about, open, onOpenChange }: AboutEditDialogProps) {
  const updateProfile = useUpdateProfile()
  const [draft, setDraft] = useState<AboutProfile>(about)
  const [bio, setBio] = useState(user.bio ?? '')

  useEffect(() => {
    if (!open) return
    setDraft(structuredClone(about))
    setBio(user.bio ?? '')
  }, [open, about, user.bio])

  const sectionLabel = ABOUT_SECTIONS.find((item) => item.id === section)?.label ?? 'About'

  const save = async () => {
    try {
      const payload: { aboutProfile: AboutProfile; bio?: string | null } = {
        aboutProfile: draft,
      }
      if (section === 'intro') {
        payload.bio = bio.trim() || null
      }
      await updateProfile.mutateAsync(payload)
      toast.success(`${sectionLabel} updated`)
      onOpenChange(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to save'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit {sectionLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {section === 'intro' ? (
            <>
              <Field label="Bio">
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
              </Field>
              <Field label="Pinned category">
                <Input
                  value={draft.pinnedDetails?.category ?? draft.category ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      category: e.target.value,
                      pinnedDetails: { ...prev.pinnedDetails, category: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Pinned location">
                <Input
                  value={draft.pinnedDetails?.location ?? draft.personalDetails?.currentLocation ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      pinnedDetails: { ...prev.pinnedDetails, location: e.target.value },
                      personalDetails: { ...prev.personalDetails, currentLocation: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Pinned workplace">
                <Input
                  value={draft.pinnedDetails?.workplace ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      pinnedDetails: { ...prev.pinnedDetails, workplace: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Pinned education">
                <Input
                  value={draft.pinnedDetails?.education ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      pinnedDetails: { ...prev.pinnedDetails, education: e.target.value },
                    }))
                  }
                />
              </Field>
            </>
          ) : null}

          {section === 'category' ? (
            <>
              <Field label="Category">
                <Input
                  value={draft.category ?? ''}
                  onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Digital creator"
                />
              </Field>
              <VisibilityField
                value={draft.categoryVisibility}
                onChange={(value) => setDraft((prev) => ({ ...prev, categoryVisibility: value }))}
              />
            </>
          ) : null}

          {section === 'personal-details' ? (
            <>
              <Field label="Current town/city">
                <Input
                  value={draft.personalDetails?.currentLocation ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, currentLocation: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Home town">
                <Input
                  value={draft.personalDetails?.homeTown ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, homeTown: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Birth date">
                <Input
                  value={draft.personalDetails?.birthDate ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, birthDate: e.target.value },
                    }))
                  }
                  placeholder="2 March"
                />
              </Field>
              <Field label="Birth year">
                <Input
                  value={draft.personalDetails?.birthYear ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, birthYear: e.target.value },
                    }))
                  }
                  placeholder="1998"
                />
              </Field>
              <Field label="Relationship status">
                <Input
                  value={draft.personalDetails?.relationshipStatus ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, relationshipStatus: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Gender">
                <Input
                  value={draft.personalDetails?.gender ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, gender: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Pronouns">
                <Input
                  value={draft.personalDetails?.pronouns ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, pronouns: e.target.value },
                    }))
                  }
                  placeholder="he/him"
                />
              </Field>
              <Field label="Languages">
                <Input
                  value={draft.personalDetails?.languages ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, languages: e.target.value },
                    }))
                  }
                />
              </Field>
              <FamilyMembersEditor
                members={draft.personalDetails?.familyMembers ?? []}
                onChange={(familyMembers) =>
                  setDraft((prev) => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, familyMembers },
                  }))
                }
              />
            </>
          ) : null}

          {section === 'links' ? (
            <LinksEditor
              links={draft.links ?? []}
              onChange={(links) => setDraft((prev) => ({ ...prev, links }))}
            />
          ) : null}

          {section === 'communities' ? (
            <CommunitiesEditor
              communities={draft.communities ?? []}
              onChange={(communities) => setDraft((prev) => ({ ...prev, communities }))}
            />
          ) : null}

          {section === 'offers' ? (
            <OffersEditor offers={draft.offers ?? []} onChange={(offers) => setDraft((prev) => ({ ...prev, offers }))} />
          ) : null}

          {section === 'work' ? (
            <WorkEditor work={draft.work ?? []} onChange={(work) => setDraft((prev) => ({ ...prev, work }))} />
          ) : null}

          {section === 'education' ? (
            <EducationEditor
              education={draft.education ?? {}}
              onChange={(education) => setDraft((prev) => ({ ...prev, education }))}
            />
          ) : null}

          {section === 'hobbies' ? (
            <TagsEditor
              label="Hobbies"
              values={draft.hobbies ?? []}
              onChange={(hobbies) => setDraft((prev) => ({ ...prev, hobbies }))}
            />
          ) : null}

          {section === 'interests' ? (
            <>
              <TagsEditor
                label="Music"
                values={draft.interests?.music ?? []}
                onChange={(music) =>
                  setDraft((prev) => ({ ...prev, interests: { ...prev.interests, music } }))
                }
              />
              <TagsEditor
                label="TV programmes"
                values={draft.interests?.tvShows ?? []}
                onChange={(tvShows) =>
                  setDraft((prev) => ({ ...prev, interests: { ...prev.interests, tvShows } }))
                }
              />
              <TagsEditor
                label="Films"
                values={draft.interests?.films ?? []}
                onChange={(films) =>
                  setDraft((prev) => ({ ...prev, interests: { ...prev.interests, films } }))
                }
              />
              <TagsEditor
                label="Games"
                values={draft.interests?.games ?? []}
                onChange={(games) =>
                  setDraft((prev) => ({ ...prev, interests: { ...prev.interests, games } }))
                }
              />
              <TagsEditor
                label="Sports teams and athletes"
                values={draft.interests?.sports ?? []}
                onChange={(sports) =>
                  setDraft((prev) => ({ ...prev, interests: { ...prev.interests, sports } }))
                }
              />
            </>
          ) : null}

          {section === 'travel' ? (
            <TagsEditor
              label="Places visited"
              values={draft.travel?.places ?? []}
              onChange={(places) => setDraft((prev) => ({ ...prev, travel: { places } }))}
            />
          ) : null}

          {section === 'contact-info' ? (
            <ContactInfoEditor
              contactInfo={draft.contactInfo ?? {}}
              onChange={(contactInfo) => setDraft((prev) => ({ ...prev, contactInfo }))}
            />
          ) : null}

          {section === 'privacy-legal' ? (
            <Field label="Privacy and legal notes">
              <Textarea
                value={draft.privacyLegal?.notes ?? ''}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    privacyLegal: { notes: e.target.value },
                  }))
                }
                rows={5}
              />
            </Field>
          ) : null}

          {section === 'names' ? (
            <>
              <Field label="Nickname">
                <Input
                  value={draft.names?.nickname ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      names: { ...prev.names, nickname: e.target.value },
                    }))
                  }
                />
              </Field>
              <TagsEditor
                label="Other names"
                values={draft.names?.otherNames ?? []}
                onChange={(otherNames) =>
                  setDraft((prev) => ({
                    ...prev,
                    names: { ...prev.names, otherNames },
                  }))
                }
              />
            </>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function VisibilityField({
  value,
  onChange,
}: {
  value?: ProfileVisibility
  onChange: (value: ProfileVisibility) => void
}) {
  return (
    <Field label="Visibility">
      <Select value={value ?? 'public'} onValueChange={(next) => onChange(next as ProfileVisibility)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VISIBILITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

function TagsEditor({
  label,
  values,
  onChange,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const next = input.trim()
    if (!next || values.includes(next)) return
    onChange([...values, next])
    setInput('')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} />
        <Button type="button" variant="secondary" onClick={add}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(values.filter((item) => item !== value))}
            className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/70"
          >
            {value} ×
          </button>
        ))}
      </div>
    </div>
  )
}

function LinksEditor({
  links,
  onChange,
}: {
  links: NonNullable<AboutProfile['links']>
  onChange: (links: NonNullable<AboutProfile['links']>) => void
}) {
  const update = (index: number, patch: Partial<(typeof links)[number]>) => {
    onChange(links.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const add = () => onChange([...links, { url: '', visibility: 'public' }])
  const remove = (index: number) => onChange(links.filter((_, i) => i !== index))

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={index} className="space-y-2 rounded-lg border p-3">
          <Field label="URL">
            <Input value={link.url} onChange={(e) => update(index, { url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="Label (optional)">
            <Input value={link.label ?? ''} onChange={(e) => update(index, { label: e.target.value })} />
          </Field>
          <VisibilityField value={link.visibility} onChange={(visibility) => update(index, { visibility })} />
          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={add} disabled={links.length >= 10}>
        <Plus className="mr-2 h-4 w-4" />
        Add link
      </Button>
    </div>
  )
}

function CommunitiesEditor({
  communities,
  onChange,
}: {
  communities: NonNullable<AboutProfile['communities']>
  onChange: (communities: NonNullable<AboutProfile['communities']>) => void
}) {
  const update = (index: number, patch: Partial<(typeof communities)[number]>) => {
    onChange(communities.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-3">
      {communities.map((community, index) => (
        <div key={index} className="space-y-2 rounded-lg border p-3">
          <Field label="Group name">
            <Input value={community.name} onChange={(e) => update(index, { name: e.target.value })} />
          </Field>
          <Field label="Type">
            <Input value={community.type ?? ''} onChange={(e) => update(index, { type: e.target.value })} />
          </Field>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(communities.filter((_, i) => i !== index))}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...communities, { name: '' }])}>
        <Plus className="mr-2 h-4 w-4" />
        Add group
      </Button>
    </div>
  )
}

function OffersEditor({
  offers,
  onChange,
}: {
  offers: NonNullable<AboutProfile['offers']>
  onChange: (offers: NonNullable<AboutProfile['offers']>) => void
}) {
  const update = (index: number, patch: Partial<(typeof offers)[number]>) => {
    onChange(offers.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-3">
      {offers.map((offer, index) => (
        <div key={index} className="space-y-2 rounded-lg border p-3">
          <Field label="Title">
            <Input value={offer.title} onChange={(e) => update(index, { title: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea value={offer.description ?? ''} onChange={(e) => update(index, { description: e.target.value })} rows={3} />
          </Field>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(offers.filter((_, i) => i !== index))}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...offers, { title: '' }])}>
        <Plus className="mr-2 h-4 w-4" />
        Add offer
      </Button>
    </div>
  )
}

function WorkEditor({
  work,
  onChange,
}: {
  work: NonNullable<AboutProfile['work']>
  onChange: (work: NonNullable<AboutProfile['work']>) => void
}) {
  const update = (index: number, patch: Partial<(typeof work)[number]>) => {
    onChange(work.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-3">
      {work.map((entry, index) => (
        <div key={index} className="space-y-2 rounded-lg border p-3">
          <Field label="Company">
            <Input value={entry.company} onChange={(e) => update(index, { company: e.target.value })} />
          </Field>
          <Field label="Position">
            <Input value={entry.position} onChange={(e) => update(index, { position: e.target.value })} />
          </Field>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Start date">
              <Input value={entry.startDate ?? ''} onChange={(e) => update(index, { startDate: e.target.value })} />
            </Field>
            <Field label="End date">
              <Input value={entry.endDate ?? ''} onChange={(e) => update(index, { endDate: e.target.value })} placeholder="Present" />
            </Field>
          </div>
          <Field label="Location">
            <Input value={entry.location ?? ''} onChange={(e) => update(index, { location: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea value={entry.description ?? ''} onChange={(e) => update(index, { description: e.target.value })} rows={4} />
          </Field>
          <VisibilityField value={entry.visibility} onChange={(visibility) => update(index, { visibility })} />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(work.filter((_, i) => i !== index))}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...work, { company: '', position: '', visibility: 'public' }])}>
        <Plus className="mr-2 h-4 w-4" />
        Add work
      </Button>
    </div>
  )
}

function EducationEditor({
  education,
  onChange,
}: {
  education: NonNullable<AboutProfile['education']>
  onChange: (education: NonNullable<AboutProfile['education']>) => void
}) {
  const renderList = (
    key: 'university' | 'secondarySchool',
    label: string,
    entries: NonNullable<AboutProfile['education']>[typeof key] = [],
  ) => (
    <div className="space-y-3">
      <p className="text-sm font-semibold">{label}</p>
      {entries.map((entry, index) => (
        <div key={index} className="space-y-2 rounded-lg border p-3">
          <Field label="Institution">
            <Input
              value={entry.institution}
              onChange={(e) => {
                const next = [...entries]
                next[index] = { ...entry, institution: e.target.value }
                onChange({ ...education, [key]: next })
              }}
            />
          </Field>
          <Field label="School year">
            <Input
              value={entry.schoolYear ?? ''}
              onChange={(e) => {
                const next = [...entries]
                next[index] = { ...entry, schoolYear: e.target.value }
                onChange({ ...education, [key]: next })
              }}
            />
          </Field>
          {key === 'university' ? (
            <>
              <Field label="Subject">
                <Input
                  value={entry.subject ?? ''}
                  onChange={(e) => {
                    const next = [...entries]
                    next[index] = { ...entry, subject: e.target.value }
                    onChange({ ...education, [key]: next })
                  }}
                />
              </Field>
              <Field label="Description">
                <Input
                  value={entry.description ?? ''}
                  onChange={(e) => {
                    const next = [...entries]
                    next[index] = { ...entry, description: e.target.value }
                    onChange({ ...education, [key]: next })
                  }}
                />
              </Field>
            </>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ ...education, [key]: entries.filter((_, i) => i !== index) })}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          onChange({
            ...education,
            [key]: [...entries, { institution: '', visibility: 'public' }],
          })
        }
      >
        <Plus className="mr-2 h-4 w-4" />
        Add {label.toLowerCase()}
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {renderList('university', 'University', education.university ?? [])}
      {renderList('secondarySchool', 'Secondary school', education.secondarySchool ?? [])}
    </div>
  )
}

function FamilyMembersEditor({
  members,
  onChange,
}: {
  members: NonNullable<NonNullable<AboutProfile['personalDetails']>['familyMembers']>
  onChange: (members: NonNullable<NonNullable<AboutProfile['personalDetails']>['familyMembers']>) => void
}) {
  const update = (index: number, patch: Partial<(typeof members)[number]>) => {
    onChange(members.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-3">
      <Label>Family members</Label>
      {members.map((member, index) => (
        <div key={index} className="space-y-2 rounded-lg border p-3">
          <Field label="Name">
            <Input value={member.name} onChange={(e) => update(index, { name: e.target.value })} />
          </Field>
          <Field label="Relationship">
            <Input value={member.relationship} onChange={(e) => update(index, { relationship: e.target.value })} />
          </Field>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(members.filter((_, i) => i !== index))}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...members, { name: '', relationship: '' }])}>
        <Plus className="mr-2 h-4 w-4" />
        Add family member
      </Button>
    </div>
  )
}

function ContactInfoEditor({
  contactInfo,
  onChange,
}: {
  contactInfo: NonNullable<AboutProfile['contactInfo']>
  onChange: (contactInfo: NonNullable<AboutProfile['contactInfo']>) => void
}) {
  const socialMedia = contactInfo.socialMedia ?? []
  const phones = contactInfo.phones ?? []
  const emails = contactInfo.emails ?? []

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Social media</Label>
        {socialMedia.map((item, index) => (
          <div key={index} className="space-y-2 rounded-lg border p-3">
            <Field label="Platform">
              <Input
                value={item.platform}
                onChange={(e) => {
                  const next = [...socialMedia]
                  next[index] = { ...item, platform: e.target.value }
                  onChange({ ...contactInfo, socialMedia: next })
                }}
              />
            </Field>
            <Field label="Username">
              <Input
                value={item.username}
                onChange={(e) => {
                  const next = [...socialMedia]
                  next[index] = { ...item, username: e.target.value }
                  onChange({ ...contactInfo, socialMedia: next })
                }}
              />
            </Field>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...contactInfo, socialMedia: socialMedia.filter((_, i) => i !== index) })}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange({ ...contactInfo, socialMedia: [...socialMedia, { platform: '', username: '' }] })}>
          <Plus className="mr-2 h-4 w-4" />
          Add social media
        </Button>
      </div>

      <div className="space-y-3">
        <Label>Phone numbers</Label>
        {phones.map((phone, index) => (
          <div key={index} className="space-y-2 rounded-lg border p-3">
            <Field label="Number">
              <Input
                value={phone.number}
                onChange={(e) => {
                  const next = [...phones]
                  next[index] = { ...phone, number: e.target.value }
                  onChange({ ...contactInfo, phones: next })
                }}
              />
            </Field>
            <Field label="Label">
              <Input
                value={phone.label ?? ''}
                onChange={(e) => {
                  const next = [...phones]
                  next[index] = { ...phone, label: e.target.value }
                  onChange({ ...contactInfo, phones: next })
                }}
              />
            </Field>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...contactInfo, phones: phones.filter((_, i) => i !== index) })}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange({ ...contactInfo, phones: [...phones, { number: '', label: 'Mobile' }] })}>
          <Plus className="mr-2 h-4 w-4" />
          Add phone
        </Button>
      </div>

      <div className="space-y-3">
        <Label>Email addresses</Label>
        {emails.map((email, index) => (
          <div key={index} className="space-y-2 rounded-lg border p-3">
            <Field label="Email">
              <Input
                value={email.address}
                onChange={(e) => {
                  const next = [...emails]
                  next[index] = { ...email, address: e.target.value }
                  onChange({ ...contactInfo, emails: next })
                }}
              />
            </Field>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...contactInfo, emails: emails.filter((_, i) => i !== index) })}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange({ ...contactInfo, emails: [...emails, { address: '', label: 'Email address' }] })}>
          <Plus className="mr-2 h-4 w-4" />
          Add email
        </Button>
      </div>

      <Field label="Media kit URL">
        <Input
          value={contactInfo.mediaKit ?? ''}
          onChange={(e) => onChange({ ...contactInfo, mediaKit: e.target.value })}
        />
      </Field>
    </div>
  )
}
