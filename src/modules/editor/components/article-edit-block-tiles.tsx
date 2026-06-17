import { AudioLines, Box, Film, ImageIcon, Layers2, Sparkles, Stars, Type, Wallpaper, Wand2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface ArticleEditBlockTilesProps {
  onTextClick: () => void
  onImageClick: () => void
  onAudioClick: () => void
  onVideoClick: () => void
  onBackgroundClick: () => void
  onBgArtifactsClick: () => void
  onEffectsClick: () => void
  onArtifactsFxClick: () => void
  onText2dClick: () => void
  onText3dClick: () => void
  activeTile?: 'text' | 'image' | 'audio' | 'video' | 'background' | 'artifacts' | 'effects' | 'artifactFx' | 'text2d' | 'text3d' | null
  imageUploading?: boolean
  className?: string
}

export function ArticleEditBlockTiles({
  onTextClick,
  onImageClick,
  onAudioClick,
  onVideoClick,
  onBackgroundClick,
  onBgArtifactsClick,
  onEffectsClick,
  onArtifactsFxClick,
  onText2dClick,
  onText3dClick,
  activeTile = null,
  imageUploading = false,
  className,
}: ArticleEditBlockTilesProps) {
  return (
    <div className={cn('article-edit-tiles', className)}>
      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'text' && 'article-edit-tile--active')}
        onClick={onTextClick}
        disabled={imageUploading}
      >
        <Type className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">Text</span>
      </button>

      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'image' && 'article-edit-tile--active')}
        onClick={onImageClick}
        disabled={imageUploading}
      >
        <ImageIcon className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">Image</span>
      </button>

      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'audio' && 'article-edit-tile--active')}
        onClick={onAudioClick}
        disabled={imageUploading}
      >
        <AudioLines className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">Audio</span>
      </button>

      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'video' && 'article-edit-tile--active')}
        onClick={onVideoClick}
        disabled={imageUploading}
      >
        <Film className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">Video</span>
      </button>

      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'background' && 'article-edit-tile--active')}
        onClick={onBackgroundClick}
        disabled={imageUploading}
      >
        <Wallpaper className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">Background</span>
      </button>

      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'artifacts' && 'article-edit-tile--active')}
        onClick={onBgArtifactsClick}
        disabled={imageUploading}
      >
        <Layers2 className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">BG Artifacts</span>
      </button>

      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'effects' && 'article-edit-tile--active')}
        onClick={onEffectsClick}
        disabled={imageUploading}
      >
        <Sparkles className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">Effects</span>
      </button>

      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'artifactFx' && 'article-edit-tile--active')}
        onClick={onArtifactsFxClick}
        disabled={imageUploading}
      >
        <Stars className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">Artifacts FX</span>
      </button>

      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'text2d' && 'article-edit-tile--active')}
        onClick={onText2dClick}
        disabled={imageUploading}
      >
        <Wand2 className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">2D Text FX</span>
      </button>

      <button
        type="button"
        className={cn('article-edit-tile', activeTile === 'text3d' && 'article-edit-tile--active')}
        onClick={onText3dClick}
        disabled={imageUploading}
      >
        <Box className="article-edit-tile__icon" strokeWidth={1.5} />
        <span className="article-edit-tile__label">3D Text FX</span>
      </button>
    </div>
  )
}
