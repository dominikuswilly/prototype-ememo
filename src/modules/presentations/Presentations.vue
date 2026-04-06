<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  Search, Plus, FileText, Layout,
  MoreVertical, Download, Eye, Clock, User,
  CheckCircle, AlertCircle, Trash2, X, UploadCloud,
  Monitor, Briefcase, Globe, TrendingUp, Cpu,
  Settings, Users, Gift, ShieldCheck, CreditCard, Scale, ShieldAlert, BarChart3, Wrench, Heart,
  LayoutGrid, List, ChevronLeft, ChevronRight, FileDigit, FileVideo, FileImage, MoreHorizontal,
  Edit2, FolderInput, Copy, Share2, Lock, Link, Info, History, Archive
} from 'lucide-vue-next';
import PresentationContent from './components/PresentationContent.vue';
import { presentationCategories } from './data/categories';

const props = defineProps({
  searchQuery: { type: String, default: '' },
  sortBy: { type: String, default: 'date_desc' },
  viewMode: { type: String, default: 'grid' },
  selectedCategories: { type: Array, default: () => [] },
  status: { type: String, default: '' }
});

const emit = defineEmits(['update:view-mode']);
const isUploadModalOpen = ref(false);
const filterRef = ref(null);
const categoryScrollRef = ref(null);
const isPageLoading = ref(true);
const isCategoryDropdownOpen = ref(false);
const isMobileScreen = ref(false);
const isScrolled = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(6);

const checkMobile = () => {
  isMobileScreen.value = window.innerWidth <= 1024;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// Cleanup complete
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
  // searchQuery is now a prop, parent should handle clearing it
  // This function might be deprecated or emit to parent
};

const handleResize = () => {
  checkMobile();
};

const handleKeydown = (e) => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    filterRef.value?.focusSearch();
  }
};

const handleGlobalClick = (e) => {
  if (!e.target.closest('.action-wrap-trigger') && !e.target.closest('.bottom-sheet-content')) {
    activeMenuId.value = null;
  }
  // Ignore clicks inside the wrap OR inside the teleported modal OR on the backdrop
  if (!e.target.closest('.category-select-wrap') && 
      !e.target.closest('.category-multi-dropdown') && 
      !e.target.closest('.dropdown-backdrop')) {
    isCategoryDropdownOpen.value = false;
  }
};

onMounted(() => {
  checkMobile();
  // Simulate data fetching
  setTimeout(() => {
    isPageLoading.value = false;
  }, 1500);

  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', handleGlobalClick);
});

// Category helpers moved to props/emits or cleaned up
const isSelected = (id) => {
  if (id === 'all') return props.selectedCategories.length === 0;
  return props.selectedCategories.includes(id);
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
    // Hide archived from main view
    if (p.status === 'Archived') return false;

    const matchesCategory = props.selectedCategories.length === 0 || props.selectedCategories.includes(p.category);
    const matchesSearch = p.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(props.searchQuery.toLowerCase());
    const matchesStatus = !props.status || p.status.toLowerCase() === props.status.toLowerCase();
    return matchesCategory && matchesSearch && matchesStatus;
  });

  return filtered.sort((a, b) => {
    if (props.sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
    if (props.sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
    if (props.sortBy === 'title_asc') return a.title.localeCompare(b.title);
    return 0;
  });
});

const totalPages = computed(() => Math.ceil(sortedFilteredPresentations.value.length / itemsPerPage.value));

const paginatedPresentations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedFilteredPresentations.value.slice(start, end);
});

const currentRange = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(currentPage.value * itemsPerPage.value, sortedFilteredPresentations.value.length);
  return { start, end, total: sortedFilteredPresentations.value.length };
});

// Watch Categories/Search/Sort/Status props to reset pagination
watch(() => [props.selectedCategories, props.searchQuery, props.sortBy, props.status], () => {
  currentPage.value = 1;
}, { deep: true });

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

defineExpose({
  openUploadModal: () => isUploadModalOpen.value = true
});
</script>

<template>
  <div class="presentations-page">
    <PresentationContent :items="paginatedPresentations" :view-mode="props.viewMode" :selected-ids="selectedFiles"
      :active-menu-id="activeMenuId" :is-mobile="isMobileScreen" :is-select-mode="isSelectMode"
      :is-loading="isPageLoading" @toggle-selection="toggleFileSelection" @open-menu="openMenu"
      @execute-action="executeAction" @select-all="selectAll" @clear-selection="clearSelection" />

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="pagination-wrap">
      <div class="pagination-info">
        Showing <span>{{ currentRange.start }}</span> to <span>{{ currentRange.end }}</span> of <span>{{ currentRange.total }}</span> items
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--" title="Previous Page">
          <ChevronLeft class="icon-small" />
        </button>
        <div class="page-numbers">
          <button v-for="page in totalPages" :key="page" 
            :class="['page-number', { active: currentPage === page }]"
            @click="currentPage = page">
            {{ page }}
          </button>
        </div>
        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++" title="Next Page">
          <ChevronRight class="icon-small" />
        </button>
      </div>
    </div>

    <!-- Administrative Modals -->
    <!-- Rename Modal -->
    <div v-if="isRenameModalOpen" class="modal-overlay" @click.self="isRenameModalOpen = false">
      <div class="modal-content sm">
        <div class="modal-header">
          <h3>Rename File</h3>
          <button class="btn-close" @click="isRenameModalOpen = false">
            <X class="icon" />
          </button>
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
          <button class="btn-close" @click="isShareModalOpen = false">
            <X class="icon" />
          </button>
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
          <button class="btn-close" @click="isMoveModalOpen = false">
            <X class="icon" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Select a new department for this file.</p>
          <div class="move-options custom-scrollbar">
            <button v-for="cat in categories.filter(c => c.id !== 'all')" :key="cat.id" class="move-option"
              @click="saveMove(cat.id)">
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
          <button class="btn-close" @click="isPropertiesModalOpen = false">
            <X class="icon" />
          </button>
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
      <button v-if="isMobileScreen" class="mobile-fab" @click="isUploadModalOpen = true"
        :class="{ 'fab-minified': isScrolled }">
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
  width: 100%;
  margin-top: 0;
  padding-top: 0;
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

/* Main Content Layout */
.main-content-full {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  padding: 0 0 2rem;
}

@media (max-width: 1024px) {
  .main-content-full {
    padding: 0 0 1.5rem;
  }
}



.category-multi-dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 0;
  width: 320px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  max-height: 480px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .category-multi-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 2.5rem);
    max-width: 440px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-height: 85vh;
    padding: 1.5rem;
  }
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1999;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.5rem;
}

.dropdown-header span {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.btn-reset {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--brand-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.btn-reset:hover { background: #eff6ff; }

.dropdown-list {
  max-height: 380px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.dropdown-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-item:hover {
  background: #f8fafc;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.2s;
  background: white;
}

.custom-checkbox.checked {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
}

.dropdown-item:hover .custom-checkbox {
  border-color: var(--brand-primary);
}

.item-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.dropdown-item:hover .item-icon {
  color: var(--brand-primary);
}

@media (max-width: 1024px) {
  .category-multi-dropdown {
    padding: 1.5rem;
  }

  .dropdown-list {
    max-height: none;
    flex: 1;
    margin-bottom: 1rem;
    padding-right: 0.25rem;
  }

  .dropdown-footer {
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
  }

  .btn-primary.full-width {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    border-radius: 14px;
    justify-content: center;
  }
}

/* Dropdown Transition - Multi-Format */
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Desktop Transition (Slide Down) */
@media (min-width: 1025px) {
  .dropdown-enter-from, .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Mobile Transition (Pop Center) */
@media (max-width: 1024px) {
  .dropdown-enter-from .category-multi-dropdown,
  .dropdown-leave-to .category-multi-dropdown {
    transform: translate(-50%, -50%) scale(0.6) !important;
    opacity: 0;
  }
  
  .dropdown-enter-to .category-multi-dropdown,
  .dropdown-leave-from .category-multi-dropdown {
    transform: translate(-50%, -50%) scale(1) !important;
    opacity: 1;
  }
}

/* Main Content Layout - Simplified */

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
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  transform: translateY(-1px);
}

.cat-pill.active {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
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
  color: var(--brand-primary);
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
  background: var(--brand-primary);
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
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 2100;
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* Modal Animations via Transition */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-active .modal-content {
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-leave-active .modal-content {
  animation: modalPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) reverse;
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-content.sm {
  max-width: 400px;
}

.modal-content.md {
  max-width: 550px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f8fafc;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 2rem;
}

.modal-body.no-padding {
  padding: 0;
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
  border-color: var(--brand-primary);
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
  color: var(--brand-primary);
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
  color: var(--brand-primary);
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
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

/* Properties Modal Styles */
.no-padding {
  padding: 0 !important;
}

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
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
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

.status-badge.published {
  background: #f0fdf4;
  color: #22c55e;
}

.status-badge.private {
  background: #fff7ed;
  color: #f97316;
}

.status-badge.draft {
  background: #f1f5f9;
  color: #64748b;
}

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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
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

.file-icon-box.sm {
  width: 44px;
  height: 44px;
  border-radius: 10px;
}

.file-icon.sm {
  width: 22px;
  height: 22px;
}

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
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  transform: scale(0.95);
}

.action-group-grid button.danger {
  color: #ef4444;
}

.action-group-grid button.danger:active {
  background: #fef2f2;
  border-color: #ef4444;
}

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
  background: var(--brand-primary);
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

.toolbar-action-btn.danger {
  color: #fca5a5;
}

.toolbar-action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.btn-text-only {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem;
}

.btn-text-only:hover {
  color: white;
}

/* Transitions for Toolbar */
.toolbar-enter-active,
.toolbar-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toolbar-enter-from,
.toolbar-leave-to {
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
  .page-title {
    font-size: 1.5rem;
  }

  .presentations-page {
    padding: 0.75rem;
  }

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
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

/* Mobile FAB Styling */
.mobile-fab {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  background: var(--brand-primary);
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
.fab-enter-active,
.fab-leave-active {
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.fab-enter-from,
.fab-leave-to {
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

/* Pagination Styling */
.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.pagination-info span {
  color: #1e293b;
  font-weight: 700;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.pagination-btn, .page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.pagination-btn:hover:not(:disabled), .page-number:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
}

.page-number.active {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
}

@media (max-width: 768px) {
  .pagination-wrap {
    flex-direction: column;
    gap: 1.25rem;
    align-items: center;
    text-align: center;
  }
}
</style>
