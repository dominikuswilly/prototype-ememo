<script setup>
import { ref, defineProps, defineExpose, computed, nextTick, onMounted, onUnmounted, watch, defineEmits } from 'vue';
import {
  ChevronRight, Eye, Edit, Trash2, X, Paperclip, Plus, ArrowLeft, DollarSign, FileText, Shield, Building2, Users, Monitor, Briefcase, Wrench, Loader2, Bell, Search, Calendar,
  CheckCircle, Clock, AlertCircle, FileEdit, Hash, User, Layout, Layers, Check, XCircle, Zap, ExternalLink
} from 'lucide-vue-next';
import MemoDetailModal from './MemoDetailModal.vue';
import MemoWizard from './MemoWizard.vue';
import MemoCard from './MemoCard.vue';

const props = defineProps({
  memos: { type: Array, required: true },
  activeTab: { type: String, default: 'all' },
  currentUser: { type: String, default: 'Willy' }
});

const emit = defineEmits(['reorder', 'update-memo', 'delete']);

const isModalOpen = ref(false);
const isEditMode = ref(false);
const isCreateMode = ref(false);
const selectedMemo = ref(null);
const selectedRow = ref(null);

// Wizard State
const isWizardOpen = ref(false);

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(12);
const pageSizeOptions = [4, 8, 12, 16, 20, 24, 48];

const totalPages = computed(() => Math.ceil(props.memos.length / itemsPerPage.value));

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    selectedRow.value = null;
  }
};

// Mobile State
const isMobile = ref(false);
const checkMobile = () => { isMobile.value = window.innerWidth <= 768; };

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});
onUnmounted(() => window.removeEventListener('resize', checkMobile));

const loadMore = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

const handleRowClick = (memo) => {
  selectedRow.value = (selectedRow.value && selectedRow.value.id === memo.id) ? null : memo;
};

// Long Press Logic for Mobile
let holdTimer = null;
const handlePressStart = (memo) => {
  if (!isMobile.value) return;
  if (holdTimer) clearTimeout(holdTimer);
  holdTimer = setTimeout(() => {
    selectedRow.value = memo;
    if (navigator.vibrate) navigator.vibrate(50);
  }, 600);
};
const handlePressEnd = () => {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
};

// Drag & Drop
const dragSourceId = ref(null);
const dropTargetId = ref(null);
const handleDragStart = (id) => { dragSourceId.value = id; };
const handleDragOver = (id) => { dropTargetId.value = id; };
const handleDragEnd = () => {
  if (dragSourceId.value !== null && dropTargetId.value !== null) {
      emit('reorder', { sourceId: dragSourceId.value, targetId: dropTargetId.value });
  }
  dragSourceId.value = null; dropTargetId.value = null;
};

// Processed Memos
const memosCopy = ref([]);
watch(() => props.memos, (newMemos) => { memosCopy.value = [...newMemos]; }, { immediate: true });
const processedMemos = computed(() => {
  if (isMobile.value) return memosCopy.value.slice(0, currentPage.value * itemsPerPage.value);
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return memosCopy.value.slice(start, start + itemsPerPage.value);
});

// Actions & Helpers
const handleRemind = (memo) => alert(`Reminder sent for #${memo.memoNumber}`);
const handleDelete = (memo) => { if (confirm(`Delete Memo ${memo.memoNumber}?`)) emit('delete', memo.id); };

// Modal & Wizard Logic
const openViewModal = (memo, edit = false) => {
  selectedMemo.value = JSON.parse(JSON.stringify(memo));
  isEditMode.value = edit;
  isCreateMode.value = false;
  isModalOpen.value = true;
};

const openCreateModal = () => {
    isWizardOpen.value = true;
};

const closeWizard = () => isWizardOpen.value = false;
const onMemoSave = (memoData) => { emit('update-memo', memoData); isModalOpen.value = false; };
const goBackToWizard = () => { isModalOpen.value = false; isWizardOpen.value = true; };

const selectWizardTemplate = (item) => {
    isWizardOpen.value = false;
    selectedMemo.value = { 
      title: '', 
      description: '', 
      category: item.division, 
      categoryType: item.name, 
      status: 'Draft', 
      approvalChain: [],
      requesterDepartment: 'IT',
      targetDepartment: item.division,
      travStartDate: '',
      travEndDate: '',
      uploadedFiles: []
    };
    isEditMode.value = true; isCreateMode.value = true; isModalOpen.value = true;
};

defineExpose({ openCreateModal });
</script>

<template>
  <div class="memo-list-container">
    <div class="memo-container">
      <div v-if="processedMemos.length > 0" class="memo-grid">
        <div v-for="memo in processedMemos" :key="memo.id" class="memo-card-wrapper" draggable="true"
          @dragstart="handleDragStart(memo.id)" @dragover.prevent="handleDragOver(memo.id)" @dragend="handleDragEnd">
          <MemoCard 
            :memo="memo"
            :isSelected="selectedRow && selectedRow.id === memo.id"
            :isMobile="isMobile"
            :currentUser="currentUser"
            @select="handleRowClick"
            @deselect="selectedRow = null"
            @press-start="handlePressStart"
            @press-end="handlePressEnd"
            @view="openViewModal"
            @remind="handleRemind"
            @delete="handleDelete"
          />
        </div>
      </div>

      <div v-else class="empty-state-premium">
        <div class="empty-icon-circle">
          <Check class="empty-icon" />
        </div>
        <h2>All clear!</h2>
        <p>There are no memos available here.</p>
        <button class="btn-create-empty" @click="openCreateModal">
          <Plus class="icon-small mr-2" /> Create First Memo
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="memos.length > itemsPerPage && !isMobile" class="pagination-bar">
      <div class="pagination-info">Showing {{ processedMemos.length }} of {{ memos.length }}</div>
      <div class="pagination-controls">
        <select v-model="itemsPerPage" @change="currentPage = 1" class="page-select">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
        <div class="page-buttons">
          <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Prev</button>
          <button v-for="page in totalPages" :key="page" class="page-btn" :class="{ 'active': page === currentPage }" @click="goToPage(page)">{{ page }}</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Next</button>
        </div>
      </div>
    </div>
    <div v-if="isMobile && currentPage < totalPages" class="mobile-load-more">
      <button class="btn-load-more" @click="loadMore">Load More Memos <Plus class="icon-small ml-2" /></button>
    </div>

    <!-- Wizard -->
    <MemoWizard 
      :isOpen="isWizardOpen"
      @close="closeWizard"
      @select-template="selectWizardTemplate"
    />

    <MemoDetailModal
      v-model="isModalOpen"
      :memo="selectedMemo"
      :isEdit="isEditMode"
      :isCreate="isCreateMode"
      :currentUser="currentUser"
      :activeTab="activeTab"
      @save="onMemoSave"
      @back-to-wizard="goBackToWizard"
    />
  </div>
</template>

<style scoped>
.memo-list-container { width: 100%; }
.memo-container { width: 100%; }
.memo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  padding: 0.5rem 0;
}
@media (max-width: 1280px) { .memo-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 1024px) { .memo-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .memo-grid { grid-template-columns: 1fr; } }

/* Status Colors */
:root {
  --status-approved-primary: #10b981;
  --status-pending-primary: #f59e0b;
  --status-draft-primary: #64748b;
  --status-requested-changes-primary: #f97316;
  --status-rejected-primary: #dc2626;
}

@media (max-width: 640px) {
  .memo-card-wrapper { width: 100%; }
}

.mt-1 { margin-top: 0.25rem; }

/* Pagination */
.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-top: 1px solid #e2e8f0; }
.pagination-info { font-size: 0.9rem; color: #64748b; }
.pagination-controls { display: flex; align-items: center; gap: 1rem; }
.page-select { padding: 0.4rem; border: 1px solid #e2e8f0; border-radius: 6px; color: #475569; }
.page-buttons { display: flex; gap: 0.5rem; }
.page-btn { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.page-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
.page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.mobile-load-more {
  display: flex;
  justify-content: center;
  padding: 2rem 0 3rem;
  width: 100%;
}

.btn-load-more {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 99px;
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-load-more:active {
  transform: scale(0.96);
  background-color: #f8fafc;
  box-shadow: 0 2px 6px -1px rgba(0, 0, 0, 0.05);
}

.btn-load-more .icon-small {
  width: 18px;
  height: 18px;
  color: #3b82f6;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
