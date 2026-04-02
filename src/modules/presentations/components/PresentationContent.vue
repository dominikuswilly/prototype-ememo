<script setup>
import PresentationCard from './PresentationCard.vue';
import PresentationRow from './PresentationRow.vue';
import { 
  Search, X
} from 'lucide-vue-next';

const props = defineProps({
  items: { type: Array, required: true },
  viewMode: { type: String, default: 'grid' },
  selectedIds: { type: Array, default: () => [] },
  activeMenuId: { type: [Number, String], default: null },
  isMobile: { type: Boolean, default: false },
  isSelectMode: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
});

const emit = defineEmits([
  'toggle-selection', 
  'open-menu', 
  'execute-action', 
  'select-all', 
  'clear-selection',
  'clear-filters'
]);

const isFileSelected = (id) => props.selectedIds.includes(id);
</script>

<template>
  <section class="content-section">
    <div v-if="items.length > 0">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="presentation-grid">
        <!-- Skeleton Loader (Grid) -->
        <template v-if="isLoading">
          <PresentationCard v-for="i in 6" :key="'skeleton-g-'+i" is-loading />
        </template>

        <!-- Actual Content (Grid) -->
        <template v-else>
          <PresentationCard v-for="p in items" :key="p.id"
            :p="p"
            :is-selected="isFileSelected(p.id)"
            :is-mobile="isMobile"
            :is-select-mode="isSelectMode"
            :active-menu-id="activeMenuId"
            @toggle-selection="id => emit('toggle-selection', id)"
            @open-menu="id => emit('open-menu', id)"
            @execute-action="(action, item) => emit('execute-action', action, item)" />
        </template>
      </div>

      <!-- List View -->
      <div v-else class="presentation-list">
        <div class="list-header desktop-only">
          <div class="col-check">
            <input type="checkbox" :checked="selectedIds.length === items.length && items.length > 0" 
              @change="selectedIds.length === items.length ? emit('clear-selection') : emit('select-all')" />
          </div>
          <div class="col-name">Name</div>
          <div class="col-category">Category</div>
          <div class="col-author">Author & Date</div>
          <div class="col-size">Size</div>
          <div class="col-actions"></div>
        </div>

        <!-- Skeleton Loader (List) -->
        <template v-if="isLoading">
          <PresentationRow v-for="i in 8" :key="'skeleton-l-'+i" is-loading />
        </template>

        <!-- Actual Content (List) -->
        <template v-else>
          <PresentationRow v-for="p in items" :key="p.id"
            :p="p"
            :is-selected="isFileSelected(p.id)"
            :is-mobile="isMobile"
            :is-select-mode="isSelectMode"
            :active-menu-id="activeMenuId"
            @toggle-selection="id => emit('toggle-selection', id)"
            @open-menu="id => emit('open-menu', id)"
            @execute-action="(action, item) => emit('execute-action', action, item)" />
        </template>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon-wrap">
        <div class="icon-pulse"></div>
        <Search class="empty-icon" />
      </div>
      <h3 class="em-title">No presentations found</h3>
      <p class="em-text">Try adjusting your search or category filter to find what you're looking for.</p>
      <button class="btn-clear-filters" @click="emit('clear-filters')">
        <X class="icon-tiny" />
        <span>Clear Filters</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.content-section {
  flex: 1;
  min-width: 0;
  margin-top: 0;
  padding-top: 0;
}

.presentation-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 0;
}

@media (max-width: 1280px) {
  .presentation-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .presentation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .presentation-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-top: 0;
  }
}

/* List View Style */
.presentation-list {
  background: white;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  margin-top: 0;
}

.list-header {
  display: grid;
  grid-template-columns: 50px 1fr 180px 220px 100px 140px;
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.col-check { display: flex; align-items: center; justify-content: center; }

@media (max-width: 1024px) {
  .desktop-only { display: none; }
}

/* Common UI */
.icon-tiny { width: 14px; height: 14px; }

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
  background: white;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.empty-icon-wrap {
  width: 96px;
  height: 96px;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  position: relative;
}

.icon-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--brand-primary);
  border-radius: 50%;
  opacity: 0.1;
  animation: pulse 2s infinite ease-out;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.empty-icon {
  width: 44px;
  height: 44px;
  color: var(--brand-primary);
  position: relative;
  z-index: 2;
}

.em-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.em-text {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 2.5rem;
  max-width: 320px;
  line-height: 1.6;
}

.btn-clear-filters {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.75rem;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-clear-filters:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.35);
}

.btn-clear-filters:active {
  transform: translateY(0);
}
</style>
