<script setup>
import { ref, computed } from 'vue';
import Sidebar from './components/Sidebar.vue';
import MemoFilter from './components/MemoFilter.vue';
import MemoList from './components/MemoList.vue';
import { mockMemos } from './data/mockData';
import { Menu, X, Plus } from 'lucide-vue-next';

const memoListRef = ref(null);
const memos = ref([...mockMemos]);
const isMobileMenuOpen = ref(false);
const activeTab = ref('all');

// Mock user for "Pending Approval" logic
// Mock user for hierarchy
const currentUser = 'Tyrell Wellick';
const subordinates = [
  { name: 'Elliot Alderson', role: 'Cybersecurity Engineer' },
  { name: 'Angela Moss', role: 'Risk Management PR' },
  { name: 'Phillip Price', role: 'Senior CEO Advisor' },
  { name: 'Susan Jacobs', role: 'General Counsel' },
  { name: 'Gideon Goddard', role: 'Allsafe CEO' }
];

const filterState = ref({
  keyword: '',
  startDate: '',
  endDate: '',
  statuses: [],
  member: '' // New filter field
});

const handleFilterChange = (newFilters) => {
  filterState.value = newFilters;
};

const pageTitle = computed(() => {
  if (activeTab.value === 'my_memos') return 'My Memos';
  if (activeTab.value === 'pending_approval') return 'Pending Approval';
  if (activeTab.value === 'drafts') return 'Draft Memos';
  return 'All eMemos';
});

const pageDescription = computed(() => {
  if (activeTab.value === 'my_memos') return 'Memos created by you.';
  if (activeTab.value === 'pending_approval') return 'Memos waiting for your approval.';
  if (activeTab.value === 'drafts') return 'Memos you have saved but not yet submitted.';
  return 'A simple overview of all memorandums in the system.';
});

const pendingCount = computed(() => {
  return memos.value.filter(m => {
    return m.approvalChain.some(tier => 
      tier.approvers.some(a => a.name === currentUser && a.status === 'Pending')
    );
  }).length;
});

const filteredMemos = computed(() => {
  let result = memos.value;

  if (activeTab.value === 'my_memos') {
    result = result.filter(m => m.requester === currentUser); 
  } else if (activeTab.value === 'pending_approval') {
    result = result.filter(m => {
      return m.approvalChain.some(tier => 
        tier.approvers.some(a => a.name === currentUser && a.status === 'Pending')
      );
    });
  } else if (activeTab.value === 'drafts') {
    result = result.filter(m => m.requester === currentUser && m.status === 'Draft');
  } else if (activeTab.value === 'all') {
    // Show self + subordinates (excluding drafts of subordinates usually, but here we show all non-drafts)
    const subordinateNames = subordinates.map(s => s.name);
    const hierarchy = [currentUser, ...subordinateNames];
    result = result.filter(m => hierarchy.includes(m.requester) && m.status !== 'Draft');
  }

  return result.filter(memo => {
    // 1. Member Filter (Only applicable in "All Memos")
    if (activeTab.value === 'all' && filterState.value.member) {
      if (memo.requester !== filterState.value.member) return false;
    }

    // 2. Keyword Match (Title, Desc, Memo Number)
    if (filterState.value.keyword) {
      const keyword = filterState.value.keyword.toLowerCase();
      const matchTitle = memo.title.toLowerCase().includes(keyword);
      const matchDesc = memo.description.toLowerCase().includes(keyword);
      const matchNum = memo.memoNumber.toLowerCase().includes(keyword);
      if (!matchTitle && !matchDesc && !matchNum) return false;
    }

    // 3. Date Range Match (createdAt)
    if (filterState.value.startDate || filterState.value.endDate) {
      const memoDateKey = memo.createdAt.substring(0, 10); // Extract YYYY-MM-DD
      
      if (filterState.value.startDate && memoDateKey < filterState.value.startDate) {
        return false;
      }
      
      if (filterState.value.endDate && memoDateKey > filterState.value.endDate) {
        return false;
      }
    }

    // 4. Status Match
    if (filterState.value.statuses.length > 0) {
      if (!filterState.value.statuses.includes(memo.status)) return false;
    }

    return true;
  });
});

const triggerCreateModal = () => {
  if (memoListRef.value) {
    memoListRef.value.openCreateModal();
  }
};

const toggleMenu = () => {

  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<template>
  <div class="app-layout">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <div class="mobile-logo">eMemo</div>
      <button @click="toggleMenu" class="menu-btn">
        <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </header>

    <!-- Mobile Overlay -->
    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="toggleMenu"></div>

    <!-- Sidebar Wrapper -->
    <div :class="['sidebar-wrapper', isMobileMenuOpen ? 'open' : '']">
      <Sidebar />
    </div>
    
    <main class="main-content">
      <div class="header">
        <div class="header-titles">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageDescription }}</p>
        </div>
        <button class="btn-primary create-btn" @click="triggerCreateModal">
          <Plus class="icon-small" /> New Request
        </button>
      </div>
      
      <div class="tabs-container">
        <button 
          :class="['tab-btn', { active: activeTab === 'all' }]"
          @click="activeTab = 'all'"
        >
          All Memos
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'my_memos' }]"
          @click="activeTab = 'my_memos'"
        >
          My Memos
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'pending_approval' }]"
          @click="activeTab = 'pending_approval'"
        >
          Pending Approval
          <span v-if="pendingCount > 0" class="tab-badge">{{ pendingCount }}</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'drafts' }]"
          @click="activeTab = 'drafts'"
        >
          Drafts
        </button>
      </div>

      <MemoFilter 
        :members="[{ name: currentUser, role: 'you' }, ...subordinates]" 
        :activeTab="activeTab"
        @filter-change="handleFilterChange" 
      />

      <div class="list-wrapper">
        <MemoList ref="memoListRef" :memos="filteredMemos" :activeTab="activeTab" :currentUser="currentUser" />
      </div>
    </main>
  </div>
</template>

<style>
.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* Sidebar styling controlled by App layout now */
.sidebar-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  max-width: 100%;
}

.header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-titles h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.header-titles p {
  color: #64748b;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: #3b82f6;
  border: none;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.create-btn:hover {
  background-color: #2563eb;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.tabs-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

/* Hide scrollbar for tabs container Chrome/Safari */
.tabs-container::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #0f172a;
}

.tab-btn.active {
  color: #0f172a;
  border-bottom-color: #3b82f6;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  margin-left: 0.5rem;
  vertical-align: middle;
}

.list-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* Mobile Header (Hidden on Desktop) */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 50;
}

.mobile-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.menu-btn {
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 90;
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
  
  .sidebar-wrapper {
    transform: translateX(-100%);
  }
  
  .sidebar-wrapper.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 5rem; /* Space for fixed mobile header */
  }

  .header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-titles h1 {
    font-size: 1.5rem;
  }
  
  .tabs-container {
    gap: 0.5rem;
  }

  .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem;
  }
}
</style>
