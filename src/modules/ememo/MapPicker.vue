<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon path issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const props = defineProps({
  // Address string typed by the user (triggers forward geocode)
  locationQuery: {
    type: String,
    default: ''
  },
  // Pre-existing lat/lng to show on load (view mode)
  lat: {
    type: Number,
    default: null
  },
  lng: {
    type: Number,
    default: null
  },
  // If false, map is read-only (view mode)
  editable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['place-selected']);

const mapContainer = ref(null);
let map = null;
let marker = null;

const isLoading = ref(false);
const placeInfo = ref(null);

// ─── Reverse geocode ──────────────────────────────────────────────────────────
async function reverseGeocode(lat, lng) {
  isLoading.value = true;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const info = {
      lat,
      lng,
      placeName: data.name || data.display_name?.split(',')[0] || 'Unknown Place',
      displayName: data.display_name || '',
      address: data.address || {},
    };
    placeInfo.value = info;
    emit('place-selected', info);
  } catch (e) {
    console.error('Reverse geocode failed:', e);
  } finally {
    isLoading.value = false;
  }
}

// ─── Forward geocode (location text → coordinates) ───────────────────────────
async function forwardGeocode(query) {
  if (!query || query.trim().length < 3) return;
  isLoading.value = true;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lon);
      map.flyTo([latNum, lngNum], 15, { animate: true, duration: 1.2 });
      placeMarker(latNum, lngNum);
      await reverseGeocode(latNum, lngNum);
    }
  } catch (e) {
    console.error('Forward geocode failed:', e);
  } finally {
    isLoading.value = false;
  }
}

// ─── Place / move marker ──────────────────────────────────────────────────────
function placeMarker(lat, lng) {
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], { draggable: props.editable }).addTo(map);
    if (props.editable) {
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        reverseGeocode(lat, lng);
      });
    }
  }
}

// ─── Init map ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick();

  const defaultCenter = (props.lat && props.lng)
    ? [props.lat, props.lng]
    : [0, 0];
  const defaultZoom = (props.lat && props.lng) ? 15 : 2;

  map = L.map(mapContainer.value, {
    center: defaultCenter,
    zoom: defaultZoom,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Show existing marker in view mode
  if (props.lat && props.lng) {
    placeMarker(props.lat, props.lng);
    // Populate place info if lat/lng given
    await reverseGeocode(props.lat, props.lng);
  }

  // Click to place marker (edit mode only)
  if (props.editable) {
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      placeMarker(lat, lng);
      await reverseGeocode(lat, lng);
    });
  }
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
});

// ─── Watch for new text typed in the Location field ───────────────────────────
let geocodeTimer = null;
watch(() => props.locationQuery, (newVal) => {
  // Debounce so we don't hammer Nominatim on every keystroke
  clearTimeout(geocodeTimer);
  geocodeTimer = setTimeout(() => {
    if (newVal && newVal.trim().length >= 3) {
      forwardGeocode(newVal);
    }
  }, 800);
});
</script>

<template>
  <div class="map-picker-wrapper">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="map-loading-overlay">
      <div class="map-spinner"></div>
      <span>Finding location…</span>
    </div>

    <!-- Leaflet map -->
    <div ref="mapContainer" class="leaflet-map-container"></div>

    <!-- Place Info Card -->
    <div v-if="placeInfo" class="place-info-card">
      <div class="place-info-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="pin-icon"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <span class="place-name">{{ placeInfo.placeName }}</span>
      </div>
      <div class="place-address">{{ placeInfo.displayName }}</div>
      <div class="place-coords">
        <span class="coord-item">
          <span class="coord-label">Lat</span>
          <span class="coord-value">{{ placeInfo.lat.toFixed(6) }}</span>
        </span>
        <span class="coord-divider">|</span>
        <span class="coord-item">
          <span class="coord-label">Lng</span>
          <span class="coord-value">{{ placeInfo.lng.toFixed(6) }}</span>
        </span>
      </div>
    </div>

    <div v-else-if="editable" class="map-hint">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Click anywhere on the map to place a marker
    </div>
  </div>
</template>

<style scoped>
.map-picker-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.leaflet-map-container {
  width: 100%;
  height: 240px;
}

/* Loading */
.map-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 1000;
  background: rgba(255,255,255,0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #475569;
  border-radius: 8px;
}

.map-spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--brand-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Place info card */
.place-info-card {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 10px 14px;
}

.place-info-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.pin-icon {
  color: #ef4444;
  flex-shrink: 0;
}

.place-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: #0f172a;
}

.place-address {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 6px;
  line-height: 1.4;
}

.place-coords {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
}

.coord-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #e0e7ff;
  border-radius: 4px;
  padding: 2px 8px;
}

.coord-label {
  font-weight: 700;
  color: #4338ca;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.coord-value {
  font-family: monospace;
  color: #1e293b;
}

.coord-divider {
  color: #cbd5e1;
}

/* Hint */
.map-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  font-size: 0.75rem;
  color: #94a3b8;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
</style>
