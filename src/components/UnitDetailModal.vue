<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { optimizeImageUrl } from '../lib/cloudinary'
import { WA_NUMBER, displayPrice } from '../lib/units'

const props = defineProps({
  unit: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const activeIndex = ref(0)
const touchStartX = ref(0)

const photos = computed(() => (props.unit?.photos?.length ? props.unit.photos : ['/hero.png']))
const isSold = computed(() => props.unit?.status === 'SOLD')
const formattedPrice = computed(() => displayPrice(props.unit?.price))

const specRows = computed(() => {
  const u = props.unit
  if (!u) return []
  const rows = [
    {
      label: 'Tahun (NIK)',
      value: u.year ? `${u.year}${u.condition === 'Brand New' ? ' · Brand New' : ''}` : '',
    },
    { label: 'Mesin', value: u.engine },
    { label: 'Tenaga', value: u.power },
    { label: 'Odometer', value: u.odometer },
    { label: 'Transmisi', value: u.transmission },
    { label: 'Eksterior', value: u.exteriorColor },
    { label: 'Interior', value: u.interiorColor },
    { label: 'Pajak / Nopol', value: u.tax },
  ]
  return rows.filter((r) => r.value && String(r.value).trim() !== '')
})

const waHref = computed(() => {
  if (!props.unit) return `https://wa.me/${WA_NUMBER}`
  const text = `Halo Milenium Supercar, saya tertarik dengan ${props.unit.name}${
    props.unit.year ? ' ' + props.unit.year : ''
  }.`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
})

watch(
  () => props.unit,
  (val) => {
    activeIndex.value = 0
    document.body.style.overflow = val ? 'hidden' : ''
  }
)

function prev() {
  activeIndex.value = (activeIndex.value - 1 + photos.value.length) % photos.value.length
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % photos.value.length
}

function onTouchStart(e) {
  touchStartX.value = e.touches?.[0]?.clientX || 0
}

function onTouchEnd(e) {
  if (photos.value.length <= 1) return
  const endX = e.changedTouches?.[0]?.clientX || 0
  const diff = touchStartX.value - endX
  if (Math.abs(diff) > 45) {
    if (diff > 0) next()
    else prev()
  }
}

function onKeyDown(e) {
  if (!props.unit) return
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="unit"
      class="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center sm:p-5"
      role="dialog"
      aria-modal="true"
      :aria-label="`Detail ${unit.name}`"
      @click.self="$emit('close')"
    >
      <!--
        Mobile (< lg): Full dynamic height (h-[100dvh]), single smooth scroll body + sticky header & sticky bottom CTA
        Desktop (lg+): Classic luxury 2-column split (gallery left, scrollable specs + CTA right)
      -->
      <div
        class="w-full h-[100dvh] sm:h-auto sm:max-h-[92dvh] sm:max-w-5xl bg-asphalt sm:border border-white/15 sm:rounded-sm overflow-hidden flex flex-col lg:grid lg:grid-cols-12"
      >
        <!-- MOBILE STICKY TOP BAR -->
        <div class="lg:hidden flex items-center justify-between px-4 py-3 bg-ink border-b border-white/10 flex-shrink-0">
          <span class="text-xs font-medium tracking-wider text-bone/90">
            Foto {{ activeIndex + 1 }} / {{ photos.length }}
          </span>
          <button
            type="button"
            class="flex items-center gap-1.5 text-xs text-bone/90 hover:text-white bg-white/10 px-3 py-1.5 rounded-sm"
            aria-label="Tutup detail"
            @click="$emit('close')"
          >
            Tutup
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <!-- SCROLLABLE CONTENT ON MOBILE; LEFT GALLERY COLUMN ON DESKTOP -->
        <div class="flex-1 overflow-y-auto overscroll-contain lg:contents">
          <!-- GALLERY SECTION -->
          <div class="lg:col-span-7 bg-ink flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 lg:overflow-hidden">
            <div
              class="relative aspect-[4/3] sm:aspect-[16/10] lg:flex-1 lg:aspect-auto bg-black flex items-center justify-center overflow-hidden select-none"
              @touchstart.passive="onTouchStart"
              @touchend.passive="onTouchEnd"
            >
              <img
                :src="optimizeImageUrl(photos[activeIndex], 1400)"
                :alt="`${unit.name} foto ${activeIndex + 1}`"
                class="w-full h-full object-contain"
              />

              <!-- Desktop top-left counter -->
              <span class="hidden lg:inline-block absolute top-3 left-3 bg-black/75 px-2.5 py-1 text-[11px] tracking-wider text-bone rounded-sm">
                {{ activeIndex + 1 }} / {{ photos.length }}
              </span>

              <!-- Prev / Next arrows -->
              <button
                v-if="photos.length > 1"
                type="button"
                aria-label="Foto sebelumnya"
                class="absolute left-3 w-10 h-10 rounded-full bg-ink/80 border border-white/20 text-white flex items-center justify-center hover:border-white"
                @click="prev"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                v-if="photos.length > 1"
                type="button"
                aria-label="Foto berikutnya"
                class="absolute right-3 w-10 h-10 rounded-full bg-ink/80 border border-white/20 text-white flex items-center justify-center hover:border-white"
                @click="next"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <!-- Thumbnails strip -->
            <div
              v-if="photos.length > 1"
              class="px-3 py-2.5 bg-ink border-t border-white/10 flex gap-2 overflow-x-auto flex-shrink-0"
            >
              <button
                v-for="(src, idx) in photos"
                :key="src + idx"
                type="button"
                class="w-16 h-12 flex-shrink-0 overflow-hidden rounded-sm border-2 transition-opacity"
                :class="idx === activeIndex ? 'border-red opacity-100' : 'border-transparent opacity-50 hover:opacity-85'"
                @click="activeIndex = idx"
              >
                <img
                  :src="optimizeImageUrl(src, 240)"
                  :alt="`Thumbnail ${idx + 1}`"
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          <!-- SPECS & DETAILS SECTION -->
          <div class="lg:col-span-5 lg:flex lg:flex-col lg:max-h-[92dvh] lg:overflow-hidden">
            <div class="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <span
                    v-if="isSold"
                    class="bg-black/80 border border-white/25 px-2.5 py-0.5 text-[10px] font-semibold tracking-[.18em] uppercase text-concrete"
                  >
                    SOLD
                  </span>
                  <span
                    v-else
                    class="bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-semibold tracking-[.18em] uppercase text-white"
                  >
                    READY
                  </span>
                  <span v-if="unit.year" class="text-xs text-concrete">NIK {{ unit.year }}</span>
                </div>
                <h2 class="font-display text-2xl text-white leading-snug">{{ unit.name }}</h2>
                <p v-if="unit.subtitle" class="mt-1 text-sm text-concrete">{{ unit.subtitle }}</p>
                <p class="mt-2 text-base font-medium" :class="formattedPrice ? 'text-white' : 'text-bone/75'">
                  {{ formattedPrice || 'Harga: Hubungi Kami (Ask)' }}
                </p>
              </div>

              <button
                type="button"
                class="hidden lg:flex p-2 text-concrete hover:text-white flex-shrink-0"
                aria-label="Tutup detail"
                @click="$emit('close')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <!-- Specs & highlights list -->
            <div class="px-5 py-4 pb-6 space-y-4 lg:flex-1 lg:overflow-y-auto">
              <div v-if="specRows.length">
                <div v-for="row in specRows" :key="row.label" class="spec-row">
                  <span>{{ row.label }}</span>
                  <span>{{ row.value }}</span>
                </div>
              </div>

              <div v-if="unit.highlights?.length">
                <h3 class="text-xs uppercase tracking-widest text-concrete mb-2">Fitur &amp; Catatan</h3>
                <ul class="space-y-1.5 text-sm text-bone/90 list-disc list-inside">
                  <li v-for="(item, idx) in unit.highlights" :key="idx">{{ item }}</li>
                </ul>
              </div>

              <p v-if="!specRows.length && !unit.highlights?.length" class="text-sm text-concrete">
                Hubungi Rio Kustiawan via WhatsApp untuk info spesifikasi lengkap &amp; jadwal test drive.
              </p>
            </div>

            <!-- Desktop Sticky Bottom CTA -->
            <div class="hidden lg:block p-5 border-t border-white/10 bg-ink flex-shrink-0">
              <a
                :href="waHref"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full block text-center py-3 rounded-sm text-sm font-medium transition-colors"
                :class="
                  isSold
                    ? 'border border-white/30 text-white hover:border-white'
                    : 'btn-shine text-white'
                "
              >
                {{ isSold ? 'Tanya unit serupa via WhatsApp' : 'Tanya harga & jadwal via WhatsApp' }}
              </a>
            </div>
          </div>
        </div>

        <!-- MOBILE STICKY BOTTOM CTA (Always visible & clickable, safe-area aware) -->
        <div class="lg:hidden px-4 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-ink flex-shrink-0">
          <a
            :href="waHref"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full block text-center py-3 rounded-sm text-sm font-medium transition-colors"
            :class="
              isSold
                ? 'border border-white/30 text-white hover:border-white'
                : 'btn-shine text-white'
            "
          >
            {{ isSold ? 'Tanya unit serupa via WhatsApp' : 'Tanya harga & jadwal via WhatsApp' }}
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>
