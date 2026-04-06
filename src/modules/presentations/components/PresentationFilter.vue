<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  Filter, Search, BarChart3, LayoutGrid, List, ChevronDown, ChevronUp,
  Layers, SlidersHorizontal
} from 'lucide-vue-next';

const props = defineProps({
  categories: { type: Array, required: true },
  selectedCategories: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  sortBy: { type: String, default: 'date_desc' },
  viewMode: { type: String, default: 'grid' }
});

const emit = defineEmits([
  'update:searchQuery', 
  'update:sortBy', 
  'update:viewMode', 
  'toggle-category'
]);

const isFilterCollapsed = ref(false);
const isMoreFiltersOpen = ref(false);
const searchInput = ref(null);

const toggleFilter = () => {
  isFilterCollapsed.value = !isFilterCollapsed.value;
};

const focusSearch = () => {
  searchInput.value?.focus();
};

const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 640;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

defineExpose({ focusSearch });
</script>

<template>
  <div class="filter-wrapper">
    <div class="filter-header" @click="toggleFilter">
      <div class="header-left">
        <Filter class="header-icon" />
        <span class="header-title">Filter & Search</span>
      </div>
      <button class="toggle-btn">
        <ChevronUp v-if="!isFilterCollapsed" class="toggle-icon" />
        <ChevronDown v-else class="toggle-icon" />
      </button>
    </div>

    <div :class="['filter-content', { 'is-collapsed': isFilterCollapsed }]">
      <div class="filter-container">
        <!-- 1. Category Scope -->
        <div class="filter-group category-group">
          <div class="input-icon-wrapper">
            <Layers class="input-icon" />
            <select :value="selectedCategories[0] || ''" @change="emit('toggle-category', $event.target.value)"
              class="filter-input select-input">
              <option value="">All Categories</option>
              <option v-for="cat in categories.filter(c => c.id !== 'all')" :key="cat.id" :value="cat.id">
                {{ cat.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 2. Keyword Search -->
        <div class="filter-group keyword-group">
          <div class="input-icon-wrapper">
            <Search class="input-icon" />
            <input type="text" ref="searchInput" :value="searchQuery" 
              @input="emit('update:searchQuery', $event.target.value)"
              placeholder="Search by Title, Author, or Keyword"
              class="filter-input" />
          </div>
        </div>

        <!-- 3. Spacer for Ruler Grid Alignment (Matches Status column in Memos) -->
        <div class="filter-spacer-alignment"></div>

        <!-- 4. More Filters (Trigger) -->
        <div v-if="!isMobile" class="filter-group options-group">
          <button :class="['more-filters-btn', { active: isMoreFiltersOpen }]" 
            @click="isMoreFiltersOpen = !isMoreFiltersOpen" title="More Filters">
            <SlidersHorizontal class="icon-tiny" />
            <span>More</span>
          </button>
        </div>

        <!-- 4. View Mode Toggle -->
        <div v-if="!isMobile" class="filter-group view-group">
          <div class="view-toggles">
            <button :class="['view-toggle-btn', { active: viewMode === 'grid' }]" @click="emit('update:viewMode', 'grid')"
              title="Grid View">
              <LayoutGrid class="icon-tiny" />
            </button>
            <button :class="['view-toggle-btn', { active: viewMode === 'list' }]" @click="emit('update:viewMode', 'list')"
              title="List View">
              <List class="icon-tiny" />
            </button>
          </div>
        </div>

        <!-- 5. Sort Filter (Now in More menu or just moved to fit grid) -->
        <!-- Moved to expandable section below for 5-element pattern consistency -->
      </div>

      <!-- Expandable More Filters Section -->
      <transition :name="isMobile ? '' : 'expand'">
        <div v-if="isMoreFiltersOpen || isMobile" class="more-filters-section">
          <div class="filter-group sort-group">
            <label class="filter-label">Sort Order</label>
            <div class="input-icon-wrapper">
              <BarChart3 class="input-icon" />
              <select :value="sortBy" @change="emit('update:sortBy', $event.target.value)" class="filter-input select-input">
                <option value="date_desc">Latest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="title_asc">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.filter-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  cursor: pointer;
  background: white;
  transition: background 0.2s;
}

.filter-header:hover {
  background: #f8fafc;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
}

.header-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.filter-content {
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
  max-height: 500px;
  opacity: 1;
  border-top: 1px solid #f1f5f9;
}

.filter-content.is-collapsed {
  max-height: 0;
  opacity: 0;
  border-top-color: transparent;
}

.filter-container {
  display: grid;
  grid-template-columns: minmax(150px, 180px) 1fr minmax(150px, 180px) 100px 100px;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  align-items: end;
}

@media (max-width: 1200px) {
  .filter-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .filter-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1.25rem;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 0.85rem;
  width: 16px;
  height: 16px;
  color: #94a3b8;
  z-index: 1;
}

.filter-input {
  width: 100%;
  height: 42px;
  padding: 0 0.75rem 0 2.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s;
}

.filter-input:focus {
  background: white;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(225, 29, 46, 0.1);
}

.select-input {
  padding-left: 2.5rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.sort-group .filter-input {
  padding-left: 2.5rem;
}

.view-toggles {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  height: 42px;
}

.view-toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle-btn.active {
  background: white;
  color: var(--brand-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.more-filters-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem;
  height: 42px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.more-filters-btn.active {
  background: var(--brand-primary);
  color: white;
}

.more-filters-section {
  padding: 1.5rem;
  border-top: 1px dashed #e2e8f0;
  background: white;
}

.filter-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05rem;
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.icon-tiny {
  width: 16px;
  height: 16px;
}

.view-toggle-btn .icon-tiny {
  width: 18px;
  height: 18px;
}
</style>
