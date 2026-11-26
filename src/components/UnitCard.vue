<script setup>
import { computed } from 'vue'
import { optimizeImageUrl } from '../lib/cloudinary'
import { WA_NUMBER, displayPrice } from '../lib/units'

const props = defineProps({
  unit: { type: Object, required: true },
})

defineEmits(['open-detail'])

const isSold = computed(() => props.unit.status === 'SOLD')
const coverPhoto = computed(() => optimizeImageUrl(props.unit.photos?.[0], 800))
const photoCount = computed(() => props.unit.photos?.length || 0)
const formattedPrice = computed(() => displayPrice(props.unit.price))

const waHref = computed(() => {
  const text = `Halo Milenium Supercar, saya tertarik dengan ${props.unit.name}${props.unit.year ? ' ' + props.unit.year : ''}.`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
})
</script>

<template>
  <article
    class="card group bg-ink border border-white/10 overflow-hidden flex flex-col"
    :class="{ 'opacity-80': isSold }"
  >
    <!-- Cover Only (lazy loaded & optimized thumbnail) -->
    <div
      class="relative aspect-[4/3] overflow-hidden cursor-pointer"
      @click="$emit('open-detail', unit)"
    >
      <img
        :src="coverPhoto"
        :alt="unit.name"
        loading="lazy"
        decoding="async"
        class="card-cover w-full h-full object-cover"
        :class="{ 'grayscale-[35%]': isSold }"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

      <!-- Status & Photo Count Badges -->
      <div class="absolute top-4 left-4 flex items-center gap-2">
        <span
          v-if="isSold"
          class="bg-black/80 border border-white/25 px-2.5 py-1 text-[11px] font-semibold tracking-[.18em] uppercase text-concrete"
        >
          SOLD
        </span>
        <span
          v-else
          class="bg-emerald-600/90 px-2.5 py-1 text-[11px] font-semibold tracking-[.18em] uppercase text-white"
        >
          READY
        </span>
        <span
          v-if="photoCount > 1"
          class="bg-ink/75 backdrop-blur px-2.5 py-1 text-[11px] tracking-wider text-bone/90"
        >
          {{ photoCount }} Foto
        </span>
      </div>

      <!-- Year NIK Badge -->
      <div
        v-if="unit.year"
        class="absolute top-4 right-4 bg-ink/75 px-3 py-1 text-xs tracking-wider text-white"
      >
        {{ unit.year }}
      </div>

      <div class="absolute inset-x-0 bottom-0 p-5">
        <h3 class="font-display text-2xl leading-snug">{{ unit.name }}</h3>
        <p v-if="unit.subtitle" class="mt-1 text-sm text-bone/75 line-clamp-1">{{ unit.subtitle }}</p>
        <p v-if="formattedPrice" class="mt-1.5 text-sm font-medium text-white">{{ formattedPrice }}</p>
      </div>
    </div>

    <!-- Clean, Uniform Card Footer -->
    <div class="p-5 flex items-center justify-between gap-3 mt-auto">
      <button
        type="button"
        class="text-sm text-bone/80 hover:text-white underline underline-offset-4"
        @click="$emit('open-detail', unit)"
      >
        Spesifikasi lengkap
      </button>
      <a
        :href="waHref"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm px-4 py-2 rounded-sm font-medium transition-colors"
        :class="
          isSold
            ? 'border border-white/25 text-bone/80 hover:border-white hover:text-white'
            : 'btn-shine text-white'
        "
      >
        {{ isSold ? 'Cari unit serupa' : 'Tanya harga' }}
      </a>
    </div>
  </article>
</template>
