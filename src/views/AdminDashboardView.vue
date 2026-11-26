<script setup>
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

const router = useRouter()

async function handleLogout() {
  await signOut(auth)
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-ink text-bone px-5 py-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between border-b border-white/10 pb-5">
      <div class="flex items-center gap-4">
        <img src="/logo-wordmark.png" alt="Milenium Supercar" class="h-8 w-auto" />
        <span class="text-xs uppercase tracking-widest text-concrete border-l border-white/15 pl-4">
          Admin Panel
        </span>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <router-link to="/" class="text-concrete hover:text-white">Lihat Web</router-link>
        <button
          type="button"
          class="border border-white/20 px-3.5 py-1.5 rounded-sm hover:border-white text-xs"
          @click="handleLogout"
        >
          Keluar
        </button>
      </div>
    </div>

    <div class="mt-10 bg-asphalt border border-white/10 p-6 rounded-sm">
      <h1 class="font-display text-2xl text-white">Login Berhasil!</h1>
      <p class="mt-2 text-sm text-concrete">
        Dashboard kelola unit (CRUD, toggle READY/SOLD, upload multi-foto Cloudinary, dan soft-limit 35 unit) akan dibangun lengkap di Fase 4.
      </p>
    </div>
  </div>
</template>
