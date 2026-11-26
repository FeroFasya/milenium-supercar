<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import UnitCard from '../components/UnitCard.vue'
import UnitDetailModal from '../components/UnitDetailModal.vue'
import { fetchUnits, SAMPLE_UNITS, WA_NUMBER } from '../lib/units'

const INITIAL_VISIBLE = 6

const mobileMenuOpen = ref(false)
const scrolled = ref(false)
const units = ref([])
const visibleCount = ref(INITIAL_VISIBLE)
const loadingUnits = ref(true)
const selectedUnit = ref(null)
const showroomLightbox = ref(null)
const isInAppBrowser = ref(false)
const GOOGLE_MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=Milenium+Supercar+Bursa+Mobil+Bintaro+Blok+11-12+Sektor+7'

const showroomPhotos = [
  {
    src: '/showroom-1.webp',
    alt: 'Lineup Ferrari dan mobil premium di showroom Milenium Supercar',
    caption: 'Lineup Supercar & Luxury',
  },
  {
    src: '/showroom-2.webp',
    alt: 'Lamborghini, Porsche 911 Targa, dan Ferrari di Milenium Supercar Bintaro',
    caption: 'Unit Ready Stock Pilihan',
  },
  {
    src: '/showroom-3.webp',
    alt: 'Suasana ruang pamer Milenium Supercar Bursa Mobil Bintaro Blok 11-12',
    caption: 'Bursa Mobil Bintaro Blok 11-12',
  },
]

const services = [
  {
    num: '01',
    title: 'Import',
    desc: 'Unit premium dan supercar dari luar negeri, dicarikan sesuai spesifikasi yang Anda mau.',
  },
  {
    num: '02',
    title: 'New car',
    desc: 'Unit baru dengan NIK terkini dan garansi ATPM, siap dibawa pulang.',
  },
  {
    num: '03',
    title: 'Trade in',
    desc: 'Tukar mobil lama dengan unit pilihan Anda, selisihnya dihitung langsung.',
  },
  {
    num: '04',
    title: 'Titip jual (consign)',
    desc: 'Mobil Anda dipajang dan dipasarkan di showroom serta ke 18 ribu lebih pengikut Instagram kami.',
  },
]

const visibleUnits = computed(() => units.value.slice(0, visibleCount.value))
const remainingCount = computed(() => Math.max(0, units.value.length - visibleCount.value))

const marqueeItems = [
  'Porsche',
  'Rolls-Royce',
  'BMW M',
  'Mercedes-AMG G-Class',
  'Land Rover',
  'Toyota Land Cruiser',
  'Import',
  'Trade in',
  'Titip jual',
]

function onScroll() {
  scrolled.value = window.scrollY > 40
}

onMounted(async () => {
  isInAppBrowser.value = /Instagram|FBAN|FBAV|FB_IAB|TikTok/i.test(navigator.userAgent || '')
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  try {
    const liveUnits = await fetchUnits()
    units.value = liveUnits.length > 0 ? liveUnits : SAMPLE_UNITS
  } catch (err) {
    console.warn('Gagal memuat unit dari Firestore, menampilkan unit contoh:', err)
    units.value = SAMPLE_UNITS
  } finally {
    loadingUnits.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="min-h-screen bg-ink text-bone font-sans antialiased">
    <!-- NAV -->
    <header
      class="fixed top-0 inset-x-0 z-50 bg-ink/90 backdrop-blur border-b border-white/10 transition-shadow"
      :class="{ scrolled }"
    >
      <div class="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#top" class="flex items-center" aria-label="Milenium Supercar">
          <img
            src="/logo-wordmark.png"
            alt="Milenium Supercar"
            class="h-8 sm:h-9 w-auto object-contain"
          />
        </a>
        <nav class="hidden md:flex items-center gap-8 text-sm text-bone/80">
          <a href="#unit" class="hover:text-white">Unit pilihan</a>
          <a href="#layanan" class="hover:text-white">Layanan</a>
          <a href="#jaminan" class="hover:text-white">Jaminan</a>
          <a href="#lokasi" class="hover:text-white">Lokasi</a>
          <a
            :href="`https://wa.me/${WA_NUMBER}`"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-shine text-white px-4 py-2 rounded-sm font-medium"
          >
            Hubungi Rio
          </a>
        </nav>
        <button
          type="button"
          class="md:hidden p-2"
          aria-label="Buka menu"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobileMenu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path :d="mobileMenuOpen ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'" />
          </svg>
        </button>
      </div>
      <nav
        v-show="mobileMenuOpen"
        id="mobileMenu"
        class="md:hidden border-t border-white/10 bg-ink px-5 py-4 flex flex-col gap-4 text-bone/90"
      >
        <a href="#unit" @click="mobileMenuOpen = false">Unit pilihan</a>
        <a href="#layanan" @click="mobileMenuOpen = false">Layanan</a>
        <a href="#jaminan" @click="mobileMenuOpen = false">Jaminan</a>
        <a href="#lokasi" @click="mobileMenuOpen = false">Lokasi</a>
        <a
          :href="`https://wa.me/${WA_NUMBER}`"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-red text-white text-center py-3 rounded-sm font-medium"
          @click="mobileMenuOpen = false"
        >
          Hubungi Rio via WhatsApp
        </a>
      </nav>
    </header>

    <main id="top">
      <!-- HERO -->
      <section class="relative min-h-[100svh] flex items-end pt-16 overflow-hidden">
        <video
          autoplay
          muted
          loop
          playsinline
          poster="/hero.png"
          aria-hidden="true"
          class="absolute inset-0 w-full h-full object-cover kenburns"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div
          class="absolute inset-0"
          style="background:radial-gradient(55% 45% at 15% 100%,rgba(196,22,28,.35),transparent 70%)"
        />
        <div class="relative max-w-6xl mx-auto px-5 pb-16 md:pb-24 w-full">
          <p class="rise text-bone/80 mb-4 text-sm md:text-base" style="animation-delay:.1s">
            Bursa Mobil Bintaro Sektor 7 · Buka 24 jam
          </p>
          <h1
            class="rise font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.05] max-w-3xl"
            style="animation-delay:.25s"
          >
            <span class="metal">Mobil Premium &amp; Supercar Terbaik</span>
            <span
              class="inline-flex align-middle ml-2 w-[1em] h-[.67em] overflow-hidden rounded-[.08em] shadow-sm"
              aria-label="Bendera Indonesia"
              role="img"
            >
              <svg viewBox="0 0 3 2" class="w-full h-full" aria-hidden="true">
                <rect width="3" height="1" fill="#ff0000" />
                <rect y="1" width="3" height="1" fill="#ffffff" />
              </svg>
            </span>
          </h1>
          <p class="rise mt-6 max-w-xl text-bone/80 text-base md:text-lg" style="animation-delay:.45s">
            Beli unit import atau new car, tukar tambah mobil lama, atau titipkan mobil Anda untuk dijualkan.
            Semua unit bisa dilihat dan di-test drive.
          </p>
          <div class="rise mt-8 flex flex-col sm:flex-row gap-3" style="animation-delay:.6s">
            <a href="#unit" class="btn-shine text-white text-center px-7 py-3.5 rounded-sm font-medium">
              Lihat unit ready stock
            </a>
            <a
              :href="`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo Milenium Supercar, saya mau tanya unit ready stock.')}`"
              target="_blank"
              rel="noopener noreferrer"
              class="border border-white/40 hover:border-white text-center px-7 py-3.5 rounded-sm font-medium"
            >
              Tanya via WhatsApp
            </a>
          </div>
        </div>
      </section>

      <!-- MARQUEE -->
      <div class="hairline" />
      <div class="bg-ink py-5 overflow-hidden" aria-hidden="true">
        <div class="marquee">
          <template v-for="loop in 2" :key="loop">
            <span
              v-for="item in marqueeItems"
              :key="`${loop}-${item}`"
              class="font-display text-xl md:text-2xl tracking-[.2em] text-bone/60 px-8 whitespace-nowrap"
            >
              {{ item }}<span class="text-red px-8">&#9670;</span>
            </span>
          </template>
        </div>
      </div>
      <div class="hairline" />

      <!-- UNIT -->
      <section id="unit" class="py-20 md:py-28 glow-bg">
        <div class="max-w-6xl mx-auto px-5">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <h2 class="metal font-display text-3xl md:text-5xl max-w-xl">Unit pilihan</h2>
            <p class="text-concrete max-w-sm">
              Klik foto unit untuk melihat galeri lengkap, atau hubungi Rio langsung via WhatsApp.
            </p>
          </div>

          <!-- Skeleton Loading -->
          <div v-if="loadingUnits" class="grid gap-8 lg:grid-cols-3">
            <div
              v-for="n in 3"
              :key="n"
              class="bg-ink border border-white/10 overflow-hidden animate-pulse"
            >
              <div class="aspect-[4/3] bg-asphalt" />
              <div class="p-5 space-y-3">
                <div class="h-4 bg-white/10 w-2/3 rounded" />
                <div class="h-4 bg-white/10 w-1/2 rounded" />
              </div>
            </div>
          </div>

          <!-- Unit Grid -->
          <div v-else class="grid gap-8 lg:grid-cols-3">
            <UnitCard
              v-for="u in visibleUnits"
              :key="u.id"
              :unit="u"
              @open-detail="selectedUnit = $event"
            />
          </div>

          <!-- Load More Button (Pagination for fast initial load) -->
          <div v-if="!loadingUnits && remainingCount > 0" class="mt-10 text-center">
            <button
              type="button"
              class="border border-white/30 hover:border-white px-7 py-3 rounded-sm text-sm font-medium text-bone hover:text-white transition-colors"
              @click="visibleCount += 6"
            >
              Muat lebih banyak ({{ remainingCount }} unit lagi)
            </button>
          </div>

          <p class="mt-10 text-concrete text-sm">
            Stok lain update tiap hari di
            <a
              href="https://www.instagram.com/mileniumsupercar"
              target="_blank"
              rel="noopener noreferrer"
              class="text-bone underline underline-offset-4"
            >
              @mileniumsupercar
            </a>.
          </p>
        </div>
      </section>

      <!-- LAYANAN & SHOWROOM -->
      <section id="layanan" class="py-20 md:py-28">
        <div class="max-w-6xl mx-auto px-5 space-y-12">
          <!-- Header -->
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 class="metal font-display text-3xl md:text-5xl max-w-2xl">
              Satu showroom, empat cara bertransaksi
            </h2>
            <p class="text-concrete max-w-sm">
              Mau beli, ganti unit, atau jual mobil, semuanya diurus lewat satu kontak.
            </p>
          </div>

          <!-- 4 Service Tiles in 1 Clean Row -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            <div v-for="svc in services" :key="svc.num" class="tile bg-ink p-7 flex flex-col">
              <span class="text-xs font-medium tracking-[.22em] text-red mb-3">{{ svc.num }}</span>
              <h3 class="font-display text-xl mb-2 text-white">{{ svc.title }}</h3>
              <p class="text-concrete text-sm leading-relaxed">{{ svc.desc }}</p>
            </div>
          </div>

          <!-- Editorial 3-Column Showroom Gallery -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <p class="text-xs uppercase tracking-[.22em] text-concrete">Suasana Showroom</p>
              <p class="text-xs text-concrete/80">Klik foto untuk memperbesar</p>
            </div>
            <div class="grid md:grid-cols-3 gap-5">
              <button
                v-for="photo in showroomPhotos"
                :key="photo.src"
                type="button"
                class="group relative aspect-[4/4] overflow-hidden border border-white/10 hover:border-red/60 transition-colors text-left bg-asphalt"
                @click="showroomLightbox = photo"
              >
                <img
                  :src="photo.src"
                  :alt="photo.alt"
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover object-[center_72%] transition-transform duration-700 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div class="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-2">
                  <span class="text-xs sm:text-sm text-bone/90 font-medium">{{ photo.caption }}</span>
                  <span class="text-[11px] text-concrete group-hover:text-white transition-colors">Lihat ↗</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- JAMINAN -->
      <section id="jaminan" class="py-20 md:py-28 glow-bg2">
        <div class="max-w-6xl mx-auto px-5">
          <h2 class="metal font-display text-3xl md:text-5xl max-w-2xl mb-12">
            Yang kami pastikan di setiap unit
          </h2>
          <div class="grid md:grid-cols-3 gap-10">
            <div>
              <h3 class="font-display text-xl mb-2 text-white">Bebas tabrak dan banjir</h3>
              <p class="text-concrete text-sm">
                Setiap unit dijelaskan dalam kondisi baik dan tidak pernah terkena crash maupun banjir.
              </p>
            </div>
            <div>
              <h3 class="font-display text-xl mb-2 text-white">Dokumen jelas</h3>
              <p class="text-concrete text-sm">
                Tahun NIK, masa pajak, kunci cadangan, dan dokumen lengkap dicantumkan di tiap iklan unit.
              </p>
            </div>
            <div>
              <h3 class="font-display text-xl mb-2 text-white">Test drive tersedia</h3>
              <p class="text-concrete text-sm">Hubungi Rio untuk atur jadwal. Showroom buka 24 jam.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- LOKASI -->
      <section id="lokasi" class="py-20 md:py-28">
        <div class="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-10 items-center">
          <div class="min-w-0">
            <h2 class="metal font-display text-3xl md:text-5xl">Datang dan lihat langsung</h2>
            <p class="mt-6 text-bone/90">
              Bursa Mobil Bintaro Blok 11-12<br />Sektor 7, Bintaro, Tangerang Selatan
            </p>
            <p class="mt-3 text-concrete">Buka 24 jam</p>
            <dl class="mt-8 space-y-3 text-sm">
              <div class="flex gap-4">
                <dt class="w-24 text-concrete">WhatsApp</dt>
                <dd>
                  <a
                    class="underline underline-offset-4"
                    :href="`https://wa.me/${WA_NUMBER}`"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    0812-8005-68 (Rio)
                  </a>
                </dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-24 text-concrete">Email</dt>
                <dd>
                  <a class="underline underline-offset-4 break-all" href="mailto:mileniumsupercar@gmail.com">
                    mileniumsupercar@gmail.com
                  </a>
                </dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-24 text-concrete">Instagram</dt>
                <dd>
                  <a
                    class="underline underline-offset-4"
                    href="https://www.instagram.com/mileniumsupercar"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @mileniumsupercar
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div class="w-full space-y-3">
            <!-- Instagram/Social In-App Browser Fallback (avoids Android WebView ERR_BLOCKED_BY_RESPONSE) -->
            <a
              v-if="isInAppBrowser"
              :href="GOOGLE_MAPS_LINK"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative aspect-[4/3] w-full border border-white/15 hover:border-red/60 bg-asphalt flex flex-col items-center justify-center p-6 text-center overflow-hidden transition-colors"
            >
              <img
                src="/showroom-3.webp"
                alt="Lokasi Milenium Supercar Bintaro"
                class="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/60" />
              <div class="relative z-10 flex flex-col items-center">
                <div class="w-12 h-12 rounded-full bg-red/20 border border-red/50 flex items-center justify-center mb-3 text-red">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </div>
                <p class="font-display text-xl text-white">Milenium Supercar</p>
                <p class="mt-1 text-xs text-bone/80 max-w-xs">
                  Bursa Mobil Bintaro Blok 11-12, Sektor 7, Tangerang Selatan
                </p>
                <span class="mt-5 btn-shine text-white text-xs sm:text-sm px-5 py-2.5 rounded-sm font-medium">
                  Buka Petunjuk Arah di Google Maps ↗
                </span>
              </div>
            </a>

            <!-- Standard Browser Interactive Google Maps Embed -->
            <div v-else class="aspect-[4/3] w-full border border-white/10 bg-asphalt">
              <iframe
                title="Lokasi Milenium Supercar di Bursa Mobil Bintaro"
                class="w-full h-full"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
                src="https://maps.google.com/maps?q=Milenium%20Supercar%20Bursa%20Mobil%20Bintaro&t=&z=16&ie=UTF8&iwloc=&output=embed"
              />
            </div>

            <div class="flex justify-end">
              <a
                :href="GOOGLE_MAPS_LINK"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-concrete hover:text-white underline underline-offset-4"
              >
                Buka di aplikasi Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div class="hairline" />

    <!-- FOOTER -->
    <footer class="border-t border-white/10 py-10">
      <div class="max-w-6xl mx-auto px-5 flex flex-col md:flex-row md:justify-between gap-6 text-sm text-concrete">
        <div>
          <img
            src="/logo-wordmark.png"
            alt="Milenium Supercar"
            class="h-8 w-auto object-contain mb-2"
          />
          <p class="mt-1">Jual beli mobil premium dan supercar terbaik.</p>
        </div>
        <div class="flex gap-6 items-center">
          <a href="#unit" class="hover:text-white">Unit</a>
          <a href="#layanan" class="hover:text-white">Layanan</a>
          <a href="#lokasi" class="hover:text-white">Lokasi</a>
          <router-link to="/admin" class="text-concrete/60 hover:text-bone text-xs">Admin</router-link>
        </div>
      </div>
      <p class="text-center text-xs text-concrete/60 mt-10 px-5">
        &copy; {{ new Date().getFullYear() }} Milenium Supercar. All rights reserved.
        <span class="mx-1.5">&middot;</span>
        Made by
        <a
          href="https://www.instagram.com/rferofai"
          target="_blank"
          rel="noopener noreferrer"
          class="text-bone/75 hover:text-white underline underline-offset-4 transition-colors"
        >
          Fero Fasya
        </a>
      </p>
    </footer>

    <!-- FLOATING WA -->
    <a
      :href="`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo Milenium Supercar, saya mau tanya unit.')}`"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      class="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 32 32" class="w-7 h-7" fill="#fff">
        <path d="M16 3C9 3 3.4 8.6 3.4 15.5c0 2.3.6 4.4 1.7 6.3L3 29l7.4-2c1.8 1 3.800 1.500 5.600 1.500 7 0 12.600-5.600 12.600-12.500S23 3 16 3zm0 22.800c-1.800 0-3.500-.5-5-1.400l-.4-.2-4.400 1.200 1.200-4.300-.3-.4a10 10 0 0 1-1.500-5.300C5.600 9.900 10.300 5.300 16 5.300s10.400 4.600 10.400 10.200S21.700 25.800 16 25.800zm5.700-7.500c-.3-.2-1.800-.9-2.100-1s-.5-.2-.7.200-.8 1-1 1.200-.4.200-.7.100a8.300 8.300 0 0 1-4.100-3.600c-.3-.5.300-.5.900-1.600.1-.2 0-.4 0-.5l-1-2.300c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400s-1 1-1 2.500 1.100 2.900 1.200 3.100c.2.200 2.100 3.300 5.200 4.500 2.500 1 3 .8 3.500.7.600-.1 1.800-.7 2-1.400.3-.7.300-1.300.2-1.400s-.3-.2-.6-.4z" />
      </svg>
    </a>

    <!-- COMBINED DETAIL & GALLERY MODAL -->
    <UnitDetailModal :unit="selectedUnit" @close="selectedUnit = null" />

    <!-- SHOWROOM PHOTO LIGHTBOX -->
    <Teleport to="body">
      <div
        v-if="showroomLightbox"
        class="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8"
        role="dialog"
        aria-modal="true"
        @click.self="showroomLightbox = null"
      >
        <button
          type="button"
          class="absolute top-4 right-4 p-2 text-bone/80 hover:text-white"
          aria-label="Tutup foto showroom"
          @click="showroomLightbox = null"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <img
          :src="showroomLightbox.src"
          :alt="showroomLightbox.alt"
          class="max-h-[82vh] max-w-full object-contain rounded-sm border border-white/10"
        />
        <p class="mt-4 text-sm text-bone/85">{{ showroomLightbox.caption }}</p>
      </div>
    </Teleport>
  </div>
</template>
