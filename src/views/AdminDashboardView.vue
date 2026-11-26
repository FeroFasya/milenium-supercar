<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import {
  MAX_UNITS,
  SAMPLE_UNITS,
  createUnit,
  deleteUnit,
  fetchUnits,
  sortUnits,
  toggleUnitStatus,
  updateUnit,
} from '../lib/units'
import UnitFormModal from '../components/UnitFormModal.vue'

const router = useRouter()

const units = ref([])
const loading = ref(true)
const saving = ref(false)
const seeding = ref(false)
const busyId = ref(null)

const activeFilter = ref('ALL')
const searchQuery = ref('')

const formOpen = ref(false)
const editingUnit = ref(null)
const limitModalOpen = ref(false)
const deleteTarget = ref(null)

const toast = ref({ show: false, text: '', type: 'success' })
let toastTimer = null

function showToast(text, type = 'success') {
  toast.value = { show: true, text, type }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 3200)
}

const totalCount = computed(() => units.value.length)
const readyCount = computed(() => units.value.filter((u) => u.status !== 'SOLD').length)
const soldCount = computed(() => units.value.filter((u) => u.status === 'SOLD').length)
const isQuotaFull = computed(() => totalCount.value >= MAX_UNITS)
const quotaPercent = computed(() => Math.min(100, Math.round((totalCount.value / MAX_UNITS) * 100)))

const filteredUnits = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return units.value.filter((u) => {
    if (activeFilter.value === 'READY' && u.status === 'SOLD') return false
    if (activeFilter.value === 'SOLD' && u.status !== 'SOLD') return false
    if (!q) return true
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.subtitle || '').toLowerCase().includes(q) ||
      String(u.year || '').includes(q)
    )
  })
})

async function loadUnits() {
  loading.value = true
  try {
    units.value = await fetchUnits()
  } catch (err) {
    console.error(err)
    showToast('Gagal memuat data unit dari Firestore.', 'error')
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  if (isQuotaFull.value) {
    limitModalOpen.value = true
    return
  }
  editingUnit.value = null
  formOpen.value = true
}

function openEditModal(u) {
  editingUnit.value = u
  formOpen.value = true
}

async function handleSaveUnit(payload) {
  if (!payload.name || !payload.photos?.length) {
    showToast('Nama mobil dan minimal 1 foto wajib diisi.', 'error')
    return
  }
  saving.value = true
  try {
    if (editingUnit.value?.id) {
      await updateUnit(editingUnit.value.id, payload)
      showToast(`"${payload.name}" berhasil diperbarui.`)
    } else {
      if (units.value.length >= MAX_UNITS) {
        formOpen.value = false
        limitModalOpen.value = true
        return
      }
      await createUnit(payload)
      showToast(`"${payload.name}" berhasil ditambahkan ke katalog.`)
    }
    formOpen.value = false
    editingUnit.value = null
    await loadUnits()
  } catch (err) {
    console.error(err)
    showToast('Gagal menyimpan data unit. Cek koneksi internet Anda.', 'error')
  } finally {
    saving.value = false
  }
}

async function handleToggleStatus(u) {
  busyId.value = u.id
  try {
    const next = await toggleUnitStatus(u.id, u.status)
    u.status = next
    units.value = sortUnits(units.value)
    showToast(`Status "${u.name}" diubah ke ${next}.`)
  } catch (err) {
    console.error(err)
    showToast('Gagal mengubah status unit.', 'error')
  } finally {
    busyId.value = null
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  const target = deleteTarget.value
  busyId.value = target.id
  try {
    await deleteUnit(target.id)
    units.value = units.value.filter((item) => item.id !== target.id)
    deleteTarget.value = null
    showToast(`"${target.name}" berhasil dihapus.`)
  } catch (err) {
    console.error(err)
    showToast('Gagal menghapus unit.', 'error')
  } finally {
    busyId.value = null
  }
}

async function handleSeedSamples() {
  seeding.value = true
  try {
    for (const sample of SAMPLE_UNITS) {
      const { id, ...data } = sample
      await createUnit(data)
    }
    await loadUnits()
    showToast('3 unit contoh berhasil dimasukkan ke database!')
  } catch (err) {
    console.error(err)
    showToast('Gagal memuat unit contoh.', 'error')
  } finally {
    seeding.value = false
  }
}

async function handleLogout() {
  await signOut(auth)
  router.push('/admin/login')
}

onMounted(loadUnits)
</script>

<template>
  <div class="min-h-screen bg-ink text-bone pb-20">
    <!-- TOP BAR -->
    <header class="sticky top-0 z-30 bg-ink/95 backdrop-blur border-b border-white/10">
      <div class="max-w-5xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <img src="/logo-wordmark.png" alt="Milenium Supercar" class="h-7 sm:h-8 w-auto flex-shrink-0" />
          <span class="hidden sm:inline text-[11px] uppercase tracking-[.2em] text-concrete border-l border-white/15 pl-3">
            Dashboard Admin
          </span>
        </div>
        <div class="flex items-center gap-3 text-xs sm:text-sm">
          <router-link
            to="/"
            target="_blank"
            class="text-concrete hover:text-white underline underline-offset-4"
          >
            Lihat Web
          </router-link>
          <button
            type="button"
            class="border border-white/20 px-3 py-1.5 rounded-sm hover:border-white text-xs"
            @click="handleLogout"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 space-y-6">
      <!-- QUOTA & PRIMARY ACTION -->
      <div class="bg-asphalt border border-white/10 p-5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline justify-between gap-4">
            <h1 class="font-display text-2xl text-white">Kelola Stok Unit</h1>
            <span
              class="text-sm font-medium"
              :class="isQuotaFull ? 'text-red' : totalCount >= 30 ? 'text-amber-400' : 'text-bone'"
            >
              {{ totalCount }} / {{ MAX_UNITS }} Unit
            </span>
          </div>
          <div class="mt-2.5 h-1.5 w-full bg-ink rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-300"
              :class="isQuotaFull ? 'bg-red' : totalCount >= 30 ? 'bg-amber-400' : 'bg-emerald-500'"
              :style="{ width: quotaPercent + '%' }"
            />
          </div>
          <p class="mt-2 text-xs text-concrete">
            {{ readyCount }} Ready · {{ soldCount }} Sold · Maksimal {{ MAX_UNITS }} unit aktif di katalog.
          </p>
        </div>

        <button
          type="button"
          class="btn-shine text-white px-5 py-3 rounded-sm text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2"
          @click="openCreateModal"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Unit Baru
        </button>
      </div>

      <!-- FILTER & SEARCH -->
      <div class="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div class="flex gap-1.5 bg-asphalt border border-white/10 p-1 rounded-sm w-fit">
          <button
            v-for="tab in [
              { id: 'ALL', label: `Semua (${totalCount})` },
              { id: 'READY', label: `Ready (${readyCount})` },
              { id: 'SOLD', label: `Sold (${soldCount})` },
            ]"
            :key="tab.id"
            type="button"
            class="px-3.5 py-1.5 text-xs font-medium rounded-sm transition-colors"
            :class="
              activeFilter === tab.id
                ? 'bg-red text-white'
                : 'text-concrete hover:text-white'
            "
            @click="activeFilter = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <input
          v-model="searchQuery"
          type="search"
          placeholder="Cari nama mobil atau tahun..."
          class="w-full sm:w-64 bg-asphalt border border-white/15 px-3.5 py-2 text-sm text-white rounded-sm placeholder:text-concrete"
        />
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="space-y-3">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-asphalt border border-white/10 p-4 rounded-sm animate-pulse flex gap-4"
        >
          <div class="w-24 h-20 bg-ink rounded-sm" />
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 bg-white/10 w-1/2 rounded" />
            <div class="h-3 bg-white/10 w-1/3 rounded" />
          </div>
        </div>
      </div>

      <!-- EMPTY DATABASE -->
      <div
        v-else-if="units.length === 0"
        class="bg-asphalt border border-white/10 p-8 sm:p-10 rounded-sm text-center"
      >
        <h2 class="font-display text-xl text-white">Belum ada unit di database</h2>
        <p class="mt-2 text-sm text-concrete max-w-md mx-auto">
          Tambahkan unit pertama Anda, atau masukkan 3 unit contoh dari prototype sekaligus untuk mulai mencoba.
        </p>
        <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            class="btn-shine text-white px-5 py-2.5 rounded-sm text-sm font-medium"
            @click="openCreateModal"
          >
            + Tambah Unit Pertama
          </button>
          <button
            type="button"
            :disabled="seeding"
            class="border border-white/25 hover:border-white px-5 py-2.5 rounded-sm text-sm text-bone disabled:opacity-50"
            @click="handleSeedSamples"
          >
            {{ seeding ? 'Memasukkan...' : 'Muat 3 Unit Contoh' }}
          </button>
        </div>
      </div>

      <!-- EMPTY FILTER RESULT -->
      <div
        v-else-if="filteredUnits.length === 0"
        class="bg-asphalt border border-white/10 p-8 rounded-sm text-center text-sm text-concrete"
      >
        Tidak ada unit yang cocok dengan filter atau pencarian.
      </div>

      <!-- UNITS LIST -->
      <div v-else class="space-y-3">
        <div
          v-for="u in filteredUnits"
          :key="u.id"
          class="bg-asphalt border border-white/10 hover:border-white/20 p-3.5 sm:p-4 rounded-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-colors"
        >
          <!-- Thumbnail + Info -->
          <div class="flex items-start gap-3.5 flex-1 min-w-0">
            <div class="relative w-24 sm:w-28 aspect-[4/3] bg-ink rounded-sm overflow-hidden flex-shrink-0 border border-white/10">
              <img
                :src="u.photos?.[0] || '/hero.png'"
                :alt="u.name"
                class="w-full h-full object-cover"
                :class="{ 'grayscale opacity-70': u.status === 'SOLD' }"
              />
              <span
                class="absolute bottom-1 right-1 bg-black/75 text-[10px] px-1.5 py-0.5 text-bone rounded-sm"
              >
                {{ u.photos?.length || 0 }} foto
              </span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-sm"
                  :class="
                    u.status === 'SOLD'
                      ? 'bg-white/10 text-concrete'
                      : 'bg-emerald-600/90 text-white'
                  "
                >
                  {{ u.status === 'SOLD' ? 'SOLD' : 'READY' }}
                </span>
                <span v-if="u.year" class="text-xs text-concrete">NIK {{ u.year }}</span>
                <span v-if="u.odometer" class="text-xs text-concrete">· {{ u.odometer }}</span>
              </div>

              <h2 class="font-display text-lg text-white truncate mt-1">{{ u.name }}</h2>
              <p v-if="u.subtitle" class="text-xs text-concrete truncate">{{ u.subtitle }}</p>
              <p class="text-xs mt-1" :class="u.price ? 'text-bone font-medium' : 'text-concrete'">
                {{ u.price || 'Price : Ask' }}
              </p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <button
              type="button"
              :disabled="busyId === u.id"
              class="flex-1 sm:flex-none px-3 py-2 text-xs font-medium rounded-sm border transition-colors disabled:opacity-50"
              :class="
                u.status === 'SOLD'
                  ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                  : 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
              "
              @click="handleToggleStatus(u)"
            >
              {{ u.status === 'SOLD' ? 'Tandai READY' : 'Tandai SOLD' }}
            </button>

            <button
              type="button"
              class="px-3.5 py-2 text-xs font-medium rounded-sm border border-white/20 text-bone hover:border-white hover:text-white"
              @click="openEditModal(u)"
            >
              Edit
            </button>

            <button
              type="button"
              class="px-3 py-2 text-xs font-medium rounded-sm border border-red/40 text-red hover:bg-red hover:text-white transition-colors"
              @click="deleteTarget = u"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- ADD / EDIT FORM MODAL -->
    <UnitFormModal
      :open="formOpen"
      :unit="editingUnit"
      :saving="saving"
      @close="formOpen = false"
      @save="handleSaveUnit"
    />

    <!-- SOFT LIMIT 35 UNIT MODAL -->
    <Teleport to="body">
      <div
        v-if="limitModalOpen"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        @click.self="limitModalOpen = false"
      >
        <div class="w-full max-w-md bg-asphalt border border-white/15 p-6 rounded-sm">
          <h3 class="font-display text-xl text-white">Kapasitas Katalog Penuh ({{ MAX_UNITS }}/{{ MAX_UNITS }})</h3>
          <p class="mt-3 text-sm text-concrete leading-relaxed">
            Jumlah unit di website sudah mencapai batas optimal <strong class="text-white">{{ MAX_UNITS }} unit</strong>.
            Silakan hapus unit lama yang sudah <strong class="text-white">SOLD</strong> terlebih dahulu untuk menambahkan unit baru.
          </p>
          <div class="mt-6 flex justify-end gap-2.5">
            <button
              type="button"
              class="px-4 py-2 text-sm text-concrete hover:text-white"
              @click="limitModalOpen = false"
            >
              Tutup
            </button>
            <button
              type="button"
              class="btn-shine text-white px-4 py-2 rounded-sm text-sm font-medium"
              @click="activeFilter = 'SOLD'; limitModalOpen = false"
            >
              Lihat Unit SOLD
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- DELETE CONFIRM MODAL -->
    <Teleport to="body">
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        @click.self="deleteTarget = null"
      >
        <div class="w-full max-w-sm bg-asphalt border border-white/15 p-6 rounded-sm">
          <h3 class="font-display text-xl text-white">Hapus Unit Ini?</h3>
          <p class="mt-2 text-sm text-concrete">
            <strong class="text-white">{{ deleteTarget.name }}</strong> akan dihapus permanen dari website katalog.
          </p>
          <div class="mt-6 flex justify-end gap-2.5">
            <button
              type="button"
              class="px-4 py-2 text-sm text-concrete hover:text-white"
              @click="deleteTarget = null"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="busyId === deleteTarget.id"
              class="bg-red hover:bg-red/90 text-white px-4 py-2 rounded-sm text-sm font-medium disabled:opacity-50"
              @click="confirmDelete"
            >
              {{ busyId === deleteTarget.id ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- TOAST -->
    <Teleport to="body">
      <div
        v-if="toast.show"
        class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-sm text-sm shadow-xl border"
        :class="
          toast.type === 'error'
            ? 'bg-red text-white border-red'
            : 'bg-asphalt text-white border-emerald-500/50'
        "
      >
        {{ toast.text }}
      </div>
    </Teleport>
  </div>
</template>
