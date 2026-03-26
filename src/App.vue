<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import MemoFilter from './components/MemoFilter.vue';
import MemoList from './components/MemoList.vue';
import MemoSummary from './components/MemoSummary.vue';
import { mockMemos } from './data/mockData';
import { Menu, X, Plus } from 'lucide-vue-next';

const memoListRef = ref(null);
const memos = ref([...mockMemos]);
const isMobileMenuOpen = ref(false);
const activeTab = ref('all');
const activeView = ref('summary'); // New view state

// Mock user for "Pending Approval" logic
// Mock user for hierarchy
const currentUser = 'Willy';
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
  if (activeView.value === 'summary') return 'Memo Summary';
  if (activeTab.value === 'my_memos') return 'My Memos';
  if (activeTab.value === 'pending_approval') return 'Pending Approval';
  return 'All Memos';
});

const pageDescription = computed(() => {
  if (activeView.value === 'summary') return 'High-level overview of memorandum activities and statistics.';
  if (activeTab.value === 'my_memos') return 'Memos created by you, including drafts.';
  if (activeTab.value === 'pending_approval') return 'Memos waiting for your approval.';
  return 'A simple overview of all memorandums in the system.';
});

const pendingCount = computed(() => {
  return memos.value.filter(m => {
    return m.status !== 'Approved' && m.approvalChain.some(tier =>
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
      return m.status !== 'Approved' && m.approvalChain.some(tier =>
        tier.approvers.some(a => a.name === currentUser && a.status === 'Pending')
      );
    });
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

const isSidebarCollapsed = ref(false);

const isMobile = ref(window.innerWidth <= 768);

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

const handleSidebarCollapse = (collapsed) => {
  isSidebarCollapsed.value = collapsed;
};

onMounted(() => window.addEventListener('resize', handleResize));
onUnmounted(() => window.removeEventListener('resize', handleResize));
</script>

<template>
  <div class="app-layout">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <div class="mobile-logo" @click="activeView = 'summary'" style="cursor: pointer;">eMemo</div>
      <button @click="toggleMenu" class="menu-btn">
        <Menu v-if="!isMobileMenuOpen" class="icon-small" />
        <X v-else class="icon-small" />
      </button>
    </header>

    <!-- Sidebar -->
    <div :class="['sidebar-wrapper', { 'mobile-open': isMobileMenuOpen }]">
      <Sidebar 
        :is-mobile="isMobile" 
        :active-view="activeView"
        @collapse="handleSidebarCollapse" 
        @close="isMobileMenuOpen = false" 
        @change-view="activeView = $event"
      />
    </div>

    <!-- Main Content -->
    <main class="main-content" :style="{ marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '260px') }">
      <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="toggleMenu"></div>

      <header class="sticky-page-header">
        <div v-if="activeView === 'list'" class="tabs-nav">
          <button v-for="tab in ['all', 'my_memos', 'pending_approval']" :key="tab"
            :class="['tab-btn', { active: activeTab === tab }]" @click="activeTab = tab">
            {{ tab === 'pending_approval' ? 'Pending Approval' : (tab === 'my_memos' ? 'My Memos' : 'All Memos') }}
            <span v-if="tab === 'pending_approval' && pendingCount > 0" class="tab-badge">{{ pendingCount }}</span>
          </button>
        </div>

        <div class="header-main-row">
          <div class="header-titles">
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageDescription }}</p>
          </div>
          <button v-if="activeView === 'list'" class="create-btn" @click="triggerCreateModal">
            <Plus class="icon-small" />
            <span>New Request</span>
          </button>
        </div>

        <div v-if="activeView === 'list'" class="header-filter-wrapper">
          <MemoFilter :members="[{ name: currentUser, role: 'you' }, ...subordinates]" :activeTab="activeTab"
            @filter-change="handleFilterChange" />
        </div>
      </header>

      <div class="list-wrapper">
        <template v-if="activeView === 'summary'">
          <MemoSummary 
            :memos="memos" 
            :members="subordinates" 
            :currentUser="currentUser" 
            @view-list="activeView = 'list'; activeTab = 'all'" 
            @view-pending="activeView = 'list'; activeTab = 'pending_approval'"
            @view-my-pending="activeView = 'list'; activeTab = 'my_memos'; filterState.statuses = ['Pending']"
          />
        </template>
        <template v-else-if="activeView === 'list'">
          <MemoList ref="memoListRef" :memos="filteredMemos" :activeTab="activeTab" :currentUser="currentUser" />
        </template>
        <template v-else>
          <div class="placeholder-view">
            <h3>{{ activeView.charAt(0).toUpperCase() + activeView.slice(1) }} view coming soon...</h3>
          </div>
        </template>
      </div>

      <footer class="app-footer">
        <p>Designed by Willy</p>
      </footer>
    </main>
  </div>
</template>

<style>
.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
  background-color: var(--bg-app);
  overflow-x: hidden;
  width: 100%;
}

.sidebar-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1020; /* Higher than mobile header */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content {
  flex: 1;
  min-width: 0;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  width: 100%;
}

.content-header {
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-titles h1 {
  font-size: 1.875rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.025em;
  margin-bottom: 0.25rem;
}

.header-titles p {
  color: var(--text-muted);
  font-size: 1rem;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1.5rem;
  background-color: #3b82f6;
  border: none;
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.create-btn:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
}

.create-btn:active {
  transform: translateY(0);
}

.create-btn span {
  display: inline-block;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.sticky-page-header {
  background-color: var(--bg-app);
  z-index: 110; /* Increased to stay above list items and cards */
  padding-bottom: 0px;
  margin-bottom: 1rem;
}

.header-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem var(--gutter) 1rem;
}

.tabs-nav {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.75rem calc(var(--gutter) - 1.25rem) 0; /* Offset by tab-btn padding to align text */
  border-bottom: 1px solid #f1f5f9;
}

.header-filter-wrapper {
  padding: 1.5rem var(--gutter);
  position: sticky;
  top: 0;
  background-color: var(--bg-app);
  z-index: 120;
  border-bottom: 1px solid #e2e8f0;
  overflow: visible;
}

/* Deep override for MemoFilter when inside sticky header */
.header-filter-wrapper .filter-wrapper {
  margin-bottom: 0;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
  background: transparent;
  box-shadow: none;
}

/* Hide scrollbar for tabs container Chrome/Safari */
.tabs-nav::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.tab-btn:hover {
  color: var(--text-main);
}

.tab-btn.active {
  color: #3b82f6;
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
  margin-top: 0.5rem;
  padding: 0 var(--gutter);
}

/* Mobile styles */
@media (max-width: 768px) {
  .sidebar-wrapper {
    transform: translateX(-100%);
  }

  .sidebar-wrapper.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0 !important;
    padding-top: 64px;
    /* Exactly match mobile-header height */
  }

  .content-header {
    margin-bottom: 1.5rem;
  }

  .header-titles h1 {
    font-size: 1.5rem;
  }

  .header-titles p {
    font-size: 0.875rem;
  }

  .mobile-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--gutter);
    border-bottom: 1px solid #e2e8f0;
    z-index: 1000; /* Ensure it stays above dashboard sections */
  }

  .mobile-logo {
    font-weight: 800;
    font-size: 1.25rem;
    color: #3b82f6;
  }

  .menu-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-main);
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
    z-index: 1010; /* Above mobile header but below sidebar */
  }

  .create-btn span {
    display: none;
  }

  .create-btn {
    padding: 0.75rem;
    border-radius: 50%;
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 80;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  }

  .sticky-page-header {
    margin-bottom: 1rem;
    background-color: white;
    padding: 0;
    overflow: visible; /* Crucial: allow dropdowns to show */
  }

  .header-filter-wrapper {
    position: sticky;
    top: 115px;
    background-color: white;
    padding: 0.5rem var(--gutter);
    z-index: 100;
    border-bottom: 1px solid #f1f5f9;
  }

  .header-main-row {
    position: static;
    background-color: white;
    padding: 0.5rem var(--gutter);
    margin-bottom: 0;
    border-bottom: none;
  }

  .tabs-nav {
    position: sticky;
    top: 8px;
    background-color: white;
    z-index: 75;
    padding: 0.5rem var(--gutter) 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .header-titles h1 {
    font-size: 1.25rem;
    margin-bottom: 0;
  }

  .header-titles p {
    display: none;
    /* Hide description on mobile when sticky to save space */
  }
}

.app-footer {
  margin-top: 3rem;
  padding: 2rem var(--gutter);
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.app-footer p {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .app-footer {
    padding-bottom: 6rem;
    /* Space for fab button */
  }
}
</style>
