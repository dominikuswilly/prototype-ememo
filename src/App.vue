<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import Sidebar from './components/Sidebar.vue';
import MemoFilter from './modules/ememo/MemoFilter.vue';
import MemoList from './modules/ememo/MemoList.vue';
import MemoSummary from './modules/ememo/MemoSummary.vue';
import Presentations from './modules/presentations/Presentations.vue';
import { mockMemos } from './data/mockData';
import { Menu, X, Plus } from 'lucide-vue-next';

const memoListRef = ref(null);
const memos = ref([...mockMemos]);
const isMobileMenuOpen = ref(false);
const activeTab = ref('all');
const activeView = ref('dashboard'); // New view state

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
  if (activeView.value === 'ememo-summary') return 'Memo Summary';
  if (activeView.value === 'ememo-list') {
    if (activeTab.value === 'my_memos') return 'My Memos';
    if (activeTab.value === 'pending_approval') return 'Needs My Approval';
    return 'All Memos';
  }
  if (activeView.value === 'presentations') return 'Presentations';
  return activeView.value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
});

const pageDescription = computed(() => {
  if (activeView.value === 'ememo-summary') return 'High-level overview of memorandum activities and statistics.';
  if (activeView.value === 'ememo-list') {
    if (activeTab.value === 'my_memos') return 'Memos created by you, including drafts.';
    if (activeTab.value === 'pending_approval') return 'Memos waiting for your approval.';
    return 'A simple overview of all memorandums in the system.';
  }
  if (activeView.value === 'presentations') return 'Manage and view company presentations and resources.';
  return `Management and overview for ${activeView.value.replace('-', ' ')}.`;
});

const pendingCount = computed(() => {
  return memos.value.filter(m => {
    return (m.status === 'In Review' || m.status === 'Pending') && m.approvalChain.some(tier =>
      tier.approvers.some(a => a.name === currentUser && (a.status === 'In Review' || a.status === 'Pending'))
    );
  }).length;
});

const filteredMemos = computed(() => {
  let result = memos.value;

  if (activeTab.value === 'my_memos') {
    result = result.filter(m => m.requester === currentUser);
  } else if (activeTab.value === 'pending_approval') {
    result = result.filter(m => {
      return (m.status === 'In Review' || m.status === 'Pending') && m.approvalChain.some(tier =>
        tier.approvers.some(a => a.name === currentUser && (a.status === 'In Review' || a.status === 'Pending'))
      );
    });
  } else if (activeTab.value === 'all') {
    // Show self + subordinates (Drafts are only shown if they belong to the current user)
    const subordinateNames = subordinates.map(s => s.name);
    const hierarchy = [currentUser, ...subordinateNames];
    result = result.filter(m => hierarchy.includes(m.requester) && (m.status !== 'Draft' || m.requester === currentUser));
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

const triggerCreateModal = async () => {
  if (activeView.value === 'ememo-summary') {
    activeView.value = 'ememo-list';
    await nextTick();
  }
  if (memoListRef.value) {
    memoListRef.value.openCreateModal();
  }
};

const toggleMenu = () => {

  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const isSidebarCollapsed = ref(false);
const showWelcomeModal = ref(true);

const isMobile = ref(window.innerWidth <= 768);

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

const handleSidebarNav = ({ view, tab }) => {
  activeView.value = view;
  if (tab) {
    activeTab.value = tab;
  }
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
      <div class="mobile-logo" @click="activeView = 'ememo-summary'" style="cursor: pointer;">KBRU</div>
      <button @click="toggleMenu" class="menu-btn">
        <Menu v-if="!isMobileMenuOpen" class="icon-small" />
        <X v-else class="icon-small" />
      </button>
    </header>

    <!-- Sidebar -->
    <div :class="['sidebar-wrapper', { 'mobile-open': isMobileMenuOpen }]">
      <Sidebar :is-mobile="isMobile" :active-view="activeView" :active-tab="activeTab" :pending-count="pendingCount"
        @collapse="handleSidebarCollapse" @close="isMobileMenuOpen = false" @change-view="handleSidebarNav" />
    </div>

    <!-- Main Content -->
    <main class="main-content" :style="{ marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '260px') }">
      <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="toggleMenu"></div>

      <header class="sticky-page-header">
        <div class="header-main-row">
          <div class="header-titles">
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageDescription }}</p>
          </div>
          <button v-if="activeView === 'ememo-list'" class="create-btn" @click="triggerCreateModal">
            <Plus class="icon-small" />
            <span>New Request</span>
          </button>
        </div>

        <div v-if="activeView === 'ememo-list'" class="header-filter-wrapper">
          <MemoFilter :members="[{ name: currentUser, role: 'you' }, ...subordinates]" :activeTab="activeTab"
            @filter-change="handleFilterChange" />
        </div>
      </header>

      <div class="list-wrapper">
        <template v-if="activeView === 'ememo-summary'">
          <MemoSummary :memos="memos" :members="subordinates" :currentUser="currentUser"
            @view-list="activeView = 'ememo-list'; activeTab = 'all'"
            @view-pending="activeView = 'ememo-list'; activeTab = 'pending_approval'"
            @view-my-pending="activeView = 'ememo-list'; activeTab = 'all'; filterState.statuses = ['In Review']" />
        </template>
        <template v-else-if="activeView === 'ememo-list'">
          <MemoList ref="memoListRef" :memos="filteredMemos" :activeTab="activeTab" :currentUser="currentUser" />
        </template>
        <template v-else-if="activeView === 'presentations'">
          <Presentations />
        </template>
        <template v-else>
          <div class="placeholder-view">
            <h3>{{ activeView.charAt(0).toUpperCase() + activeView.slice(1) }} view coming soon...</h3>
          </div>
        </template>
      </div>

      <!-- Welcome Modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showWelcomeModal" class="welcome-overlay" @click.self="showWelcomeModal = false">
            <div class="welcome-modal">
              <div class="welcome-header">
                <div class="welcome-logo">KBRU</div>
                <div class="welcome-subtitle">Insurance Brokers</div>
              </div>
              <div class="welcome-body">
                <h3>Welcome to the SWERP Prototype</h3>
                <p>This application was designed and developed by <strong>Willy and Brosur</strong>.</p>
              </div>
              <div class="welcome-footer">
                <button class="welcome-btn" @click="showWelcomeModal = false">Enter Application</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
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
  z-index: 1020;
  /* Higher than mobile header */
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
  background-color: var(--brand-primary);
  border: none;
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
  box-shadow: 0 4px 6px -1px var(--brand-primary-light);
}

.create-btn:hover {
  background-color: var(--brand-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px var(--brand-primary-light);
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
  z-index: 110;
  /* Increased to stay above list items and cards */
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
  padding: 0.75rem calc(var(--gutter) - 1.25rem) 0;
  /* Offset by tab-btn padding to align text */
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
    z-index: 1000;
    /* Ensure it stays above dashboard sections */
  }

  .mobile-logo {
    font-weight: 800;
    font-size: 1.25rem;
    color: var(--brand-primary);
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
    z-index: 1010;
    /* Above mobile header but below sidebar */
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
    overflow: visible;
    /* Crucial: allow dropdowns to show */
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

/* Welcome Modal Styles */
.welcome-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1.5rem;
}

.welcome-modal {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalScaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(225, 29, 46, 0.1);
}

@keyframes modalScaleUp {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.welcome-header {
  margin-bottom: 2rem;
}

.welcome-header .welcome-logo {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--brand-primary);
  line-height: 1;
  letter-spacing: -0.02em;
}

.welcome-header .welcome-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 0.5rem;
}

.welcome-body h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 1rem;
}

.welcome-body p {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.welcome-btn {
  width: 100%;
  padding: 1rem;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px var(--brand-primary-light);
}

.welcome-btn:hover {
  background: var(--brand-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 15px 20px -5px var(--brand-primary-light);
}

.welcome-btn:active {
  transform: translateY(0);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
