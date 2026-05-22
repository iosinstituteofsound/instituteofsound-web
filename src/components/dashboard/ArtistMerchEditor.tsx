import { useState } from 'react'
import type { ArtistMerchItem } from '@/lib/artist-profile/types'
import {
  addArtistMerch,
  deleteArtistMerch,
  updateArtistMerch,
} from '@/lib/artist-profile/service'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'
import { IOSImage } from '@/components/ui/IOSImage'

interface RowActions {
  onSaved: () => Promise<void>
  onDeleted: () => Promise<void>
}

function EditableMerchRow({ item, ...actions }: { item: ArtistMerchItem } & RowActions) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [productUrl, setProductUrl] = useState(item.productUrl)
  const [priceDisplay, setPriceDisplay] = useState(item.priceDisplay ?? '')
  const [showPrice, setShowPrice] = useState(item.showPrice)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(false)

  const reset = () => {
    setTitle(item.title)
    setProductUrl(item.productUrl)
    setPriceDisplay(item.priceDisplay ?? '')
    setShowPrice(item.showPrice)
    setEditing(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateArtistMerch(item.id, {
        title: title.trim() || item.title,
        productUrl: productUrl.trim() || item.productUrl,
        priceDisplay: priceDisplay.trim() || undefined,
        showPrice,
        imageUrl: productUrl.trim() !== item.productUrl ? undefined : item.imageUrl,
      })
      setEditing(false)
      await actions.onSaved()
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <li className="flex gap-3 items-center border border-border px-3 py-2 text-sm">
        {item.imageUrl ? (
          <IOSImage src={item.imageUrl} alt="" className="!w-10 !h-10 shrink-0 object-cover" />
        ) : (
          <div className="w-10 h-10 bg-surface shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{item.title}</p>
          <p className="text-[10px] text-muted-foreground truncate">{item.productUrl}</p>
          {item.showPrice && item.priceDisplay && (
            <p className="text-[10px] text-emerald-400/90">{item.priceDisplay}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" className="text-xs uppercase ios-link" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className="text-mh-red text-xs uppercase"
            onClick={async () => {
              await deleteArtistMerch(item.id)
              await actions.onDeleted()
            }}
          >
            Remove
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="border border-mh-red/40 px-3 py-4 space-y-3 text-sm">
      <FieldLabel>Edit merch item</FieldLabel>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product name" />
      <Input
        type="url"
        value={productUrl}
        onChange={(e) => setProductUrl(e.target.value)}
        placeholder="Store product URL"
      />
      <Input
        value={priceDisplay}
        onChange={(e) => setPriceDisplay(e.target.value)}
        placeholder="Price (optional) e.g. ₹999 or $25"
      />
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={showPrice}
          onChange={(e) => setShowPrice(e.target.checked)}
          className="accent-mh-red"
        />
        Show price on profile
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="primary" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={fetching || !productUrl.trim()}
          onClick={async () => {
            setFetching(true)
            try {
              await updateArtistMerch(item.id, {
                title: title.trim() || item.title,
                productUrl: productUrl.trim(),
                priceDisplay: priceDisplay.trim() || undefined,
                showPrice,
              })
              await actions.onSaved()
            } finally {
              setFetching(false)
            }
          }}
        >
          {fetching ? 'Fetching image…' : 'Refresh image from URL'}
        </Button>
      </div>
    </li>
  )
}

interface ArtistMerchEditorProps {
  profileId: string
  items: ArtistMerchItem[]
  onChanged: () => Promise<void>
}

export function ArtistMerchEditor({ profileId, items, onChanged }: ArtistMerchEditorProps) {
  const [title, setTitle] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [priceDisplay, setPriceDisplay] = useState('')
  const [showPrice, setShowPrice] = useState(true)
  const [adding, setAdding] = useState(false)

  const add = async () => {
    if (!title.trim() || !productUrl.trim()) return
    setAdding(true)
    try {
      await addArtistMerch(profileId, {
        title: title.trim(),
        productUrl: productUrl.trim(),
        priceDisplay: priceDisplay.trim() || undefined,
        showPrice,
      })
      setTitle('')
      setProductUrl('')
      setPriceDisplay('')
      setShowPrice(true)
      await onChanged()
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="ios-panel space-y-4">
      <p className="ios-kicker">Merch & store</p>
      <p className="text-xs text-muted-foreground">
        Add a product link from any store (Shopify, Bandcamp, Printful, etc.). The product image
        is fetched when you add the item. Visitors open your store in a new tab when they click.
      </p>
      <div className="space-y-2">
        <Input
          placeholder="Product name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="url"
          placeholder="Product page URL"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
        />
        <Input
          placeholder="Price (optional) — ₹999, $25, etc."
          value={priceDisplay}
          onChange={(e) => setPriceDisplay(e.target.value)}
        />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={showPrice}
            onChange={(e) => setShowPrice(e.target.checked)}
            className="accent-mh-red"
          />
          Show price on profile
        </label>
      </div>
      <Button
        type="button"
        variant="metal"
        disabled={adding || !title.trim() || !productUrl.trim()}
        onClick={add}
      >
        {adding ? 'Adding & fetching image…' : 'Add merch item'}
      </Button>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No merch listed yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <EditableMerchRow
              key={item.id}
              item={item}
              onSaved={onChanged}
              onDeleted={onChanged}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
