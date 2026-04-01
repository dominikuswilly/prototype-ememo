<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  Search, Filter, Plus, FileText, Layout, 
  MoreVertical, Download, Eye, Clock, User,
  CheckCircle, AlertCircle, Trash2, X, UploadCloud,
  Monitor, Briefcase, Globe, TrendingUp, Cpu,
  Settings, Users, Gift, ShieldCheck, CreditCard, Scale, ShieldAlert, BarChart3, Wrench, Heart,
  LayoutGrid, List, ChevronDown, ChevronLeft, ChevronRight, FileDigit, FileVideo, FileImage, MoreHorizontal,
  Edit2, FolderInput, Copy, Share2, Lock, Link, Info, History, Archive
} from 'lucide-vue-next';
import PresentationContent from './components/PresentationContent.vue';

const categories = [
  { id: 'all', label: 'All Categories', icon: Layout },
  { id: 'MARKETING', label: 'Marketing', icon: Globe },
  { id: 'HRD_GA', label: 'HRD & GA', icon: Users },
  { id: 'TEKNIK', label: 'Teknik', icon: Wrench },
  { id: 'EMPLOYEE_BENEFIT', label: 'Employee Benefit', icon: Heart },
  { id: 'CLAIM', label: 'Claim', icon: ShieldCheck },
  { id: 'IT', label: 'IT', icon: Cpu },
  { id: 'ACCOUNTING_FINANCE', label: 'Accounting & Finance', icon: CreditCard },
  { id: 'MANAJEMEN', label: 'Manajemen', icon: BarChart3 },
  { id: 'LEGAL', label: 'Legal', icon: Scale },
  { id: 'RISK_MANAGEMENT', label: 'Risk Management', icon: ShieldAlert }
];

const selectedCategories = ref([]);
const searchQuery = ref('');
const isUploadModalOpen = ref(false);
const searchInput = ref(null);
const categoryScrollRef = ref(null);
const isPageLoading = ref(true);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// Platform & Responsive State
const isMobileScreen = ref(false);
const isScrolled = ref(false);
const checkMobile = () => {
  isMobileScreen.value = window.innerWidth <= 1024;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// Administrative UI State
const viewMode = ref('grid'); // 'grid' | 'list'
const sortBy = ref('date_desc'); // 'date_desc', 'title_asc'
const selectedFiles = ref([]);
const activeMenuId = ref(null); // ID of file with open dropdown
const activeFile = ref(null); // File currently being managed in a modal

// Modal States
const isRenameModalOpen = ref(false);
const isShareModalOpen = ref(false);
const isPropertiesModalOpen = ref(false);
const isMoveModalOpen = ref(false);
const isSelectMode = ref(false);
const toast = ref({ show: false, message: '', type: 'success' });

// Enhanced Data
const mockPresentations = ref([
  { id: 1, title: 'Quarterly Security Audit', category: 'IT', author: 'Elliot Alderson', date: '2026-03-15', size: '4.2 MB', fileType: 'PDF', views: 1240, status: 'Published', version: 'v1.4', description: 'Comprehensive security assessment for Q1.', lastModified: '2026-03-18' },
  { id: 2, title: 'Financial Projection 2026', category: 'ACCOUNTING_FINANCE', author: 'Angela Moss', date: '2026-03-20', size: '2.8 MB', fileType: 'PPTX', views: 850, status: 'Private', version: 'v2.1', description: 'Internal financial forecast and budget allocations.', lastModified: '2026-03-21' },
  { id: 3, title: 'Global Brand Strategy', category: 'MARKETING', author: 'Phillip Price', date: '2026-03-22', size: '12.5 MB', fileType: 'PDF', views: 2100, status: 'Published', version: 'v1.0', description: 'New visual identity and global marketing roadmap.', lastModified: '2026-03-22' },
  { id: 4, title: 'Sales Performance Q1', category: 'MANAJEMEN', author: 'Susan Jacobs', date: '2026-03-25', size: '5.1 MB', fileType: 'PPTX', views: 560, status: 'Published', version: 'v0.9', description: 'Preliminary sales figures for the first quarter.', lastModified: '2026-03-25' },
  { id: 5, title: 'Employee Benefits Policy', category: 'HRD_GA', author: 'Gideon Goddard', date: '2026-03-28', size: '3.4 MB', fileType: 'PDF', views: 920, status: 'Published', version: 'v3.2', description: 'Updated policy for 2026 employee benefits.', lastModified: '2026-03-29' },
  { id: 6, title: 'Product Roadmap V2', category: 'TEKNIK', author: 'Willy', date: '2026-03-30', size: '8.9 MB', fileType: 'PPTX', views: 1560, status: 'Draft', version: 'v0.1', description: 'Technical roadmap for upcoming product features.', lastModified: '2026-03-30' },
  { id: 7, title: 'Network Infrastructure Upgrade', category: 'IT', author: 'Elliot Alderson', date: '2026-03-31', size: '6.7 MB', fileType: 'MP4', views: 340, status: 'Published', version: 'v1.1', description: 'Video walk-through of the data center upgrade.', lastModified: '2026-03-31' },
  { id: 8, title: 'Market Expansion Plan', category: 'MARKETING', author: 'Phillip Price', date: '2026-04-01', size: '15.2 MB', fileType: 'PDF', views: 780, status: 'Published', version: 'v1.0', description: 'Strategy for entering new Southeast Asian markets.', lastModified: '2026-04-01' }
]);

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => toast.value.show = false, 3000);
};

const clearSearch = () => {
  searchQuery.value = '';
  searchInput.value?.focus();
};

const handleKeydown = (e) => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    searchInput.value?.focus();
  }
};

const checkScroll = () => {
  const el = categoryScrollRef.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 0;
  canScrollRight.value = el.scrollLeft < (el.scrollWidth - el.clientWidth - 5);
};

const scrollCategories = (direction) => {
  const el = categoryScrollRef.value;
  if (!el) return;
  const scrollAmount = 300;
  el.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  });
};

onMounted(() => {
  checkMobile();
  // Simulate data fetching
  setTimeout(() => {
    isPageLoading.value = false;
    setTimeout(checkScroll, 100);
  }, 1500);

  window.addEventListener('resize', () => {
    checkMobile();
    checkScroll();
  });
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.action-wrap-trigger') && !e.target.closest('.bottom-sheet-content')) {
      activeMenuId.value = null;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', null);
});

const toggleCategory = (id) => {
  if (id === 'all') {
    selectedCategories.value = [];
    return;
  }
  const index = selectedCategories.value.indexOf(id);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(id);
  }
};

const isSelected = (id) => {
  if (id === 'all') return selectedCategories.value.length === 0;
  return selectedCategories.value.includes(id);
};

// Selection Helpers
const selectAll = () => {
  selectedFiles.value = sortedFilteredPresentations.value.map(p => p.id);
  showToast(`Selected ${selectedFiles.value.length} items`);
};

const clearSelection = () => {
  selectedFiles.value = [];
};

// Administrative and Menu Actions
const openMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
  if (isMobileScreen.value && activeMenuId.value) {
    activeFile.value = mockPresentations.value.find(p => p.id === id);
    // Prevent scrolling when bottom sheet is open
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMenu = () => {
  activeMenuId.value = null;
  document.body.style.overflow = '';
};

const executeAction = (action, file) => {
  activeFile.value = { ...file }; // Clone for modal
  closeMenu();

  switch (action) {
    case 'rename': isRenameModalOpen.value = true; break;
    case 'share': isShareModalOpen.value = true; break;
    case 'properties': isPropertiesModalOpen.value = true; break;
    case 'move': isMoveModalOpen.value = true; break;
    case 'copy-link': 
      showToast('Share link copied to clipboard!'); 
      break;
    case 'duplicate': 
      const copy = { ...file, id: Date.now(), title: file.title + ' (Copy)' };
      mockPresentations.value.unshift(copy);
      showToast('File duplicated successfully');
      break;
    case 'archive':
      const target = mockPresentations.value.find(p => p.id === file.id);
      if (target) target.status = 'Archived';
      showToast('File moved to archive');
      break;
    case 'delete':
      if (confirm('Are you sure you want to delete this file?')) {
        mockPresentations.value = mockPresentations.value.filter(p => p.id !== file.id);
        showToast('File deleted permanently', 'error');
      }
      break;
  }
};

const bulkDelete = () => {
  if (confirm(`Delete ${selectedFiles.value.length} selected files?`)) {
    mockPresentations.value = mockPresentations.value.filter(p => !selectedFiles.value.includes(p.id));
    selectedFiles.value = [];
    showToast('Batch deletion successful', 'error');
  }
};

const bulkArchive = () => {
  mockPresentations.value.forEach(p => {
    if (selectedFiles.value.includes(p.id)) p.status = 'Archived';
  });
  selectedFiles.value = [];
  showToast('Batch move to archive successful');
};

const saveRename = () => {
  const index = mockPresentations.value.findIndex(p => p.id === activeFile.value.id);
  if (index !== -1) {
    mockPresentations.value[index].title = activeFile.value.title;
    showToast('File renamed');
  }
  isRenameModalOpen.value = false;
};

const saveMove = (catId) => {
  const index = mockPresentations.value.findIndex(p => p.id === activeFile.value.id);
  if (index !== -1) {
    mockPresentations.value[index].category = catId;
    showToast(`File moved to ${formatTagName(catId)}`);
  }
  isMoveModalOpen.value = false;
};

// Category counts should account for status if needed, but keeping simple for now
const categoryCounts = computed(() => {
  const counts = { all: mockPresentations.value.length };
  mockPresentations.value.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });
  return counts;
});

const sortedFilteredPresentations = computed(() => {
  let filtered = mockPresentations.value.filter(p => {
    // Hide archived from main view unless explicitly in archive (future)
    if (p.status === 'Archived') return false; 
    
    const matchesCategory = selectedCategories.value.length === 0 || selectedCategories.value.includes(p.category);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         p.author.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return filtered.sort((a, b) => {
    if (sortBy.value === 'date_desc') return new Date(b.date) - new Date(a.date);
    if (sortBy.value === 'date_asc') return new Date(a.date) - new Date(b.date);
    if (sortBy.value === 'title_asc') return a.title.localeCompare(b.title);
    return 0;
  });
});

const getFileIcon = (type) => {
  if (type === 'MP4') return FileVideo;
  if (type === 'PPTX') return FileImage;
  return FileText;
};

const toggleFileSelection = (id) => {
  const index = selectedFiles.value.indexOf(id);
  if (index > -1) selectedFiles.value.splice(index, 1);
  else selectedFiles.value.push(id);
};

const isFileSelected = (id) => selectedFiles.value.includes(id);

const formatTagName = (id) => {
  return id.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const handleUpload = () => {
  alert('Upload feature simulated. File added to the list.');
  mockPresentations.value.unshift({
    id: Date.now(),
    title: 'New Presentation ' + (mockPresentations.value.length + 1),
    category: selectedCategories.value.length === 0 ? 'IT' : selectedCategories.value[0],
    author: 'Willy',
    date: new Date().toISOString().split('T')[0],
    size: '1.5 MB',
    fileType: 'PDF',
    views: 0,
    status: 'Published',
    version: 'v1.0',
    description: 'Newly uploaded file.',
    lastModified: new Date().toISOString().split('T')[0]
  });
  isUploadModalOpen.value = false;
};
</script>

<template>
  <div class="presentations-page">
    <!-- Breadcrumbs -->
    <nav class="breadcrumb-nav">
      <span class="breadcrumb-item">Dashboard</span>
      <ChevronRight class="breadcrumb-icon" />
      <span class="breadcrumb-item active">Presentations</span>
    </nav>

    <!-- Page Title & Toolbar -->
    <header :class="['page-header', { scrolled: isScrolled }]">
      <div class="title-section">
        <h1 class="page-title">Presentations</h1>
        <p class="page-subtitle">{{ sortedFilteredPresentations.length }} items available</p>
      </div>

      <div class="toolbar-section main-toolbar">
        <!-- Persistent Search for Desktop -->
        <div v-if="!isMobileScreen" class="search-wrap desktop-search">
          <div class="search-box">
            <Search class="search-icon" />
            <input ref="searchInput" v-model="searchQuery" type="text" placeholder="Search presentations... ( / )" />
            <div class="search-actions">
              <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
                <X class="icon-tiny" />
              </button>
            </div>
          </div>
        </div>

        <div class="divider" v-if="!isMobileScreen"></div>

        <div class="sort-dropdown-wrap">
          <select v-model="sortBy" class="toolbar-select">
            <option value="date_desc">Latest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="title_asc">Title A-Z</option>
          </select>
          <ChevronDown class="select-icon" />
        </div>

        <div class="divider" v-if="!isMobileScreen"></div>

        <div class="view-toggles" v-if="!isMobileScreen">
          <button :class="['toolbar-btn', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'" title="Grid">
            <LayoutGrid class="icon-small" />
          </button>
          <button :class="['toolbar-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'" title="List">
            <List class="icon-small" />
          </button>
        </div>

        <div class="mobile-only" v-if="isMobileScreen">
          <button @click="isSelectMode = !isSelectMode" :class="['toolbar-btn text-btn', { active: isSelectMode }]">
            {{ isSelectMode ? 'Cancel' : 'Select' }}
          </button>
        </div>

        <button v-if="!isMobileScreen" class="btn-primary upload-btn" @click="isUploadModalOpen = true">
          <Plus class="icon-small" />
          <span>Upload</span>
        </button>
      </div>
    </header>

    <!-- Search (Mobile Only - Persistent in header) -->
    <div v-if="isMobileScreen" class="mobile-search-bar" :class="{ scrolled: isScrolled }">
      <div class="search-box">
        <Search class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Search..." />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch"><X class="icon-tiny" /></button>
      </div>
    </div>

    <!-- Category Filter Bar (Universal) -->
    <div class="filter-navigation-bar" :class="{ 'with-arrows': !isMobileScreen }">
      <button v-if="!isMobileScreen && canScrollLeft" class="scroll-arrow left" @click="scrollCategories('left')">
        <ChevronLeft class="icon-small" />
      </button>
      
      <div class="horizontal-categories-wrap" ref="categoryScrollRef" @scroll="checkScroll">
        <button v-for="cat in categories" :key="cat.id" 
          :class="['cat-pill', { active: isSelected(cat.id) }]"
          @click="toggleCategory(cat.id)">
          <component :is="cat.icon" class="pill-icon" />
          <span class="pill-label">{{ cat.label }}</span>
          <span v-if="categoryCounts[cat.id]" class="pill-count">{{ categoryCounts[cat.id] }}</span>
        </button>
      </div>

      <button v-if="!isMobileScreen && canScrollRight" class="scroll-arrow right" @click="scrollCategories('right')">
        <ChevronRight class="icon-small" />
      </button>
    </div>

    <!-- Main Content Area -->
    <div class="main-content-full">
      <!-- Presentations Content (Extracted to Sub-component) -->
      <PresentationContent 
        :items="sortedFilteredPresentations"
        :view-mode="viewMode"
        :selected-ids="selectedFiles"
        :active-menu-id="activeMenuId"
        :is-mobile="isMobileScreen"
        :is-select-mode="isSelectMode"
        :is-loading="isPageLoading"
        @toggle-selection="toggleFileSelection"
        @open-menu="openMenu"
        @execute-action="executeAction"
        @select-all="selectAll"
        @clear-selection="clearSelection"
        @clear-filters="selectedCategories = []; searchQuery = ''"
      />
    </div>

    <!-- Administrative Modals -->
    <!-- Rename Modal -->
    <div v-if="isRenameModalOpen" class="modal-overlay" @click.self="isRenameModalOpen = false">
      <div class="modal-content sm">
        <div class="modal-header">
          <h3>Rename File</h3>
          <button class="btn-close" @click="isRenameModalOpen = false"><X class="icon" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>New Name</label>
            <input v-model="activeFile.title" type="text" class="custom-input" @keyup.enter="saveRename" />
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="isRenameModalOpen = false">Cancel</button>
            <button class="btn-primary" @click="saveRename">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="isShareModalOpen" class="modal-overlay" @click.self="isShareModalOpen = false">
      <div class="modal-content md">
        <div class="modal-header">
          <h3>Share "{{ activeFile.title }}"</h3>
          <button class="btn-close" @click="isShareModalOpen = false"><X class="icon" /></button>
        </div>
        <div class="modal-body">
          <div class="share-input-wrap">
            <input type="text" placeholder="Add people, groups, or email addresses..." class="custom-input" />
            <button class="btn-primary">Invite</button>
          </div>
          <div class="share-access-levels">
            <h4>People with access</h4>
            <div class="access-item">
              <div class="user-avatar">W</div>
              <div class="user-info">
                <p>Willy (You)</p>
                <span>Owner</span>
              </div>
            </div>
            <div class="access-item">
              <div class="user-avatar guest">G</div>
              <div class="user-info">
                <p>General Management</p>
                <span>Can view</span>
              </div>
            </div>
          </div>
          <div class="modal-footer-actions">
            <button class="btn-text" @click="executeAction('copy-link', activeFile)">
              <Link class="icon-small" /> Copy share link
            </button>
            <button class="btn-secondary" @click="isShareModalOpen = false">Done</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Move Modal -->
    <div v-if="isMoveModalOpen" class="modal-overlay" @click.self="isMoveModalOpen = false">
      <div class="modal-content sm">
        <div class="modal-header">
          <h3>Move to Category</h3>
          <button class="btn-close" @click="isMoveModalOpen = false"><X class="icon" /></button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Select a new department for this file.</p>
          <div class="move-options custom-scrollbar">
            <button 
              v-for="cat in categories.filter(c => c.id !== 'all')" 
              :key="cat.id" 
              class="move-option"
              @click="saveMove(cat.id)"
            >
              <component :is="cat.icon" class="icon-small" />
              <span>{{ cat.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Properties Modal -->
    <div v-if="isPropertiesModalOpen" class="modal-overlay" @click.self="isPropertiesModalOpen = false">
      <div class="modal-content md">
        <div class="modal-header">
          <h3>File Properties</h3>
          <button class="btn-close" @click="isPropertiesModalOpen = false"><X class="icon" /></button>
        </div>
        <div class="modal-body no-padding">
          <div class="properties-tabs">
            <button class="active">General</button>
            <button>Activity</button>
          </div>
          <div class="properties-content">
            <div class="prop-hero">
              <div :class="['file-icon-box lg', activeFile.fileType.toLowerCase()]">
                <component :is="getFileIcon(activeFile.fileType)" class="file-icon" />
              </div>
              <div class="hero-info">
                <h4>{{ activeFile.title }}</h4>
                <p>{{ formatTagName(activeFile.category) }} • {{ activeFile.fileType }}</p>
              </div>
            </div>
            <div class="prop-grid">
              <div class="prop-item">
                <label>Status</label>
                <div class="status-badge" :class="activeFile.status.toLowerCase()">{{ activeFile.status }}</div>
              </div>
              <div class="prop-item">
                <label>Version</label>
                <span>{{ activeFile.version }}</span>
              </div>
              <div class="prop-item">
                <label>Size</label>
                <span>{{ activeFile.size }}</span>
              </div>
              <div class="prop-item">
                <label>Modified</label>
                <span>{{ activeFile.lastModified }}</span>
              </div>
            </div>
            <div class="prop-description">
              <label>Description</label>
              <p>{{ activeFile.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="isUploadModalOpen" class="modal-overlay" @click.self="isUploadModalOpen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Upload Presentation</h3>
          <button class="btn-close" @click="isUploadModalOpen = false">
            <X class="icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="upload-dropzone">
            <UploadCloud class="upload-icon" />
            <h4>Drop files here or click to upload</h4>
            <p>Maximum file size: 50MB (PDF, PPTX, MP4)</p>
            <input type="file" class="hidden-input" id="fileUpload" @change="handleUpload" />
            <label for="fileUpload" class="btn-upload-trigger">Select File</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Bottom Action Sheet -->
    <Transition name="sheet">
      <div v-if="isMobileScreen && activeMenuId" class="bottom-sheet-overlay" @click="closeMenu">
        <div class="bottom-sheet-content" @click.stop>
          <div class="sheet-handle"></div>
          <div class="sheet-header" v-if="activeFile">
            <div :class="['file-icon-box sm', activeFile.fileType.toLowerCase()]">
              <component :is="getFileIcon(activeFile.fileType)" class="file-icon sm" />
            </div>
            <div class="sheet-file-info">
              <h4>{{ activeFile.title }}</h4>
              <p>{{ activeFile.size }} • {{ formatTagName(activeFile.category) }}</p>
            </div>
          </div>
          
          <div class="sheet-actions" v-if="activeFile">
            <div class="action-group-grid">
              <button @click="executeAction('rename', activeFile)">
                <Edit2 class="icon-small" />
                <span>Rename</span>
              </button>
              <button @click="executeAction('share', activeFile)">
                <Share2 class="icon-small" />
                <span>Share</span>
              </button>
              <button @click="executeAction('move', activeFile)">
                <FolderInput class="icon-small" />
                <span>Move</span>
              </button>
              <button @click="executeAction('properties', activeFile)">
                <Info class="icon-small" />
                <span>Details</span>
              </button>
              <button @click="executeAction('duplicate', activeFile)">
                <Copy class="icon-small" />
                <span>Duplicate</span>
              </button>
              <button @click="executeAction('archive', activeFile)">
                <Archive class="icon-small" />
                <span>Archive</span>
              </button>
              <button class="danger" @click="executeAction('delete', activeFile)">
                <Trash2 class="icon-small" />
                <span>Delete</span>
              </button>
            </div>
          </div>
          <button class="btn-cancel-sheet" @click="closeMenu">Close</button>
        </div>
      </div>
    </Transition>

    <!-- Desktop Bulk Actions Toolbar -->
    <Transition name="toolbar">
      <div v-if="!isMobileScreen && selectedFiles.length > 0" class="bulk-toolbar">
        <div class="selection-count">
          <div class="count-pill">{{ selectedFiles.length }}</div>
          <span>items selected</span>
        </div>
        <div class="toolbar-actions">
          <button @click="bulkArchive" class="toolbar-action-btn">
            <Archive class="icon-small" />
            <span>Archive</span>
          </button>
          <button @click="bulkDelete" class="toolbar-action-btn danger">
            <Trash2 class="icon-small" />
            <span>Delete</span>
          </button>
          <div class="divider"></div>
          <button @click="clearSelection" class="btn-text-only">Clear Selection</button>
        </div>
      </div>
    </Transition>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <CheckCircle v-if="toast.type === 'success'" class="icon-small" />
        <AlertCircle v-else class="icon-small" />
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- Mobile Floating Action Button (FAB) -->
    <Transition name="fab">
      <button v-if="isMobileScreen" class="mobile-fab" @click="isUploadModalOpen = true" :class="{ 'fab-minified': isScrolled }">
        <Plus class="fab-icon" />
        <span class="fab-label" v-show="!isScrolled">Upload</span>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.presentations-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.4s ease-out;
  padding: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Breadcrumbs */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: -0.5rem;
}

.breadcrumb-icon {
  width: 14px;
  height: 14px;
}

.breadcrumb-item.active {
  color: #1e293b;
  font-weight: 600;
}

/* Header & Toolbar */
.page-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8fafc;
}

.main-toolbar {
  flex: 1;
  justify-content: flex-end;
}

.desktop-search {
  max-width: 400px;
  flex: 1;
  margin-right: auto;
}

.desktop-search .search-box input {
  padding: 0.6rem 2.5rem 0.6rem 2.5rem;
  font-size: 0.875rem;
  background: #f1f5f9;
  border-color: transparent;
}

.desktop-search .search-box input:focus {
  background: white;
  border-color: #3b82f6;
}

.desktop-search .search-icon {
  width: 16px;
  height: 16px;
  left: 0.85rem;
}

.upload-btn {
  padding: 0.6rem 1.25rem;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .page-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(248, 250, 252, 0.8);
    backdrop-filter: blur(8px);
    margin: -0.75rem -0.75rem 0.5rem; /* Match page padding */
    padding: 1.25rem 1rem 0.75rem;
    border-bottom: 1px solid transparent;
  }
  
  .page-header.scrolled {
    background: rgba(255, 255, 255, 0.9);
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .page-header.scrolled .page-subtitle {
     display: none;
  }
  
  .page-header.scrolled .page-title {
    font-size: 1.25rem;
  }
}

@media (min-width: 1025px) {
  .page-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Mobile Search Bar */
.mobile-search-bar {
  padding: 0.5rem 1rem 1rem;
  background: #f8fafc;
  width: 100%;
}

.mobile-search-bar.scrolled {
  position: sticky;
  top: 56px;
  z-index: 990;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #f1f5f9;
}

.mobile-search-bar .search-box input {
  padding: 0.65rem 2.5rem;
  font-size: 0.9rem;
  border-radius: 12px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.5rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.view-toggles {
  display: flex;
  gap: 0.25rem;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.toolbar-btn.active {
  background: #eff6ff;
  color: #3b82f6;
}

.divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}

.flex-gap-sm {
  display: flex;
  gap: 0.5rem;
}

.text-btn {
  padding: 0 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  width: auto;
  color: #3b82f6;
}

.text-btn.active {
  background: #3b82f6;
  color: white;
}

.sort-dropdown-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.toolbar-select {
  appearance: none;
  background: transparent;
  border: none;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  outline: none;
}

.select-icon {
  position: absolute;
  right: 0.5rem;
  width: 14px;
  height: 14px;
  color: #64748b;
  pointer-events: none;
}

/* Controls & Search */
.controls-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (max-width: 1024px) {
  .controls-container {
    position: sticky;
    top: 60px; /* Below sticky header */
    z-index: 990;
    background: rgba(248, 250, 252, 0.95);
    backdrop-filter: blur(8px);
    margin: 0 -0.75rem;
    padding: 0.5rem 0.75rem 0.75rem;
    border-bottom: 1px solid #f1f5f9;
    gap: 0.75rem;
  }
}

@media (min-width: 1025px) {
  .controls-container {
    flex-direction: row;
    align-items: center;
  }
}

.search-wrap {
  flex: 1;
  max-width: 800px;
}

.search-box {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
  z-index: 10;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 3.5rem 0.75rem 3rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  background: white;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 0.5rem;
}

/* Optimized Filter Bar */
.filter-navigation-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  padding: 0.5rem 0;
  margin: 0 -1rem;
  border-bottom: 1px solid #f1f5f9;
}

.filter-navigation-bar.scrolled {
  position: sticky;
  top: 106px; /* Adjust based on mobile header height */
  z-index: 980;
}

@media (min-width: 1025px) {
  .filter-navigation-bar {
    margin: 0;
    background: transparent;
    border: none;
    padding: 0;
  }
}

.horizontal-categories-wrap {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 1rem;
  scrollbar-width: none;
  scroll-behavior: smooth;
  flex: 1;
  mask-image: linear-gradient(to right, black 90%, transparent 100%);
}

.horizontal-categories-wrap::-webkit-scrollbar {
  display: none;
}

.scroll-arrow {
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  position: absolute;
}

.scroll-arrow:hover {
  background: #f8fafc;
  color: #3b82f6;
  border-color: #3b82f6;
}

.scroll-arrow.left { left: -0.5rem; }
.scroll-arrow.right { right: -0.5rem; }

.cat-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.cat-pill:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f0f7ff;
}

.cat-pill.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.25);
}

.pill-icon {
  width: 16px;
  height: 16px;
}

.pill-count {
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 800;
}

.cat-pill.active .pill-count {
  background: rgba(255, 255, 255, 0.2);
}

/* Main Content Layout */
.main-content-full {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
}

/* Category Filter Bar (Universal) */
.categories-filter-wrap {
  position: relative;
  overflow: hidden;
}

.horizontal-categories {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.horizontal-categories::-webkit-scrollbar {
  display: none;
}

.cat-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 99px;
  color: #64748b;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.cat-pill:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
}

.cat-pill.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.pill-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

.cat-pill.active .pill-icon {
  opacity: 1;
}

.pill-count {
  font-size: 0.7rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 99px;
  font-weight: 800;
  transition: all 0.3s;
}

.cat-pill.active .pill-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.cat-pill:hover .pill-count:not(.cat-pill.active *) {
  background: #eff6ff;
  color: #3b82f6;
}

/* Administrative Global Icons */
.icon-tiny {
  width: 14px;
  height: 14px;
}

.icon-small {
  width: 18px;
  height: 18px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Administrative Modals */
.modal-content.sm { max-width: 400px; }
.modal-content.md { max-width: 550px; }

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.5rem;
}

.custom-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.custom-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.share-input-wrap {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.share-access-levels h4 {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.access-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.user-avatar.guest {
  background: #f1f5f9;
  color: #64748b;
}

.user-info p {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.user-info span {
  font-size: 0.75rem;
  color: #64748b;
}

.modal-footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn-text {
  background: transparent;
  border: none;
  color: #3b82f6;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
}

/* Move Modal Styles */
.modal-desc {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.move-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.move-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid #f1f5f9;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.move-option:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

/* Properties Modal Styles */
.no-padding { padding: 0 !important; }

.properties-tabs {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 1.5rem;
}

.properties-tabs button {
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.properties-tabs button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.properties-content {
  padding: 1.5rem;
}

.prop-hero {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 16px;
}

.file-icon-box.lg {
  width: 64px;
  height: 64px;
}

.hero-info h4 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
}

.hero-info p {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.prop-item label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.prop-item span {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.status-badge {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-badge.published { background: #f0fdf4; color: #22c55e; }
.status-badge.private { background: #fff7ed; color: #f97316; }
.status-badge.draft { background: #f1f5f9; color: #64748b; }

.prop-description label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.prop-description p {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
}

/* Toast System */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
  z-index: 1000;
  font-weight: 600;
  font-size: 0.875rem;
}

.toast-notification.error {
  background: #ef4444;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

/* Mobile Bottom Sheet */
.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
}

.bottom-sheet-content {
  width: 100%;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 1.25rem;
  padding-bottom: env(safe-area-inset-bottom, 1.25rem);
  box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.1);
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 10px;
  margin: 0 auto 1.5rem;
}

.sheet-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.file-icon-box.sm { width: 44px; height: 44px; border-radius: 10px; }
.file-icon.sm { width: 22px; height: 22px; }

.sheet-file-info h4 {
  font-size: 1rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.sheet-file-info p {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.action-group-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.action-group-grid button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: 1px solid #f1f5f9;
  background: #f8fafc;
  border-radius: 16px;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.action-group-grid button:active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: scale(0.95);
}

.action-group-grid button.danger { color: #ef4444; }
.action-group-grid button.danger:active { background: #fef2f2; border-color: #ef4444; }

.btn-cancel-sheet {
  width: 100%;
  padding: 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 14px;
  font-weight: 800;
  color: #64748b;
  cursor: pointer;
}

/* Transitions for Sheet */
.sheet-enter-active, .sheet-leave-active {
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from, .sheet-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
.sheet-enter-active .bottom-sheet-content,
.sheet-leave-active .bottom-sheet-content {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

/* Desktop Bulk Actions Toolbar */
.bulk-toolbar {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(12px);
  padding: 0.75rem 1.5rem;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  z-index: 1500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.selection-count {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.count-pill {
  background: #3b82f6;
  color: white;
  padding: 2px 10px;
  border-radius: 99px;
  font-weight: 800;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toolbar-action-btn.danger { color: #fca5a5; }
.toolbar-action-btn.danger:hover { background: rgba(239, 68, 68, 0.2); }

.btn-text-only {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem;
}

.btn-text-only:hover { color: white; }

/* Transitions for Toolbar */
.toolbar-enter-active, .toolbar-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toolbar-enter-from, .toolbar-leave-to {
  opacity: 0;
  transform: translate(-50%, 50px) scale(0.9);
}

/* Horizontal Scroll Indicators */
.categories-filter-wrap::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 30px;
  background: linear-gradient(to right, rgba(248, 250, 252, 1), transparent);
  z-index: 2;
  pointer-events: none;
}

.categories-filter-wrap::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to left, rgba(248, 250, 252, 1), transparent);
  z-index: 2;
  pointer-events: none;
}

/* Final CSS Adjustments */
@media (max-width: 1024px) {
  .page-title { font-size: 1.5rem; }
  .presentations-page { padding: 0.75rem; }
  
  /* Modal optimization for mobile */
  .modal-overlay {
    align-items: flex-end;
  }
  
  .modal-content {
    width: 100% !important;
    max-width: none !important;
    border-radius: 20px 20px 0 0;
    margin: 0;
    animation: modalSlideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }
}

@keyframes modalSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}/* Mobile FAB Styling */
.mobile-fab {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  font-weight: 700;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-fab:active {
  transform: scale(0.92);
  background: #2563eb;
}

.fab-icon {
  width: 24px;
  height: 24px;
}

.fab-label {
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
}

.mobile-fab.fab-minified {
  padding: 1rem;
  gap: 0;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

/* Transitions for FAB */
.fab-enter-active, .fab-leave-active {
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.fab-enter-from, .fab-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(50px);
}

/* Native-style list rows for mobile */
@media (max-width: 1024px) {
  .presentation-row {
    grid-template-columns: 48px 1fr auto;
    padding: 1.25rem 1rem;
    gap: 1rem;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .row-file-icon {
    width: 24px;
    height: 24px;
  }
  
  .row-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .presentation-row::after {
    /* Add subtler info below the title in list view */
    content: attr(data-meta);
    font-size: 0.75rem;
    color: #64748b;
    display: block;
  }
}
</style>
