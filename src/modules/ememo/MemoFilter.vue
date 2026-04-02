<script setup>
import { ref, watch } from 'vue';
import { Search, CalendarDays, ChevronDown, ChevronUp, Filter, LayoutGrid, List, User, Check, Clock, SlidersHorizontal, Layers } from 'lucide-vue-next';

const props = defineProps({
  members: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: 'all'
  },
  viewMode: {
    type: String,
    default: 'grid'
  }
});

const emit = defineEmits(['filter-change', 'view-mode-change']);

const isCollapsed = ref(false);
const isMoreFiltersOpen = ref(false);
const isStatusDropdownOpen = ref(false);

const filters = ref({
  keyword: '',
  startDate: '',
  endDate: '',
  statuses: [],
  member: ''
});

const availableStatuses = ['In Review', 'Approved', 'Rejected', 'Requested Changes', 'Draft'];

const toggleStatus = (status) => {
  const index = filters.value.statuses.indexOf(status);
  if (index === -1) {
    filters.value.statuses.push(status);
  } else {
    filters.value.statuses.splice(index, 1);
  }
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  if (isCollapsed.value) isStatusDropdownOpen.value = false;
};

const toggleStatusDropdown = () => {
  isStatusDropdownOpen.value = !isStatusDropdownOpen.value;
};

const closeStatusDropdown = () => {
  isStatusDropdownOpen.value = false;
};

watch(filters, (newFilters) => {
  emit('filter-change', { ...newFilters });
}, { deep: true });

const openDatePicker = (event) => {
  const input = event.currentTarget.querySelector('input[type="date"]');
  if (input && input.showPicker) {
    input.showPicker();
  } else if (input) {
    input.focus();
    input.click();
  }
};

// Custom click outside logic
import { onMounted, onUnmounted } from 'vue';
const dropdownRef = ref(null);

const handleOutsideClick = (event) => {
  if (isStatusDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeStatusDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
</script>

<template>
  <div class="filter-wrapper">
    <div class="filter-header" @click="toggleCollapse">
      <div class="header-left">
        <Filter class="header-icon" />
        <span class="header-title">Filter & Search</span>
      </div>
      <button class="toggle-btn">
        <ChevronUp v-if="!isCollapsed" class="toggle-icon" />
        <ChevronDown v-else class="toggle-icon" />
      </button>
    </div>

    <div :class="['filter-content', { 'is-collapsed': isCollapsed }]">
      <div class="filter-container">
        <!-- 1. Member Filter (Selective based on Tab) -->
        <div class="filter-group member-group">
          <div class="input-icon-wrapper">
             <Layers class="input-icon" />
             <select v-model="filters.member" :disabled="activeTab !== 'all'" class="filter-input select-input">
               <option value="">{{ activeTab === 'all' ? 'All Members' : 'My Memos' }}</option>
               <option v-for="member in members" :key="member.name" :value="member.name">
                 {{ member.name }}
               </option>
             </select>
          </div>
        </div>

        <!-- 2. Keyword Search -->
        <div class="filter-group keyword-group">
          <div class="input-icon-wrapper">
            <Search class="input-icon" />
            <input type="text" v-model="filters.keyword" placeholder="Search by Title, Desc, or Memo#"
              class="filter-input" />
          </div>
        </div>

        <!-- 3. Status/Sort Column -->
        <div :class="['filter-group status-group', { 'is-open': isStatusDropdownOpen }]">
          <div v-if="activeTab !== 'pending_approval'" class="custom-multi-select" ref="dropdownRef">
            <div class="select-trigger" @click="toggleStatusDropdown" :class="{ 'is-open': isStatusDropdownOpen }">
              <div class="trigger-content">
                <span v-if="filters.statuses.length === 0" class="placeholder">All Statuses</span>
                <div v-else class="selected-tags">
                   <span class="status-summary">{{ filters.statuses.length }} selected</span>
                </div>
              </div>
              <ChevronDown class="dropdown-icon" :class="{ 'rotate': isStatusDropdownOpen }" />
            </div>

            <div v-if="isStatusDropdownOpen" class="dropdown-menu">
              <div v-for="status in availableStatuses" :key="status" @click="toggleStatus(status)" class="dropdown-item"
                :class="{ 'active': filters.statuses.includes(status) }">
                <div class="custom-checkbox" :class="{ 'checked': filters.statuses.includes(status) }">
                    <Check v-if="filters.statuses.includes(status)" class="check-icon" />
                </div>
                <span class="item-label">{{ status }}</span>
              </div>
            </div>
          </div>
          <div v-else class="status-placeholder">
             <div class="trigger-content-fake">
               <Clock class="input-icon-inline" />
               <span>Pending Action</span>
             </div>
          </div>
        </div>

        <!-- 4. More Filters -->
        <div class="filter-group more-group">
          <button :class="['more-filters-btn', { active: isMoreFiltersOpen }]" 
            @click="isMoreFiltersOpen = !isMoreFiltersOpen" title="More Filters">
            <SlidersHorizontal class="icon-tiny" />
            <span>More</span>
          </button>
        </div>

        <!-- 5. View Mode Toggle -->
        <div class="filter-group view-group">
          <div class="view-toggles">
            <button :class="['view-toggle-btn', { active: viewMode === 'grid' }]" 
              @click="emit('view-mode-change', 'grid')" title="Grid View">
              <LayoutGrid class="icon-tiny" />
            </button>
            <button :class="['view-toggle-btn', { active: viewMode === 'list' }]" 
              @click="emit('view-mode-change', 'list')" title="List View">
              <List class="icon-tiny" />
            </button>
          </div>
        </div>

        <!-- Row 2: Date Range (Only if More Filters is Open) -->
        <transition name="expand">
          <div v-if="isMoreFiltersOpen" class="filter-group date-full-group">
             <div class="date-range-combined">
               <div class="date-input-box" @click="openDatePicker">
                 <CalendarDays class="input-icon-mini" />
                 <span class="date-val">{{ filters.startDate || 'From' }}</span>
                 <input type="date" v-model="filters.startDate" class="hidden-date-input" />
               </div>
               <div class="date-arrow">→</div>
               <div class="date-input-box" @click="openDatePicker">
                 <CalendarDays class="input-icon-mini" />
                 <span class="date-val">{{ filters.endDate || 'To' }}</span>
                 <input type="date" v-model="filters.endDate" class="hidden-date-input" />
               </div>
             </div>
          </div>
        </transition>
      </div>
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
  position: relative;
  /* overflow: hidden removed to allow dropdowns to break out */
  overflow: visible; 
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
  background: #f1f5f9;
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
  color: #64748b;
  display: flex;
  align-items: center;
}

.toggle-icon {
  width: 20px;
  height: 20px;
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
  overflow: hidden;
}

.filter-content:not(.is-collapsed) {
  overflow: visible;
  /* Allow dropdowns to overflow */
}

.filter-container {
  display: grid;
  grid-template-columns: minmax(150px, 180px) 1fr minmax(150px, 180px) 100px 90px;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.keyword-group {
  grid-column: span 1;
}

.member-group {
  grid-column: span 1;
}

.status-group {
  grid-column: span 1;
  position: relative;
  z-index: 10;
}

.status-group.is-open {
  z-index: 600; /* Forward onto container and higher stacking */
}

.more-group {
  grid-column: span 1;
}

.view-group {
  grid-column: span 1;
}

.options-container {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.view-toggles {
  flex: 1;
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  height: 42px;
}

.date-full-group {
  grid-column: span 5;
  margin-top: 0.5rem;
  border-top: 1px dashed #e2e8f0;
  padding-top: 1.5rem;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 100px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
  margin-top: 0;
  padding-top: 0;
}

.date-range-combined {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #f8fafc;
  padding: 0.5rem 1.25rem;
  border-radius: 14px;
  width: fit-content;
  border: 1.5px solid #e2e8f0;
}

.date-input-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  transition: background 0.2s;
  position: relative;
}

.date-input-box:hover {
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.date-val {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  font-family: ui-monospace, monospace;
}

.date-arrow {
  color: #94a3b8;
  font-weight: 800;
}

.input-icon-mini {
  width: 14px;
  height: 14px;
  color: #64748b;
}

.date-picker-wrapper {
  position: relative;
  min-width: 140px;
}

.date-display-field {
  padding: 0.6rem 1rem 0.6rem 2.4rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #0f172a;
  font-size: 0.9rem;
  font-family: monospace;
  width: 100%;
  pointer-events: none;
}

.hidden-date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.date-separator {
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #94a3b8;
  z-index: 1;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
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
  cursor: pointer;
  min-width: 160px;
  appearance: none; /* Premium look */
}

.member-group {
  min-width: 0;
}

.status-group {
  min-width: 0;
}

.custom-multi-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  height: 42px;
  transition: all 0.2s;
}

.select-trigger:hover {
  background: white;
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-placeholder {
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  background: #f1f5f9;
  border-radius: 10px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.7;
}

.trigger-content-fake {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.input-icon-inline {
  width: 16px;
  height: 16px;
}

.select-trigger.is-open {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.trigger-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: 2px 0;
}

.placeholder {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-summary {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--brand-primary);
  background: #fef2f2;
  padding: 0.15rem 0.6rem;
  border-radius: 6px;
}

/* Options & Buttons */
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.more-filters-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.more-filters-btn.active {
  background: var(--brand-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(225, 29, 46, 0.2);
}

/* View Mode Toggles */

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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 1rem;
}

.view-toggle-btn.active {
  background: white;
  color: var(--brand-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.view-toggle-btn .icon-tiny {
  width: 14px;
  height: 14px;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
  transition: transform 0.2s;
  margin-left: 0.5rem;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 500;
  overflow-y: auto;
  max-height: 250px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.checkbox-wrapper {
  flex-shrink: 0;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.custom-checkbox.checked {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
}

.check-icon {
  width: 12px;
  height: 12px;
  color: white;
}

.item-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
}

@media (max-width: 1024px) {
  .filter-container {
    grid-template-columns: repeat(2, 1fr);
  }
  .date-full-group {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .filter-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1.25rem;
  }
  .date-full-group {
    grid-column: span 1;
  }
  .date-range-combined {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .date-arrow {
    text-align: center;
    transform: rotate(90deg);
    margin: -0.25rem 0;
  }
}
</style>
