export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
export const MAX_RAW_FILE_MB = 15

/**
 * Injects Cloudinary responsive optimization params (f_auto, q_auto, width limit)
 * so catalog grid thumbnails load super fast (~40-60KB) while full modal loads crisp HD.
 */
export function optimizeImageUrl(url, width = 800) {
  if (!url || typeof url !== 'string') return '/hero.png'
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`)
  }
  return url
}

/**
 * Compress & convert image file to WebP directly in the browser using Canvas.
 * Shrinks 5-10MB phone photos into crisp ~150-250KB WebP files before upload.
 */
export function compressImageToWebP(file, maxWidth = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (JPG, PNG, atau WebP).'))
      return
    }
    if (file.size > MAX_RAW_FILE_MB * 1024 * 1024) {
      reject(new Error(`Ukuran file mentah maksimal ${MAX_RAW_FILE_MB} MB.`))
      return
    }

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Gagal mengompresi gambar.'))
            return
          }
          const baseName = file.name.replace(/\.[^.]+$/, '')
          resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }))
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Gambar tidak bisa dibaca.'))
    }

    img.src = objectUrl
  })
}

/**
 * Auto-compress photo to WebP then upload directly to Cloudinary (unsigned preset).
 * Returns the secure HTTPS URL of the uploaded photo.
 */
export async function uploadPhotoToCloudinary(file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Konfigurasi Cloudinary belum diisi di environment variables.')
  }

  const compressed = await compressImageToWebP(file)
  const formData = new FormData()
  formData.append('file', compressed)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Upload Cloudinary gagal: ${errText}`)
  }

  const data = await response.json()
  return data.secure_url
}
