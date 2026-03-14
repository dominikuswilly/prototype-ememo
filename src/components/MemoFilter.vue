<script setup>
import { ref, watch } from 'vue';
import { Search, CalendarDays } from 'lucide-vue-next';

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

const filters = ref({
  keyword: '',
  startDate: '',
  endDate: '',
  statuses: [],
  member: ''
});

const availableStatuses = ['Pending', 'Approved', 'Rejected', 'Requested Changes'];

const toggleStatus = (status) => {
  const index = filters.value.statuses.indexOf(status);
  if (index === -1) {
    filters.value.statuses.push(status);
  } else {
    filters.value.statuses.splice(index, 1);
  }
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
</script>

<template>
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
        <input 
          type="text" 
          v-model="filters.keyword" 
          placeholder="Search by Title, Desc, or Memo#" 
          class="filter-input"
        />
      </div>
    </div>

    <!-- Date Range -->
    <div class="filter-group date-group">
      <div class="input-icon-wrapper date-picker-wrapper" @click="openDatePicker">
        <CalendarDays class="input-icon" />
        <div class="date-display-field">
          {{ filters.startDate || 'YYYY-MM-DD' }}
        </div>
        <input 
          type="date" 
          v-model="filters.startDate" 
          class="hidden-date-input"
          aria-label="Start Date"
        />
      </div>
      <span class="date-separator">to</span>
      <div class="input-icon-wrapper date-picker-wrapper" @click="openDatePicker">
        <CalendarDays class="input-icon" />
        <div class="date-display-field">
          {{ filters.endDate || 'YYYY-MM-DD' }}
        </div>
        <input 
          type="date" 
          v-model="filters.endDate" 
          class="hidden-date-input"
          aria-label="End Date"
        />
      </div>
    </div>

    <!-- Status Toggles -->
    <div class="filter-group status-group">
      <button 
        v-for="status in availableStatuses" 
        :key="status"
        @click="toggleStatus(status)"
        class="status-toggle-btn"
        :class="['toggle-' + status.toLowerCase().replace(/\s+/g, '-'), { active: filters.statuses.includes(status) }]"
      >
        {{ status }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.filter-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
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

/* Base input icons inside wrappers */
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

.date-input {
  width: auto;
  min-width: 130px;
}

.date-separator {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.status-group {
  display: flex;
  gap: 0.5rem;
}

.status-toggle-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.status-toggle-btn:hover {
  background: #f8fafc;
}

/* Active Status Styles */
.status-toggle-btn.active.toggle-pending {
  background: #e0e7ff;
  border-color: #818cf8;
  color: #4f46e5;
}

.status-toggle-btn.active.toggle-approved {
  background: #dcfce7;
  border-color: #86efac;
  color: #16a34a;
}

.status-toggle-btn.active.toggle-rejected {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.status-toggle-btn.active.toggle-requested-changes {
  background: #fef9c3;
  border-color: #fde047;
  color: #854d0e;
}

@media (max-width: 1024px) {
  .date-group {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .date-group {
    flex-wrap: wrap;       /* Allow dates to stack if needed */
    justify-content: center; /* Center them when wrapped */
  }
  
  .date-input {
    flex: 1;              /* Allow inputs to stretch to full available width on mobile */
    min-width: 120px;
  }

  .status-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .status-toggle-btn {
    width: 100%;
    padding: 0.6rem 0.5rem;
    text-align: center;
  }
}
</style>
