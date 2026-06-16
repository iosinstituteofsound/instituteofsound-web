export type ProfileVisibility = 'public' | 'friends' | 'private'

export type AboutLink = {
  url: string
  label?: string
  visibility?: ProfileVisibility
}

export type AboutWorkEntry = {
  company: string
  position: string
  startDate?: string
  endDate?: string
  location?: string
  description?: string
  visibility?: ProfileVisibility
}

export type AboutEducationEntry = {
  institution: string
  schoolYear?: string
  subject?: string
  description?: string
  visibility?: ProfileVisibility
}

export type AboutFamilyMember = {
  name: string
  relationship: string
  avatarUrl?: string
  visibility?: ProfileVisibility
}

export type AboutSocialMedia = {
  platform: string
  username: string
  visibility?: ProfileVisibility
}

export type AboutPhone = {
  number: string
  label?: string
  visibility?: ProfileVisibility
}

export type AboutEmail = {
  address: string
  label?: string
  visibility?: ProfileVisibility
}

export type AboutProfile = {
  category?: string
  categoryVisibility?: ProfileVisibility
  pinnedDetails?: {
    category?: string
    location?: string
    workplace?: string
    education?: string
  }
  personalDetails?: {
    currentLocation?: string
    currentLocationVisibility?: ProfileVisibility
    homeTown?: string
    homeTownVisibility?: ProfileVisibility
    birthDate?: string
    birthDateVisibility?: ProfileVisibility
    birthYear?: string
    birthYearVisibility?: ProfileVisibility
    relationshipStatus?: string
    relationshipStatusVisibility?: ProfileVisibility
    familyMembers?: AboutFamilyMember[]
    gender?: string
    genderVisibility?: ProfileVisibility
    pronouns?: string
    pronounsVisibility?: ProfileVisibility
    languages?: string
    languagesVisibility?: ProfileVisibility
  }
  links?: AboutLink[]
  communities?: { name: string; type?: string }[]
  offers?: { title: string; description?: string }[]
  work?: AboutWorkEntry[]
  education?: {
    university?: AboutEducationEntry[]
    secondarySchool?: AboutEducationEntry[]
  }
  hobbies?: string[]
  interests?: {
    music?: string[]
    tvShows?: string[]
    films?: string[]
    games?: string[]
    sports?: string[]
  }
  travel?: { places?: string[] }
  contactInfo?: {
    socialMedia?: AboutSocialMedia[]
    phones?: AboutPhone[]
    emails?: AboutEmail[]
    mediaKit?: string
    mediaKitVisibility?: ProfileVisibility
  }
  privacyLegal?: { notes?: string }
  names?: {
    nickname?: string
    otherNames?: string[]
  }
}

export type AboutSectionId =
  | 'intro'
  | 'category'
  | 'personal-details'
  | 'links'
  | 'communities'
  | 'offers'
  | 'work'
  | 'education'
  | 'hobbies'
  | 'interests'
  | 'travel'
  | 'contact-info'
  | 'privacy-legal'
  | 'names'

export const ABOUT_SECTIONS: { id: AboutSectionId; label: string }[] = [
  { id: 'intro', label: 'Intro' },
  { id: 'category', label: 'Category' },
  { id: 'personal-details', label: 'Personal details' },
  { id: 'links', label: 'Links' },
  { id: 'communities', label: 'Communities' },
  { id: 'offers', label: 'Offers' },
  { id: 'work', label: 'Work' },
  { id: 'education', label: 'Education' },
  { id: 'hobbies', label: 'Hobbies' },
  { id: 'interests', label: 'Interests' },
  { id: 'travel', label: 'Travel' },
  { id: 'contact-info', label: 'Contact info' },
  { id: 'privacy-legal', label: 'Privacy and legal info' },
  { id: 'names', label: 'Names' },
]

export const EMPTY_ABOUT_PROFILE: AboutProfile = {}
