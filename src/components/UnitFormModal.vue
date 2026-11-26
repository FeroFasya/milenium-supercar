<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { uploadPhotoToCloudinary, optimizeImageUrl } from '../lib/cloudinary'
import { MAX_PHOTOS_PER_UNIT, formatRupiahDigits } from '../lib/units'

const DRAFT_KEY = 'milenium_unit_draft_v1'

const props = defineProps({
  open: { type: Boolean, default: false },
  unit: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])

const isEditing = computed(() => Boolean(props.unit?.id))
const draftRestored = ref(false)

const form = reactive({
  name: '',
  subtitle: '',
  year: '',
  condition: 'Pre-Owned',
  status: 'READY',
  price: '',
  odometer: '',
  tax: '',
  exteriorColor: '',
  interiorColor: '',
  engine: '',
  power: '',
  transmission: '',
  highlightsText: '',
  photos: [],
})

const uploading = ref(false)
const uploadProgress = ref('')
const uploadError = ref('')
const formError = ref('')
const fileInputRef = ref(null)
const formBodyRef = ref(null)

const MIN_YEAR = 1950
const MAX_YEAR = new Date().getFullYear() + 2

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const hasContent =
      parsed.name ||
      parsed.subtitle ||
      parsed.year ||
      parsed.priceDigits ||
      parsed.odometer ||
      parsed.highlightsText ||
      (Array.isArray(parsed.photos) && parsed.photos.length > 0)
    return hasContent ? parsed : null
  } catch {
    return null
  }
}

function saveDraft() {
  if (isEditing.value || !props.open) return
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        name: form.name,
        subtitle: form.subtitle,
        year: form.year,
        condition: form.condition,
        status: form.status,
        priceDigits: form.price,
        odometer: form.odometer,
        tax: form.tax,
        exteriorColor: form.exteriorColor,
        interiorColor: form.interiorColor,
        engine: form.engine,
        power: form.power,
        transmission: form.transmission,
        highlightsText: form.highlightsText,
        photos: form.photos,
      })
    )
  } catch {
    // Ignore storage quota errors
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // Ignore
  }
  draftRestored.value = false
}

function discardDraft() {
  clearDraft()
  resetForm(null, true)
}

function resetForm(u, skipDraft = false) {
  draftRestored.value = false
  if (!u && !skipDraft) {
    const draft = loadDraft()
    if (draft) {
      form.name = draft.name || ''
      form.subtitle = draft.subtitle || ''
      form.year = draft.year || ''
      form.condition = draft.condition || 'Pre-Owned'
      form.status = draft.status || 'READY'
      form.price = formatRupiahDigits(draft.priceDigits || '')
      form.odometer = draft.odometer || ''
      form.tax = draft.tax || ''
      form.exteriorColor = draft.exteriorColor || ''
      form.interiorColor = draft.interiorColor || ''
      form.engine = draft.engine || ''
      form.power = draft.power || ''
      form.transmission = draft.transmission || ''
      form.highlightsText = draft.highlightsText || ''
      form.photos = Array.isArray(draft.photos) ? [...draft.photos] : []
      uploadError.value = ''
      uploadProgress.value = ''
      formError.value = ''
      draftRestored.value = true
      return
    }
  }

  form.name = u?.name || ''
  form.subtitle = u?.subtitle || ''
  form.year = u?.year ? String(u.year) : ''
  form.condition = u?.condition || 'Pre-Owned'
  form.status = u?.status || 'READY'
  form.price = formatRupiahDigits(u?.price || '')
  form.odometer = u?.odometer || ''
  form.tax = u?.tax || ''
  form.exteriorColor = u?.exteriorColor || ''
  form.interiorColor = u?.interiorColor || ''
  form.engine = u?.engine || ''
  form.power = u?.power || ''
  form.transmission = u?.transmission || ''
  form.highlightsText = Array.isArray(u?.highlights) ? u.highlights.join('\n') : ''
  form.photos = Array.isArray(u?.photos) ? [...u.photos] : []
  uploadError.value = ''
  uploadProgress.value = ''
  formError.value = ''
}

watch(
  () => [props.open, props.unit],
  ([isOpen]) => {
    if (isOpen) resetForm(props.unit)
  },
  { immediate: true }
)

watch(form, saveDraft, { deep: true })

const remainingSlots = computed(() => Math.max(0, MAX_PHOTOS_PER_UNIT - form.photos.length))

async function handleFileSelect(e) {
  const files = Array.from(e.target.files || [])
  if (fileInputRef.value) fileInputRef.value.value = ''
  if (!files.length) return

  uploadError.value = ''
  if (remainingSlots.value <= 0) {
    uploadError.value = `Maksimal ${MAX_PHOTOS_PER_UNIT} foto per unit. Hapus foto lama dulu untuk menambah foto baru.`
    return
  }

  let selected = files
  if (files.length > remainingSlots.value) {
    selected = files.slice(0, remainingSlots.value)
    uploadError.value = `Hanya ${remainingSlots.value} foto pertama yang diupload (batas maksimal ${MAX_PHOTOS_PER_UNIT} foto per unit).`
  }

  uploading.value = true
  try {
    for (let i = 0; i < selected.length; i++) {
      uploadProgress.value = `Mengompres & upload foto ${i + 1} dari ${selected.length}...`
      const url = await uploadPhotoToCloudinary(selected[i])
      form.photos.push(url)
      formError.value = ''
    }
  } catch (err) {
    uploadError.value = err?.message || 'Gagal mengupload foto. Coba lagi.'
  } finally {
    uploading.value = false
    uploadProgress.value = ''
  }
}

function setAsCover(idx) {
  if (idx <= 0 || idx >= form.photos.length) return
  const [chosen] = form.photos.splice(idx, 1)
  form.photos.unshift(chosen)
}

function removePhoto(idx) {
  form.photos.splice(idx, 1)
}

function sanitizeYearInput(e) {
  const digits = String(e.target.value || '').replace(/\D/g, '').slice(0, 4)
  form.year = digits
}

function sanitizePriceInput(e) {
  form.price = formatRupiahDigits(e.target.value)
}

function handleSubmit() {
  uploadError.value = ''
  formError.value = ''

  if (!form.name.trim()) {
    formError.value = 'Nama mobil wajib diisi.'
    return
  }

  const yearNum = Number(form.year)
  if (!/^\d{4}$/.test(form.year.trim()) || yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
    formError.value = `Tahun (NIK) harus 4 digit angka yang valid (${MIN_YEAR}–${MAX_YEAR}).`
    return
  }

  if (form.photos.length === 0) {
    const msg = 'Upload minimal 1 foto mobil terlebih dahulu sebelum menyimpan.'
    uploadError.value = msg
    formError.value = msg
    if (formBodyRef.value) formBodyRef.value.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const highlights = form.highlightsText
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)

  const formattedPrice = form.price.trim() ? `Rp ${form.price.trim()}` : ''

  emit('save', {
    name: form.name.trim(),
    subtitle: form.subtitle.trim(),
    year: form.year.trim(),
    condition: form.condition,
    status: form.status,
    price: formattedPrice,
    odometer: form.odometer.trim(),
    tax: form.tax.trim(),
    exteriorColor: form.exteriorColor.trim(),
    interiorColor: form.interiorColor.trim(),
    engine: form.engine.trim(),
    power: form.power.trim(),
    transmission: form.transmission.trim(),
    highlights,
    photos: [...form.photos],
  })
}

defineExpose({ clearDraft })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      @click.self="!uploading && !saving && $emit('close')"
    >
      <div
        class="w-full sm:max-w-2xl max-h-[92vh] bg-asphalt border border-white/15 sm:rounded-sm flex flex-col overflow-hidden"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-ink">
          <div>
            <h2 class="font-display text-xl text-white">
              {{ isEditing ? 'Edit Unit Mobil' : 'Tambah Unit Baru' }}
            </h2>
            <p class="text-xs text-concrete mt-0.5">
              Kolom kosong otomatis disembunyikan di halaman web.
            </p>
          </div>
          <button
            type="button"
            class="p-2 text-concrete hover:text-white"
            aria-label="Tutup"
            :disabled="uploading || saving"
            @click="$emit('close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form id="unitForm" ref="formBodyRef" class="flex-1 overflow-y-auto p-5 space-y-6" @submit.prevent="handleSubmit">
          <!-- DRAFT RESTORED BANNER -->
          <div
            v-if="draftRestored && !isEditing"
            class="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2.5 rounded-sm text-xs text-amber-200"
          >
            <span>Draf terakhir yang belum disimpan berhasil dipulihkan otomatis.</span>
            <button
              type="button"
              class="text-amber-300 hover:text-white underline underline-offset-2 whitespace-nowrap font-medium"
              @click="discardDraft"
            >
              Reset draf
            </button>
          </div>

          <!-- FOTO UPLOADER -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs uppercase tracking-wider text-concrete font-medium">
                Foto Unit <span class="text-red">*</span> ({{ form.photos.length }} / {{ MAX_PHOTOS_PER_UNIT }})
              </label>
              <span class="text-[11px] text-concrete">Wajib min. 1 foto · Auto-compress WebP</span>
            </div>

            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              <!-- Existing Photos -->
              <div
                v-for="(url, idx) in form.photos"
                :key="url + idx"
                class="relative group aspect-[4/3] bg-ink border rounded-sm overflow-hidden"
                :class="idx === 0 ? 'border-red' : 'border-white/15'"
              >
                <img :src="optimizeImageUrl(url, 400)" :alt="`Foto ${idx + 1}`" loading="lazy" class="w-full h-full object-cover" />
                <span
                  v-if="idx === 0"
                  class="absolute top-1 left-1 bg-red text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm"
                >
                  COVER
                </span>
                <div
                  class="absolute inset-x-0 bottom-0 bg-black/75 p-1 flex items-center justify-between gap-1"
                >
                  <button
                    v-if="idx > 0"
                    type="button"
                    class="text-[10px] text-bone hover:text-white underline"
                    @click="setAsCover(idx)"
                  >
                    Jadikan Cover
                  </button>
                  <span v-else class="text-[10px] text-concrete">Utama</span>
                  <button
                    type="button"
                    class="text-[10px] text-red hover:text-white font-medium ml-auto"
                    @click="removePhoto(idx)"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <!-- Upload Button Tile -->
              <label
                v-if="remainingSlots > 0"
                class="aspect-[4/3] border border-dashed border-white/25 hover:border-red bg-ink/60 rounded-sm flex flex-col items-center justify-center cursor-pointer text-center p-2 transition-colors"
                :class="{ 'opacity-50 pointer-events-none': uploading }"
              >
                <svg class="w-6 h-6 text-concrete mb-1" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span class="text-[11px] text-bone/80 leading-tight">
                  {{ uploading ? 'Mengupload...' : 'Pilih Foto' }}
                </span>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  :disabled="uploading"
                  @change="handleFileSelect"
                />
              </label>
            </div>

            <p v-if="uploadProgress" class="mt-2 text-xs text-amber-400">{{ uploadProgress }}</p>
            <p v-if="uploadError" class="mt-2 text-xs text-red">{{ uploadError }}</p>
          </div>

          <!-- INFORMASI UTAMA -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs uppercase tracking-wider text-concrete mb-1.5">
                Nama Mobil <span class="text-red">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="mis. Porsche 911 GT3 RS"
                class="w-full bg-ink border border-white/15 px-3.5 py-2.5 text-sm text-white rounded-sm"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs uppercase tracking-wider text-concrete mb-1.5">
                Varian / Subjudul Singkat
              </label>
              <input
                v-model="form.subtitle"
                type="text"
                placeholder="mis. 992.1 · Weissach Package · ATPM"
                class="w-full bg-ink border border-white/15 px-3.5 py-2.5 text-sm text-white rounded-sm"
              />
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-concrete mb-1.5">
                Tahun (NIK) <span class="text-red">*</span>
              </label>
              <input
                :value="form.year"
                type="text"
                inputmode="numeric"
                maxlength="4"
                required
                :placeholder="`mis. ${new Date().getFullYear()} (${MIN_YEAR}–${MAX_YEAR})`"
                class="w-full bg-ink border border-white/15 px-3.5 py-2.5 text-sm text-white rounded-sm"
                @input="sanitizeYearInput"
              />
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-concrete mb-1.5">
                Harga (Opsional)
              </label>
              <div class="flex items-center bg-ink border border-white/15 rounded-sm focus-within:border-red">
                <span class="pl-3.5 pr-2 text-sm text-concrete select-none">Rp</span>
                <input
                  :value="form.price"
                  type="text"
                  inputmode="numeric"
                  placeholder="Kosongkan untuk 'Tanya Harga'"
                  class="w-full bg-transparent pr-3.5 py-2.5 text-sm text-white focus:outline-none"
                  @input="sanitizePriceInput"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-concrete mb-1.5">Status Stok</label>
              <select
                v-model="form.status"
                class="w-full bg-ink border border-white/15 px-3.5 py-2.5 text-sm text-white rounded-sm"
              >
                <option value="READY">READY</option>
                <option value="SOLD">SOLD</option>
              </select>
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-concrete mb-1.5">Kondisi</label>
              <select
                v-model="form.condition"
                class="w-full bg-ink border border-white/15 px-3.5 py-2.5 text-sm text-white rounded-sm"
              >
                <option value="Pre-Owned">Pre-Owned</option>
                <option value="Brand New">Brand New</option>
              </select>
            </div>
          </div>

          <!-- SPESIFIKASI TEKNIS -->
          <div class="border-t border-white/10 pt-5">
            <h3 class="text-xs uppercase tracking-widest text-bone/70 font-medium mb-3">
              Spesifikasi Unit (Opsional)
            </h3>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-concrete mb-1">Odometer</label>
                <input
                  v-model="form.odometer"
                  type="text"
                  placeholder="mis. Delivery Mileage / 5.xxx km"
                  class="w-full bg-ink border border-white/15 px-3 py-2 text-sm text-white rounded-sm"
                />
              </div>

              <div>
                <label class="block text-xs text-concrete mb-1">Pajak / Nopol</label>
                <input
                  v-model="form.tax"
                  type="text"
                  placeholder="mis. On Nov 2027 · B Ganjil"
                  class="w-full bg-ink border border-white/15 px-3 py-2 text-sm text-white rounded-sm"
                />
              </div>

              <div>
                <label class="block text-xs text-concrete mb-1">Mesin</label>
                <input
                  v-model="form.engine"
                  type="text"
                  placeholder="mis. 4.0L Naturally Aspirated Flat-6"
                  class="w-full bg-ink border border-white/15 px-3 py-2 text-sm text-white rounded-sm"
                />
              </div>

              <div>
                <label class="block text-xs text-concrete mb-1">Tenaga</label>
                <input
                  v-model="form.power"
                  type="text"
                  placeholder="mis. 525 Hp · 465 Nm"
                  class="w-full bg-ink border border-white/15 px-3 py-2 text-sm text-white rounded-sm"
                />
              </div>

              <div>
                <label class="block text-xs text-concrete mb-1">Transmisi &amp; Penggerak</label>
                <input
                  v-model="form.transmission"
                  type="text"
                  placeholder="mis. 7-Speed PDK · RWD"
                  class="w-full bg-ink border border-white/15 px-3 py-2 text-sm text-white rounded-sm"
                />
              </div>

              <div>
                <label class="block text-xs text-concrete mb-1">Warna Eksterior</label>
                <input
                  v-model="form.exteriorColor"
                  type="text"
                  placeholder="mis. Gulf Orange / Arctic Grey"
                  class="w-full bg-ink border border-white/15 px-3 py-2 text-sm text-white rounded-sm"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs text-concrete mb-1">Warna / Detail Interior</label>
                <input
                  v-model="form.interiorColor"
                  type="text"
                  placeholder="mis. Black & Mandarin, Shooting Star Headliner"
                  class="w-full bg-ink border border-white/15 px-3 py-2 text-sm text-white rounded-sm"
                />
              </div>
            </div>
          </div>

          <!-- HIGHLIGHTS / COPY-PASTE IG -->
          <div class="border-t border-white/10 pt-5">
            <label class="block text-xs uppercase tracking-wider text-concrete mb-1.5">
              Fitur Unggulan / Catatan Tambahan (1 baris = 1 poin)
            </label>
            <textarea
              v-model="form.highlightsText"
              rows="4"
              placeholder="Bisa langsung copy-paste dari caption IG, contoh:&#10;Porsche Ceramic Composite Brakes (PCCB)&#10;Active Warranty BSI & BRI Until 2030&#10;Dokumen Lengkap & Kunci Cadangan"
              class="w-full bg-ink border border-white/15 px-3.5 py-2.5 text-sm text-white rounded-sm"
            />
          </div>
        </form>

        <!-- Modal Footer -->
        <div class="px-5 py-4 border-t border-white/10 bg-ink space-y-3">
          <p v-if="formError" class="text-xs text-red bg-red/10 border border-red/30 px-3 py-2 rounded-sm">
            {{ formError }}
          </p>
          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2.5 text-sm text-concrete hover:text-white"
              :disabled="uploading || saving"
              @click="$emit('close')"
            >
              Batal
            </button>
            <button
              type="submit"
              form="unitForm"
              :disabled="uploading || saving"
              class="btn-shine text-white px-6 py-2.5 rounded-sm text-sm font-medium disabled:opacity-50"
            >
              {{ saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambahkan Unit' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
