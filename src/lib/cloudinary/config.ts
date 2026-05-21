export function getCloudinaryCloudName(): string {
  return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ?? ''
}

export function getCloudinaryUploadPreset(): string {
  return import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() ?? ''
}

export function isCloudinaryConfigured(): boolean {
  const cloud = getCloudinaryCloudName()
  const preset = getCloudinaryUploadPreset()
  return Boolean(cloud && preset && !cloud.includes('YOUR_') && preset !== 'your_upload_preset')
}
