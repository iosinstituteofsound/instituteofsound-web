import { useMemo, useState } from 'react'
import {
  Briefcase,
  Building2,
  Cake,
  Folder,
  Gamepad2,
  Globe2,
  GraduationCap,
  Heart,
  Link2,
  MapPin,
  Music,
  Percent,
  Phone,
  Tv,
  User,
  Users,
} from 'lucide-react'
import type { AboutProfile, AboutSectionId } from '@/modules/profile/types/about-profile.types'
import { ABOUT_SECTIONS } from '@/modules/profile/types/about-profile.types'
import type { UserDto } from '@/shared/types/auth.types'
import { DividedList } from '@/shared/components/layout'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/cn'
import {
  AboutEmptyHint,
  AboutFieldRow,
  AboutListItem,
  AboutSectionHeader,
  mergeAboutProfile,
} from '@/modules/profile/components/about/about-ui'
import { AboutEditDialog } from '@/modules/profile/components/about/about-edit-dialog'

type ProfileAboutSectionProps = {
  user: UserDto
  editable?: boolean
}

export function ProfileAboutSection({ user, editable = true }: ProfileAboutSectionProps) {
  const [activeSection, setActiveSection] = useState<AboutSectionId>('intro')
  const [editSection, setEditSection] = useState<AboutSectionId | null>(null)
  const about = useMemo(() => mergeAboutProfile(user.aboutProfile), [user.aboutProfile])

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[220px_1fr]">
          <aside className="border-b lg:border-b-0 lg:border-r">
            <div className="p-4 pb-2">
              <h2 className="text-lg font-bold">About</h2>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:overflow-visible lg:px-2 lg:pb-4">
              {ABOUT_SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full',
                    activeSection === id
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-h-[420px] p-4 sm:p-6">
            <AboutSectionPanel
              section={activeSection}
              user={user}
              about={about}
              editable={editable}
              onEdit={() => setEditSection(activeSection)}
            />
          </div>
        </CardContent>
      </Card>

      {editable && editSection ? (
        <AboutEditDialog
          section={editSection}
          user={user}
          about={about}
          open={Boolean(editSection)}
          onOpenChange={(open) => {
            if (!open) setEditSection(null)
          }}
        />
      ) : null}
    </>
  )
}

function AboutSectionPanel({
  section,
  user,
  about,
  editable,
  onEdit,
}: {
  section: AboutSectionId
  user: UserDto
  about: AboutProfile
  editable?: boolean
  onEdit: () => void
}) {
  switch (section) {
    case 'intro':
      return (
        <div className="space-y-6">
          <AboutSectionHeader title="Intro" editable={editable} onEdit={onEdit} />
          <div>
            <p className="mb-2 text-sm font-semibold">Bio</p>
            {user.bio ? (
              <AboutFieldRow value={user.bio} editable={editable} onEdit={onEdit} />
            ) : (
              <AboutEmptyHint
                message="No bio added yet."
                actionLabel="Add bio"
                onAction={editable ? onEdit : undefined}
              />
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Pinned details</p>
            <DividedList>
              <AboutFieldRow
                icon={Folder}
                value={about.pinnedDetails?.category ?? about.category}
                subLabel="Category"
                visibility={about.categoryVisibility}
                editable={editable}
                onEdit={onEdit}
              />
              <AboutFieldRow
                icon={MapPin}
                value={about.pinnedDetails?.location ?? about.personalDetails?.currentLocation}
                subLabel="Current town/city"
                visibility={about.personalDetails?.currentLocationVisibility}
                editable={editable}
                onEdit={onEdit}
              />
              <AboutFieldRow
                icon={Building2}
                value={about.pinnedDetails?.workplace}
                subLabel="Workplace"
                editable={editable}
                onEdit={onEdit}
              />
              <AboutFieldRow
                icon={GraduationCap}
                value={about.pinnedDetails?.education}
                subLabel="Education"
                editable={editable}
                onEdit={onEdit}
              />
              {!about.pinnedDetails?.category &&
              !about.category &&
              !about.pinnedDetails?.location &&
              !about.pinnedDetails?.workplace &&
              !about.pinnedDetails?.education ? (
                <AboutEmptyHint
                  message="Add details you want pinned to your intro."
                  actionLabel="Add pinned details"
                  onAction={editable ? onEdit : undefined}
                />
              ) : null}
            </DividedList>
          </div>
        </div>
      )

    case 'category':
      return (
        <div>
          <AboutSectionHeader title="Category" editable={editable} onEdit={onEdit} />
          {about.category ? (
            <AboutFieldRow
              icon={Folder}
              value={about.category}
              visibility={about.categoryVisibility}
              editable={editable}
              onEdit={onEdit}
            />
          ) : (
            <AboutEmptyHint
              message="Add a category that describes what you do."
              actionLabel="Add category"
              onAction={editable ? onEdit : undefined}
            />
          )}
        </div>
      )

    case 'personal-details':
      return (
        <div>
          <AboutSectionHeader title="Personal details" editable={editable} onEdit={onEdit} />
          <DividedList>
            <AboutFieldRow
              icon={MapPin}
              value={about.personalDetails?.currentLocation}
              subLabel="Current town/city"
              visibility={about.personalDetails?.currentLocationVisibility}
              editable={editable}
              onEdit={onEdit}
            />
            <AboutFieldRow
              icon={MapPin}
              value={about.personalDetails?.homeTown}
              subLabel="Home town"
              visibility={about.personalDetails?.homeTownVisibility}
              editable={editable}
              onEdit={onEdit}
            />
            <AboutFieldRow
              icon={Cake}
              value={about.personalDetails?.birthDate}
              subLabel="Birth date"
              visibility={about.personalDetails?.birthDateVisibility}
              editable={editable}
              onEdit={onEdit}
            />
            <AboutFieldRow
              icon={Cake}
              value={about.personalDetails?.birthYear}
              subLabel="Birth year"
              visibility={about.personalDetails?.birthYearVisibility}
              editable={editable}
              onEdit={onEdit}
            />
            <AboutFieldRow
              icon={Heart}
              value={about.personalDetails?.relationshipStatus}
              subLabel="Status"
              visibility={about.personalDetails?.relationshipStatusVisibility}
              editable={editable}
              onEdit={onEdit}
            />
            {about.personalDetails?.familyMembers?.map((member, index) => (
              <AboutFieldRow
                key={`${member.name}-${index}`}
                icon={Users}
                value={`${member.name} · ${member.relationship}`}
                subLabel="Family"
                visibility={member.visibility}
                editable={editable}
                onEdit={onEdit}
              />
            ))}
            <AboutFieldRow
              value={about.personalDetails?.gender}
              subLabel="Gender"
              visibility={about.personalDetails?.genderVisibility}
              editable={editable}
              onEdit={onEdit}
            />
            <AboutFieldRow
              value={about.personalDetails?.pronouns}
              subLabel="Pronouns"
              visibility={about.personalDetails?.pronounsVisibility}
              editable={editable}
              onEdit={onEdit}
            />
            <AboutFieldRow
              icon={Globe2}
              value={about.personalDetails?.languages}
              subLabel="Languages"
              visibility={about.personalDetails?.languagesVisibility}
              editable={editable}
              onEdit={onEdit}
            />
          </DividedList>
        </div>
      )

    case 'links':
      return (
        <div>
          <AboutSectionHeader
            title="Links"
            description="Add up to 10 links."
            editable={editable}
            onEdit={onEdit}
          />
          {about.links?.length ? (
            <DividedList>
              {about.links.map((link, index) => (
                <AboutListItem
                  key={`${link.url}-${index}`}
                  icon={Link2}
                  primary={link.label || link.url}
                  secondary={link.label ? link.url : undefined}
                  visibility={link.visibility}
                  editable={editable}
                  onEdit={onEdit}
                />
              ))}
            </DividedList>
          ) : (
            <AboutEmptyHint
              message="Share links to your website, portfolio, or social profiles."
              actionLabel="Add links"
              onAction={editable ? onEdit : undefined}
            />
          )}
        </div>
      )

    case 'communities':
      return (
        <div>
          <AboutSectionHeader
            title="Favourite groups"
            description="Add up to 10 of your favourite groups."
            editable={editable}
            onEdit={onEdit}
          />
          {about.communities?.length ? (
            <DividedList>
              {about.communities.map((community, index) => (
                <AboutListItem
                  key={`${community.name}-${index}`}
                  icon={Users}
                  primary={community.name}
                  secondary={community.type}
                  editable={editable}
                  onEdit={onEdit}
                />
              ))}
            </DividedList>
          ) : (
            <AboutEmptyHint
              message="Add communities or groups you're part of."
              actionLabel="Add communities"
              onAction={editable ? onEdit : undefined}
            />
          )}
        </div>
      )

    case 'offers':
      return (
        <div>
          <AboutSectionHeader title="Offers" editable={editable} onEdit={onEdit} />
          {about.offers?.length ? (
            <DividedList>
              {about.offers.map((offer, index) => (
                <AboutListItem
                  key={`${offer.title}-${index}`}
                  icon={Percent}
                  primary={offer.title}
                  secondary={offer.description}
                  editable={editable}
                  onEdit={onEdit}
                />
              ))}
            </DividedList>
          ) : (
            <AboutEmptyHint
              message="Add promotions or affiliate links."
              actionLabel="Add offers"
              onAction={editable ? onEdit : undefined}
            />
          )}
        </div>
      )

    case 'work':
      return (
        <div>
          <AboutSectionHeader title="Work" editable={editable} onEdit={onEdit} />
          {about.work?.length ? (
            <div className="space-y-4">
              {about.work.map((entry, index) => (
                <div key={`${entry.company}-${index}`} className="rounded-lg border p-4">
                  <AboutListItem
                    icon={Briefcase}
                    primary={entry.company}
                    secondary={[
                      entry.position,
                      entry.startDate && entry.endDate
                        ? `${entry.startDate} – ${entry.endDate}`
                        : entry.startDate,
                      entry.location,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    visibility={entry.visibility}
                    editable={editable}
                    onEdit={onEdit}
                  />
                  {entry.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{entry.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <AboutEmptyHint
              message="Add your work experience."
              actionLabel="Add work"
              onAction={editable ? onEdit : undefined}
            />
          )}
        </div>
      )

    case 'education':
      return (
        <div className="space-y-6">
          <AboutSectionHeader title="Education" editable={editable} onEdit={onEdit} />
          <div>
            <p className="mb-3 text-sm font-semibold">University</p>
            {about.education?.university?.length ? (
              <div className="space-y-3">
                {about.education.university.map((entry, index) => (
                  <div key={`${entry.institution}-${index}`} className="rounded-lg border p-4">
                    <AboutListItem
                      icon={GraduationCap}
                      primary={entry.institution}
                      secondary={[
                        entry.schoolYear ? `School year ${entry.schoolYear}` : null,
                        entry.subject ? `Subject: ${entry.subject}` : null,
                        entry.description ? `Description: ${entry.description}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      visibility={entry.visibility}
                      editable={editable}
                      onEdit={onEdit}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <AboutEmptyHint message="Add university or college education." actionLabel="Add university" onAction={editable ? onEdit : undefined} />
            )}
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Secondary school</p>
            {about.education?.secondarySchool?.length ? (
              <div className="space-y-3">
                {about.education.secondarySchool.map((entry, index) => (
                  <div key={`${entry.institution}-${index}`} className="rounded-lg border p-4">
                    <AboutListItem
                      icon={GraduationCap}
                      primary={entry.institution}
                      secondary={entry.schoolYear ? `School year ${entry.schoolYear}` : undefined}
                      visibility={entry.visibility}
                      editable={editable}
                      onEdit={onEdit}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <AboutEmptyHint message="Add secondary school education." actionLabel="Add secondary school" onAction={editable ? onEdit : undefined} />
            )}
          </div>
        </div>
      )

    case 'hobbies':
      return (
        <div>
          <AboutSectionHeader title="Hobbies" editable={editable} onEdit={onEdit} />
          {about.hobbies?.length ? (
            <div className="flex flex-wrap gap-2">
              {about.hobbies.map((hobby) => (
                <span key={hobby} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {hobby}
                </span>
              ))}
            </div>
          ) : (
            <AboutEmptyHint message="Add hobbies you enjoy." actionLabel="Add hobbies" onAction={editable ? onEdit : undefined} />
          )}
        </div>
      )

    case 'interests':
      return (
        <div className="space-y-5">
          <AboutSectionHeader title="Interests" editable={editable} onEdit={onEdit} />
          <InterestGroup title="Music" icon={Music} items={about.interests?.music} />
          <InterestGroup title="TV programmes" icon={Tv} items={about.interests?.tvShows} />
          <InterestGroup title="Films" icon={Tv} items={about.interests?.films} />
          <InterestGroup title="Games" icon={Gamepad2} items={about.interests?.games} />
          <InterestGroup title="Sports teams and athletes" icon={Heart} items={about.interests?.sports} />
          {!about.interests ? (
            <AboutEmptyHint message="Add your interests." actionLabel="Add interests" onAction={editable ? onEdit : undefined} />
          ) : null}
        </div>
      )

    case 'travel':
      return (
        <div>
          <AboutSectionHeader
            title="Travel"
            description="Add up to 450 places you've visited."
            editable={editable}
            onEdit={onEdit}
          />
          {about.travel?.places?.length ? (
            <div className="flex flex-wrap gap-2">
              {about.travel.places.map((place) => (
                <span key={place} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {place}
                </span>
              ))}
            </div>
          ) : (
            <AboutEmptyHint message="Add places you've visited." actionLabel="Add places" onAction={editable ? onEdit : undefined} />
          )}
        </div>
      )

    case 'contact-info':
      return (
        <div className="space-y-6">
          <AboutSectionHeader title="Contact info" editable={editable} onEdit={onEdit} />
          <div>
            <p className="mb-2 text-sm font-semibold">Social media</p>
            <DividedList>
              {about.contactInfo?.socialMedia?.map((item, index) => (
                <AboutListItem
                  key={`${item.platform}-${index}`}
                  primary={`${item.platform}: ${item.username}`}
                  visibility={item.visibility}
                  editable={editable}
                  onEdit={onEdit}
                />
              )) ?? (
                <AboutEmptyHint message="Add social media profiles." actionLabel="Add social media" onAction={editable ? onEdit : undefined} />
              )}
            </DividedList>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Phone</p>
            <DividedList>
              {about.contactInfo?.phones?.map((phone, index) => (
                <AboutListItem
                  key={`${phone.number}-${index}`}
                  icon={Phone}
                  primary={phone.number}
                  secondary={phone.label}
                  visibility={phone.visibility}
                  editable={editable}
                  onEdit={onEdit}
                />
              )) ?? null}
            </DividedList>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Email</p>
            <DividedList>
              {about.contactInfo?.emails?.map((email, index) => (
                <AboutListItem
                  key={`${email.address}-${index}`}
                  primary={email.address}
                  secondary={email.label ?? 'Email address'}
                  visibility={email.visibility}
                  editable={editable}
                  onEdit={onEdit}
                />
              )) ?? null}
            </DividedList>
          </div>
          {about.contactInfo?.mediaKit ? (
            <AboutFieldRow
              value={about.contactInfo.mediaKit}
              subLabel="Media kit"
              visibility={about.contactInfo.mediaKitVisibility}
              editable={editable}
              onEdit={onEdit}
            />
          ) : null}
        </div>
      )

    case 'privacy-legal':
      return (
        <div>
          <AboutSectionHeader title="Privacy and legal info" editable={editable} onEdit={onEdit} />
          {about.privacyLegal?.notes ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{about.privacyLegal.notes}</p>
          ) : (
            <AboutEmptyHint
              message="Add privacy or legal information you want visible on your profile."
              actionLabel="Add info"
              onAction={editable ? onEdit : undefined}
            />
          )}
        </div>
      )

    case 'names':
      return (
        <div>
          <AboutSectionHeader title="Names" editable={editable} onEdit={onEdit} />
          <DividedList>
            <AboutFieldRow icon={User} value={user.name} subLabel="Display name" />
            <AboutFieldRow value={about.names?.nickname} subLabel="Nickname" editable={editable} onEdit={onEdit} />
            {about.names?.otherNames?.map((name) => (
              <AboutFieldRow key={name} value={name} subLabel="Other name" editable={editable} onEdit={onEdit} />
            ))}
          </DividedList>
        </div>
      )

    default:
      return null
  }
}

function InterestGroup({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items?: string[]
}) {
  if (!items?.length) return null

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="flex items-start gap-3 rounded-lg border px-4 py-3">
        <Icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full bg-muted px-3 py-1 text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
