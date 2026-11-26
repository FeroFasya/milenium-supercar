<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebase'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const infoMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  infoMsg.value = ''
  loading.value = true
  try {
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value)
    router.push('/admin')
  } catch (err) {
    errorMsg.value = 'Email atau password salah. Silakan cek kembali.'
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  errorMsg.value = ''
  infoMsg.value = ''
  if (!email.value.trim()) {
    errorMsg.value = 'Masukkan email admin terlebih dahulu untuk reset password.'
    return
  }
  try {
    await sendPasswordResetEmail(auth, email.value.trim())
    infoMsg.value = 'Link reset password sudah dikirim ke email Anda. Cek Inbox atau Spam.'
  } catch (err) {
    errorMsg.value = 'Gagal mengirim email reset password. Pastikan email terdaftar.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-ink text-bone flex items-center justify-center px-5 py-12">
    <div class="w-full max-w-md bg-asphalt border border-white/10 p-8 rounded-sm">
      <div class="flex flex-col items-center mb-8">
        <img src="/logo-wordmark.png" alt="Milenium Supercar" class="h-10 w-auto object-contain mb-3" />
        <p class="text-sm text-concrete">Dashboard Admin Katalog</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-xs uppercase tracking-wider text-concrete mb-1.5" for="email">
            Email Admin
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="admin@mileniumsupercar.com"
            class="w-full bg-ink border border-white/15 px-3.5 py-2.5 text-sm text-white rounded-sm"
          />
        </div>

        <div>
          <label class="block text-xs uppercase tracking-wider text-concrete mb-1.5" for="password">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full bg-ink border border-white/15 px-3.5 py-2.5 text-sm text-white rounded-sm"
          />
        </div>

        <p v-if="errorMsg" class="text-xs text-red">{{ errorMsg }}</p>
        <p v-if="infoMsg" class="text-xs text-emerald-400">{{ infoMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-shine text-white py-3 rounded-sm font-medium text-sm disabled:opacity-50"
        >
          {{ loading ? 'Masuk...' : 'Masuk ke Dashboard' }}
        </button>
      </form>

      <div class="mt-5 flex items-center justify-between text-xs text-concrete">
        <button type="button" class="hover:text-white underline underline-offset-4" @click="handleResetPassword">
          Lupa password?
        </button>
        <router-link to="/" class="hover:text-white">← Kembali ke Web</router-link>
      </div>
    </div>
  </div>
</template>
