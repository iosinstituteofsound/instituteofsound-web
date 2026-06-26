import type { PersistedStudioDocument } from '@/modules/illustrator/lib/studio-document-persistence'

const DB_NAME = 'ios-illustrator-studio'
const DB_VERSION = 1
const STORE_NAME = 'documents'

type StudioAutosaveIndexEntry = {
  artworkId: string
  title: string
  savedAt: string
  status: 'draft' | 'published'
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'artworkId' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open illustrator autosave database'))
  })
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode)
        const store = tx.objectStore(STORE_NAME)
        const request = run(store)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error ?? new Error('Illustrator autosave transaction failed'))

        tx.oncomplete = () => db.close()
        tx.onerror = () => {
          db.close()
          reject(tx.error ?? new Error('Illustrator autosave transaction failed'))
        }
      }),
  )
}

export async function loadPersistedStudioDocument(artworkId: string) {
  if (!artworkId || typeof indexedDB === 'undefined') return null

  try {
    const doc = await runTransaction<PersistedStudioDocument | undefined>('readonly', (store) =>
      store.get(artworkId),
    )
    return doc ?? null
  } catch {
    return null
  }
}

export async function savePersistedStudioDocument(doc: PersistedStudioDocument) {
  if (!doc.artworkId || typeof indexedDB === 'undefined') return

  await runTransaction('readwrite', (store) => store.put(doc))
}

export async function deletePersistedStudioDocument(artworkId: string) {
  if (!artworkId || typeof indexedDB === 'undefined') return

  await runTransaction('readwrite', (store) => store.delete(artworkId))
}

export async function listPersistedStudioDocuments(): Promise<StudioAutosaveIndexEntry[]> {
  if (typeof indexedDB === 'undefined') return []

  try {
    const docs = await runTransaction<PersistedStudioDocument[]>('readonly', (store) => store.getAll())
    return docs
      .map((doc) => ({
        artworkId: doc.artworkId,
        title: doc.title,
        savedAt: doc.savedAt,
        status: doc.status,
      }))
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  } catch {
    return []
  }
}
