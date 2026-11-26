import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

export const MAX_UNITS = 35
export const MAX_PHOTOS_PER_UNIT = 15
export const WA_NUMBER = '62812800568'

/**
 * Format raw digits (e.g. "5200000000") into Indonesian thousands string ("5.200.000.000").
 */
export function formatRupiahDigits(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Format stored price for display ("Rp 5.200.000.000").
 */
export function displayPrice(price) {
  if (!price || !String(price).trim()) return ''
  const trimmed = String(price).trim()
  if (/^rp/i.test(trimmed)) return trimmed
  const formatted = formatRupiahDigits(trimmed)
  return formatted ? `Rp ${formatted}` : trimmed
}

const unitsRef = collection(db, 'units')

export const SAMPLE_UNITS = [
  {
    id: 'sample-1',
    name: 'Porsche 911 Targa 4 GTS',
    subtitle: '992.1 · PDK Sport Chrono · ATPM',
    year: '2023',
    condition: 'Pre-Owned',
    status: 'READY',
    price: '',
    odometer: '',
    tax: '',
    exteriorColor: 'Arctic Grey',
    interiorColor: '',
    engine: '3.0L Twin-Turbo Flat-6',
    power: '473 Hp · 500 Nm',
    transmission: '8-Speed PDK · AWD',
    highlights: [
      '0–100 km/h dalam 3,5 detik',
      'Velg 20/21" 911 Turbo S, Satin Black',
      'Audio BOSE Surround',
    ],
    photos: ['/1.png'],
  },
  {
    id: 'sample-2',
    name: 'Rolls-Royce Black Badge Cullinan',
    subtitle: 'Series I · Tempest Grey',
    year: '2023',
    condition: 'Pre-Owned',
    status: 'READY',
    price: '',
    odometer: '5.xxx km',
    tax: '',
    exteriorColor: 'Tempest Grey',
    interiorColor: 'Black & Mandarin, Shooting Star Headliner',
    engine: '6.75L Twin-Turbo V12',
    power: '591 Hp · 900 Nm',
    transmission: '8-Speed Automatic · AWD',
    highlights: [
      'Velg 22" Polished Black Badge',
      'Lounge Seat · Rear Theatre',
    ],
    photos: ['/2.png'],
  },
  {
    id: 'sample-3',
    name: 'Porsche 911 GT3 RS',
    subtitle: 'Weissach Package · Gulf Orange',
    year: '2025',
    condition: 'Pre-Owned',
    status: 'READY',
    price: '',
    odometer: '3xx miles',
    tax: '',
    exteriorColor: 'Gulf Orange',
    interiorColor: '',
    engine: '4.0L Naturally Aspirated Flat-6',
    power: '525 Hp · 465 Nm',
    transmission: '7-Speed PDK · RWD',
    highlights: [
      '0–100 km/h dalam 3,2 detik',
      'Rem Porsche Ceramic Composite (PCCB)',
      'Velg 20/21" Forged Magnesium',
    ],
    photos: ['/3.png'],
  },
]

export function sortUnits(list) {
  return [...list].sort((a, b) => {
    const aSold = a.status === 'SOLD' ? 1 : 0
    const bSold = b.status === 'SOLD' ? 1 : 0
    if (aSold !== bSold) return aSold - bSold
    const aTime = a.createdAt?.seconds || 0
    const bTime = b.createdAt?.seconds || 0
    return bTime - aTime
  })
}

export async function fetchUnits() {
  const q = query(unitsRef, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return sortUnits(items)
}

export async function createUnit(payload) {
  const docRef = await addDoc(unitsRef, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateUnit(id, payload) {
  const ref = doc(db, 'units', id)
  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function toggleUnitStatus(id, currentStatus) {
  const nextStatus = currentStatus === 'SOLD' ? 'READY' : 'SOLD'
  await updateUnit(id, { status: nextStatus })
  return nextStatus
}

export async function deleteUnit(id) {
  await deleteDoc(doc(db, 'units', id))
}
