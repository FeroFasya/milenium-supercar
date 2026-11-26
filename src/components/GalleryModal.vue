<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  unit: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const activeIndex = ref(0)
const photos = computed(() => props.unit?.photos?.length ? props.unit.photos : ['/hero.png'])

watch(
  () => props.unit,
  () => {
    activeIndex.value = 0
  }
)

function prev() {
  activeIndex.value = (activeIndex.value - 1 + photos.value.length) % photos.value.length
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % photos.value.length
}

function onKeyDown(e) {
  if (!props.unit) return
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="unit"
      class="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex flex-col"
      role="dialog"
      aria-modal="true"
      :aria-label="`Galeri ${unit.name}`"
      @click.self="$emit('close')"
    >
      <!-- Top Bar -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h3 class="font-display text-lg sm:text-xl text-white">{{ unit.name }}</h3>
          <p class="text-xs text-concrete">
            Foto {{ activeIndex + 1 }} dari {{ photos.length }}
          </p>
        </div>
        <button
          type="button"
          class="p-2 text-bone/80 hover:text-white"
          aria-label="Tutup galeri"
          @click="$emit('close')"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <!-- Main Image -->
      <div class="relative flex-1 flex items-center justify-center p-4 sm:p-8 select-none overflow-hidden">
        <button
          v-if="photos.length > 1"
          type="button"
          aria-label="Foto sebelumnya"
          class="absolute left-3 sm:left-6 z-10 w-11 h-11 rounded-full bg-ink/80 border border-white/15 text-white flex items-center justify-center hover:border-white"
          @click="prev"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <img
          :src="photos[activeIndex]"
          :alt="`${unit.name} foto ${activeIndex + 1}`"
          class="max-h-full max-w-full object-contain rounded-sm"
        />

        <button
          v-if="photos.length > 1"
          type="button"
          aria-label="Foto berikutnya"
          class="absolute right-3 sm:right-6 z-10 w-11 h-11 rounded-full bg-ink/80 border border-white/15 text-white flex items-center justify-center hover:border-white"
          @click="next"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <!-- Thumbnails -->
      <div
        v-if="photos.length > 1"
        class="px-5 py-3 border-t border-white/10 flex gap-2 overflow-x-auto justify-start sm:justify-center"
      >
        <button
          v-for="(src, idx) in photos"
          :key="idx"
          type="button"
          class="w-16 h-12 flex-shrink-0 overflow-hidden rounded-sm border-2 transition-opacity"
          :class="idx === activeIndex ? 'border-red opacity-100' : 'border-transparent opacity-50 hover:opacity-80'"
          @click="activeIndex = idx"
        >
          <img :src="src" :alt="`Thumbnail ${idx + 1}`" class="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
