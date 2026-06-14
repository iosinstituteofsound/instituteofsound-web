/** Browser only needs cloud name; upload preset + signature come from POST /api/v1/media/sign. */
export function getCloudinaryCloudName(): string {
  return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ?? ''
}

/** @deprecated Preset is returned by the signed-upload API — do not use for direct uploads. */
export function getCloudinaryUploadPreset(): string {
  return import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() ?? ''
}

export function isCloudinaryConfigured(): boolean {
  const cloud = getCloudinaryCloudName()
  return Boolean(cloud && !cloud.includes('YOUR_'))
}
