<script setup>
import { computed, ref } from 'vue'
import { WA_NUMBER } from '../lib/units'

const props = defineProps({
  unit: { type: Object, required: true },
})

defineEmits(['open-gallery'])

const expanded = ref(false)

const isSold = computed(() => props.unit.status === 'SOLD')
const coverPhoto = computed(() => props.unit.photos?.[0] || '/hero.png')
const photoCount = computed(() => props.unit.photos?.length || 0)

const specRows = computed(() => {
  const u = props.unit
  const rows = [
    { label: 'Tahun (NIK)', value: u.year ? `${u.year}${u.condition === 'Brand New' ? ' · Brand New' : ''}` : '' },
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
  const text = `Halo Milenium Supercar, saya tertarik dengan ${props.unit.name}${props.unit.year ? ' ' + props.unit.year : ''}.`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
})
</script>

<template>
  <article
    class="card group bg-ink border border-white/10 overflow-hidden flex flex-col"
    :class="{ 'opacity-80': isSold }"
  >
    <div
      class="relative aspect-[4/3] overflow-hidden cursor-pointer"
      @click="$emit('open-gallery', unit)"
    >
      <img
        :src="coverPhoto"
        :alt="unit.name"
        loading="lazy"
        class="card-cover w-full h-full object-cover"
        :class="{ 'grayscale-[35%]': isSold }"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

      <!-- Status badge -->
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

      <!-- Year NIK badge -->
      <div
        v-if="unit.year"
        class="absolute top-4 right-4 bg-ink/75 px-3 py-1 text-xs tracking-wider text-white"
      >
        {{ unit.year }}
      </div>

      <div class="absolute inset-x-0 bottom-0 p-5">
        <h3 class="font-display text-2xl leading-snug">{{ unit.name }}</h3>
        <p v-if="unit.subtitle" class="mt-1 text-sm text-bone/75">{{ unit.subtitle }}</p>
        <p v-if="unit.price" class="mt-2 text-sm font-medium text-white">{{ unit.price }}</p>
      </div>
    </div>

    <div class="p-5 flex-1 flex flex-col justify-between">
      <div class="more" :class="{ open: expanded }">
        <div>
          <div v-for="row in specRows" :key="row.label" class="spec-row">
            <span>{{ row.label }}</span>
            <span>{{ row.value }}</span>
          </div>
          <ul
            v-if="unit.highlights?.length"
            class="mt-3 space-y-1.5 text-sm text-bone/85 list-disc list-inside"
          >
            <li v-for="(item, idx) in unit.highlights" :key="idx">{{ item }}</li>
          </ul>
        </div>
      </div>

      <div class="flex items-center justify-between mt-5 gap-3">
        <button
          type="button"
          class="text-sm text-bone/80 hover:text-white underline underline-offset-4"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Tutup spesifikasi' : 'Spesifikasi lengkap' }}
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
    </div>
  </article>
</template>
