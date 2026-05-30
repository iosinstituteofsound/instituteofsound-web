import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

const HomePage = lazy(() => import('@/pages/HomePage'))
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage'))
const ReleasesPage = lazy(() => import('@/pages/ReleasesPage'))
const LabelsPage = lazy(() => import('@/pages/LabelsPage'))
const PlaylistsPage = lazy(() => import('@/pages/PlaylistsPage'))
const SignalsPage = lazy(() => import('@/pages/SignalsPage'))
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'))
const CommunityPage = lazy(() => import('@/pages/CommunityPage'))
const CommunityMemberPage = lazy(() => import('@/pages/CommunityMemberPage'))
const MessagesPage = lazy(() => import('@/pages/MessagesPage'))
const FeedPage = lazy(() => import('@/pages/FeedPage'))
const FeedPostPage = lazy(() => import('@/pages/FeedPostPage'))
const SubmissionsPage = lazy(() => import('@/pages/SubmissionsPage'))
const ArchivePage = lazy(() => import('@/pages/ArchivePage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const ArtistDetailPage = lazy(() => import('@/pages/ArtistDetailPage'))
const ArtistEpkPage = lazy(() => import('@/pages/ArtistEpkPage'))
const PlaylistDetailPage = lazy(() => import('@/pages/PlaylistDetailPage'))
const FeatureDetailPage = lazy(() => import('@/pages/FeatureDetailPage'))
const ReleaseDetailPage = lazy(() => import('@/pages/ReleaseDetailPage'))
const TrackDetailPage = lazy(() => import('@/pages/TrackDetailPage'))
const ScenesIndexPage = lazy(() => import('@/pages/ScenesIndexPage'))
const SceneHubPage = lazy(() => import('@/pages/SceneHubPage'))
const CollabBoardPage = lazy(() => import('@/pages/CollabBoardPage'))
const EventsIndexPage = lazy(() => import('@/pages/EventsIndexPage'))
const ToolsHubPage = lazy(() => import('@/pages/tools/ToolsHubPage'))
const MusicPromptToolPage = lazy(() => import('@/pages/tools/MusicPromptToolPage'))
const ChordToolPage = lazy(() => import('@/pages/tools/ChordToolPage'))
const ArtistNameToolPage = lazy(() => import('@/pages/tools/ArtistNameToolPage'))
const VocalChainToolPage = lazy(() => import('@/pages/tools/VocalChainToolPage'))
const TuningToolPage = lazy(() => import('@/pages/tools/TuningToolPage'))
const BpmToolPage = lazy(() => import('@/pages/tools/BpmToolPage'))
const TapTempoToolPage = lazy(() => import('@/pages/tools/TapTempoToolPage'))
const SpectrumToolPage = lazy(() => import('@/pages/tools/SpectrumToolPage'))
const ClippingToolPage = lazy(() => import('@/pages/tools/ClippingToolPage'))
const LoudnessToolPage = lazy(() => import('@/pages/tools/LoudnessToolPage'))
const KeyScaleToolPage = lazy(() => import('@/pages/tools/KeyScaleToolPage'))
const LyricsToolPage = lazy(() => import('@/pages/tools/LyricsToolPage'))
const SetlistToolPage = lazy(() => import('@/pages/tools/SetlistToolPage'))
const AudioFormatToolPage = lazy(() => import('@/pages/tools/AudioFormatToolPage'))
const SubgenreTagsToolPage = lazy(() => import('@/pages/tools/SubgenreTagsToolPage'))
const ExportChecklistToolPage = lazy(() => import('@/pages/tools/ExportChecklistToolPage'))
const AcademyHubPage = lazy(() => import('@/pages/academy/AcademyHubPage'))
const AcademyTrackPage = lazy(() => import('@/pages/academy/AcademyTrackPage'))
const AcademyLessonPage = lazy(() => import('@/pages/academy/AcademyLessonPage'))
const AcademyQuizzesHubPage = lazy(() => import('@/pages/academy/AcademyQuizzesHubPage'))
const AcademyQuizPage = lazy(() => import('@/pages/academy/AcademyQuizPage'))
const AcademyEarLabPage = lazy(() => import('@/pages/academy/AcademyEarLabPage'))
const AcademyCertificatesPage = lazy(() => import('@/pages/academy/AcademyCertificatesPage'))
const AcademyCertificatePage = lazy(() => import('@/pages/academy/AcademyCertificatePage'))

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const DeskLoginPage = lazy(() => import('@/pages/auth/DeskLoginPage'))
const EditorJoinPage = lazy(() => import('@/pages/auth/EditorJoinPage'))
const EditorLoginPage = lazy(() => import('@/pages/auth/EditorLoginPage'))
const EditorApplyPage = lazy(() => import('@/pages/editor/EditorApplyPage'))
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const DashboardRedirectPage = lazy(
  () => import('@/pages/dashboard/DashboardRedirectPage')
)
const ArtistDashboardPage = lazy(
  () => import('@/pages/dashboard/ArtistDashboardPage')
)
const ArtistIosSupportPage = lazy(
  () => import('@/pages/support/ArtistIosSupportPage')
)
const MemberDashboardPage = lazy(
  () => import('@/pages/dashboard/MemberDashboardPage')
)
const MemberUpgradeArtistPage = lazy(
  () => import('@/pages/dashboard/MemberUpgradeArtistPage')
)
const PlaylistCuratorApplyPage = lazy(
  () => import('@/pages/dashboard/PlaylistCuratorApplyPage')
)
const EditorDashboardPage = lazy(
  () => import('@/pages/dashboard/EditorDashboardPage')
)

function PageLoader() {
  return <LoadingTransmission variant="hell" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="releases" element={<ReleasesPage />} />
            <Route path="labels" element={<LabelsPage />} />
            <Route path="playlists" element={<PlaylistsPage />} />
            <Route path="signals" element={<SignalsPage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="feed/:postId" element={<FeedPostPage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="network/:handle" element={<CommunityMemberPage />} />
            <Route
              path="messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="academy" element={<AcademyHubPage />} />
            <Route path="academy/quizzes" element={<AcademyQuizzesHubPage />} />
            <Route path="academy/quiz/:quiz" element={<AcademyQuizPage />} />
            <Route path="academy/ear-lab" element={<AcademyEarLabPage />} />
            <Route path="academy/certificates" element={<AcademyCertificatesPage />} />
            <Route path="academy/certificate/:cert" element={<AcademyCertificatePage />} />
            <Route path="academy/:track" element={<AcademyTrackPage />} />
            <Route path="academy/:track/:lesson" element={<AcademyLessonPage />} />
            <Route path="tools" element={<ToolsHubPage />} />
            <Route path="tools/music-prompt" element={<MusicPromptToolPage />} />
            <Route path="tools/chords" element={<ChordToolPage />} />
            <Route path="tools/artist-name" element={<ArtistNameToolPage />} />
            <Route path="tools/vocal-chain" element={<VocalChainToolPage />} />
            <Route path="tools/tuning" element={<TuningToolPage />} />
            <Route path="tools/bpm" element={<BpmToolPage />} />
            <Route path="tools/tap-tempo" element={<TapTempoToolPage />} />
            <Route path="tools/spectrum" element={<SpectrumToolPage />} />
            <Route path="tools/clipping" element={<ClippingToolPage />} />
            <Route path="tools/loudness" element={<LoudnessToolPage />} />
            <Route path="tools/key-scale" element={<KeyScaleToolPage />} />
            <Route path="tools/lyrics" element={<LyricsToolPage />} />
            <Route path="tools/setlist" element={<SetlistToolPage />} />
            <Route path="tools/audio-format" element={<AudioFormatToolPage />} />
            <Route path="tools/subgenre-tags" element={<SubgenreTagsToolPage />} />
            <Route path="tools/export-checklist" element={<ExportChecklistToolPage />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="artist/:slug/epk" element={<ArtistEpkPage />} />
            <Route path="artist/:slug" element={<ArtistDetailPage />} />
            <Route path="playlist/:slug" element={<PlaylistDetailPage />} />
            <Route path="feature/:slug" element={<FeatureDetailPage />} />
            <Route path="release/:slug" element={<ReleaseDetailPage />} />
            <Route path="track/:artistSlug/:trackId" element={<TrackDetailPage />} />
            <Route path="scenes" element={<ScenesIndexPage />} />
            <Route path="scenes/:city/:genre" element={<SceneHubPage />} />
            <Route path="collab" element={<CollabBoardPage />} />
            <Route path="events" element={<EventsIndexPage />} />

            <Route path="login" element={<LoginPage />} />
            <Route path="auth/callback" element={<AuthCallbackPage />} />
            <Route path="desk" element={<DeskLoginPage />} />
            <Route path="editor/join" element={<EditorJoinPage />} />
            <Route path="editor/login" element={<EditorLoginPage />} />
            <Route
              path="editor/apply"
              element={
                <ProtectedRoute role={['member', 'artist']}>
                  <EditorApplyPage />
                </ProtectedRoute>
              }
            />
            <Route path="register" element={<RegisterPage />} />
            <Route path="dashboard" element={<DashboardRedirectPage />} />
            <Route
              path="member/dashboard"
              element={
                <ProtectedRoute role="member">
                  <MemberDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="member/playlist-curator"
              element={
                <ProtectedRoute role="member">
                  <PlaylistCuratorApplyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="member/upgrade"
              element={
                <ProtectedRoute role="member">
                  <MemberUpgradeArtistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="artist/dashboard"
              element={
                <ProtectedRoute role="artist">
                  <ArtistDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="support/artist-page"
              element={
                <ProtectedRoute role={['artist', 'member']}>
                  <ArtistIosSupportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="editor/dashboard"
              element={
                <ProtectedRoute role={['editor', 'super_editor']}>
                  <EditorDashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
