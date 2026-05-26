import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { IOSImage } from '@/components/ui/IOSImage'

interface EditorialPhotoSliderProps {
  images: string[]
  className?: string
}

export function EditorialPhotoSlider({ images, className }: EditorialPhotoSliderProps) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef(0)
  const count = images.length

  useEffect(() => {
    setIndex(0)
  }, [images.join('|')])

  const go = useCallback(
    (delta: number) => {
      if (count <= 1) return
      setIndex((i) => (i + delta + count) % count)
    },
    [count]
  )

  if (count === 0) return null

  if (count === 1) {
    return (
      <div className={clsx('editorial-photo-slider editorial-photo-slider--single', className)}>
        <figure className="editorial-photo-slider-viewport">
          <IOSImage
            src={images[0]!}
            alt="Artist photo"
            width={800}
            height={1000}
            crop="fit"
            className="editorial-photo-slider-img"
          />
        </figure>
      </div>
    )
  }

  return (
    <div
      className={clsx('editorial-photo-slider', className)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? 0
      }}
      onTouchEnd={(e) => {
        const endX = e.changedTouches[0]?.clientX ?? 0
        const diff = touchStartX.current - endX
        if (Math.abs(diff) > 36) go(diff > 0 ? 1 : -1)
      }}
    >
      <div className="editorial-photo-slider-viewport">
        <div
          className="editorial-photo-slider-track"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          aria-live="polite"
        >
          {images.map((src, i) => (
            <figure key={`${src}-${i}`} className="editorial-photo-slider-slide">
              <IOSImage
                src={src}
                alt={`Artist photo ${i + 1} of ${count}`}
                width={800}
                height={1000}
                crop="fit"
                className="editorial-photo-slider-img"
              />
            </figure>
          ))}
        </div>

        <button
          type="button"
          className="editorial-photo-slider-arrow editorial-photo-slider-arrow-prev"
          onClick={() => go(-1)}
          aria-label="Previous photo"
        >
          ‹
        </button>
        <button
          type="button"
          className="editorial-photo-slider-arrow editorial-photo-slider-arrow-next"
          onClick={() => go(1)}
          aria-label="Next photo"
        >
          ›
        </button>
      </div>

      <div className="editorial-photo-slider-footer">
        <div className="editorial-photo-slider-dots" role="tablist" aria-label="Photo slides">
          {images.map((src, i) => (
            <button
              key={`dot-${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              className={clsx('editorial-photo-slider-dot', i === index && 'is-active')}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <span className="editorial-photo-slider-count">
          {index + 1} / {count}
        </span>
      </div>
    </div>
  )
}
