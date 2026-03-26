<script setup>
import { ref, watch } from 'vue';
import { Search, CalendarDays, ChevronDown, ChevronUp, Filter } from 'lucide-vue-next';

const props = defineProps({
  members: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: 'all'
  }
});

const emit = defineEmits(['filter-change']);

const isCollapsed = ref(false);
const isStatusDropdownOpen = ref(false);

const filters = ref({
  keyword: '',
  startDate: '',
  endDate: '',
  statuses: [],
  member: ''
});

const availableStatuses = ['Pending', 'Approved', 'Rejected', 'Requested Changes', 'Draft'];

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
        <!-- Member Filter (Only for "All Memos") -->
        <div v-if="activeTab === 'all'" class="filter-group member-group">
          <select v-model="filters.member" class="filter-input select-input">
            <option value="">All Members</option>
            <option v-for="member in members" :key="member.name" :value="member.name">
              {{ member.name }} ({{ member.role }})
            </option>
          </select>
        </div>

        <!-- Keyword Search -->
        <div class="filter-group keyword-group">
          <div class="input-icon-wrapper">
            <Search class="input-icon" />
            <input type="text" v-model="filters.keyword" placeholder="Search by Title, Desc, or Memo#"
              class="filter-input" />
          </div>
        </div>

        <!-- Date Range -->
        <div class="filter-group date-group">
          <div class="input-icon-wrapper date-picker-wrapper" @click="openDatePicker">
            <CalendarDays class="input-icon" />
            <div class="date-display-field">
              {{ filters.startDate || 'YYYY-MM-DD' }}
            </div>
            <input type="date" v-model="filters.startDate" class="hidden-date-input" aria-label="Start Date" />
          </div>
          <span class="date-separator">to</span>
          <div class="input-icon-wrapper date-picker-wrapper" @click="openDatePicker">
            <CalendarDays class="input-icon" />
            <div class="date-display-field">
              {{ filters.endDate || 'YYYY-MM-DD' }}
            </div>
            <input type="date" v-model="filters.endDate" class="hidden-date-input" aria-label="End Date" />
          </div>
        </div>

        <!-- Status Multi-Select Dropdown -->
        <div v-if="activeTab !== 'pending_approval'" class="filter-group status-group">
          <div class="custom-multi-select" ref="dropdownRef">
            <div class="select-trigger" @click="toggleStatusDropdown" :class="{ 'is-open': isStatusDropdownOpen }">
              <div class="trigger-content">
                <span v-if="filters.statuses.length === 0" class="placeholder">Select Statuses</span>
                <div v-else class="selected-tags">
                  <span v-for="status in filters.statuses" :key="status" class="status-tag" :class="'tag-' + status.toLowerCase().replace(/\s+/g, '-')">
                    {{ status }}
                  </span>
                </div>
              </div>
              <ChevronDown class="dropdown-icon" :class="{ 'rotate': isStatusDropdownOpen }" />
            </div>

            <div v-if="isStatusDropdownOpen" class="dropdown-menu">
              <div v-for="status in availableStatuses" :key="status" 
                @click="toggleStatus(status)"
                class="dropdown-item"
                :class="{ 'active': filters.statuses.includes(status) }">
                <div class="checkbox-wrapper">
                  <div class="custom-checkbox" :class="{ 'checked': filters.statuses.includes(status) }">
                    <div v-if="filters.statuses.includes(status)" class="check-mark"></div>
                  </div>
                </div>
                <span class="item-label">{{ status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  border: 1px solid #f1f5f9;
  position: relative;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0; /* Remove horizontal padding to align with gutter */
  cursor: pointer;
  background: transparent; /* Seamless integration */
  transition: opacity 0.2s;
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
  font-size: 0.9rem;
  font-weight: 600;
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
  transition: max-height 0.3s ease-out, opacity 0.2s ease-out, padding 0.3s ease-out;
  max-height: 500px;
  opacity: 1;
}

.filter-content.is-collapsed {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  padding-bottom: 0;
}

.filter-content:not(.is-collapsed) {
  overflow: visible; /* Allow dropdowns to overflow */
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0; /* Remove horizontal padding */
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.keyword-group {
  flex: 1;
  min-width: 250px;
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
  padding: 0.5rem 0.5rem 0.5rem 2.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.select-input {
  padding-left: 0.75rem;
  cursor: pointer;
  background-color: white;
  min-width: 180px;
}

.member-group {
  flex: 0 0 auto;
}

.status-group {
  flex: 1;
  min-width: 200px;
}

.custom-multi-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  min-height: 38px;
  height: auto; /* Allow height to grow */
  transition: all 0.2s;
  overflow: visible;
}

.select-trigger:hover {
  border-color: #94a3b8;
}

.select-trigger.is-open {
  border-color: #3b82f6;
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
  font-size: 0.85rem;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  width: 100%;
}

.status-tag {
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.tag-pending { background: #e0e7ff; color: #4f46e5; }
.tag-approved { background: #dcfce7; color: #16a34a; }
.tag-rejected { background: #fee2e2; color: #dc2626; }
.tag-requested-changes { background: #fef9c3; color: #854d0e; }
.tag-draft { background: #f1f5f9; color: #475569; }

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
  background: #3b82f6;
  border-color: #3b82f6;
}

.check-mark {
  width: 10px;
  height: 5px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(-45deg) translate(1px, -1px);
}

.item-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem; /* Tighter gap on mobile */
    padding: 0.75rem 0;
  }

  .filter-group {
    width: 100%;
  }

  .date-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .date-separator {
    display: none; /* Hide 'to' when stacked */
  }

  .date-picker-wrapper {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 0.85rem;
  }
}
</style>
