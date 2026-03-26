<script setup>
import { ref, defineProps, defineExpose, computed, nextTick, onMounted, onUnmounted, watch, defineEmits } from 'vue';
import {
  ChevronRight, Eye, Edit, Trash2, X, Paperclip, Plus, ArrowLeft, DollarSign, FileText, Shield, Building2, Users, Monitor, Briefcase, Wrench, Loader2, Bell, Search, Calendar,
  CheckCircle, Clock, AlertCircle, FileEdit, Hash, User, Layout, Layers, Check, XCircle, Zap, ExternalLink
} from 'lucide-vue-next';
import MemoDetailModal from './MemoDetailModal.vue';

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
const wizardStep = ref(1);
const wizardDivision = ref('');
const wizardSearch = ref('');

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
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getStatusColor = (status) => {
  if (!status) return 'default';
  switch (status.toLowerCase()) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    case 'pending': return 'pending';
    case 'requested changes': return 'requested-changes';
    case 'draft': return 'draft';
    default: return 'default';
  }
};

const getStatusIcon = (status) => {
  if (!status) return FileText;
  switch (status.toLowerCase()) {
    case 'approved': return CheckCircle;
    case 'rejected': return XCircle;
    case 'pending': return Clock;
    case 'requested changes': return AlertCircle;
    case 'draft': return FileText;
    default: return FileText;
  }
};

const getApprovalProgress = (memo) => {
    if (memo.status === 'Draft') return 0;
    if (memo.status === 'Approved') return 100;
    const total = memo.approvalChain?.length || 0;
    if (total === 0) return 0;
    const approved = memo.approvalChain.filter(t => t.status === 'Approved').length;
    return Math.round((approved / total) * 100);
};

const getProgressLabel = (memo) => {
    if (memo.status === 'Draft') return 'Draft';
    if (memo.status === 'Approved') return '100% Approved';
    if (memo.status === 'Rejected') return 'Rejected';
    if (memo.status === 'Requested Changes') return 'Changes Requested';
    return `${getApprovalProgress(memo)}% Progress`;
};

const getActions = (memo) => {
    const isRequester = memo.requester === props.currentUser;
    if (memo.status === 'Approved') return ['view'];
    if (memo.status === 'Pending') {
        const actions = ['view'];
        if (isRequester) actions.push('remind');
        return actions;
    }
    if (memo.status === 'Rejected') return ['view'];
    if (memo.status === 'Requested Changes') return ['view', 'update'];
    if (memo.status === 'Draft') return ['view', 'edit', 'delete'];
    return ['view'];
};

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
    wizardStep.value = 1;
};

const closeWizard = () => isWizardOpen.value = false;
const onMemoSave = (memoData) => { emit('update-memo', memoData); isModalOpen.value = false; };
const goBackToWizard = () => { isModalOpen.value = false; isWizardOpen.value = true; };

// Template Data
const templateListFull = [
  { name: 'Cash Advance', division: 'Accounting & Finance' },
  { name: 'Housing Loan', division: 'Accounting & Finance' },
  { name: 'Internal Memo Accounting & Finance', division: 'Accounting & Finance' },
  { name: 'LPJ Cash Advance diatas Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'LPJ Cash Advance dibawah Rp. 2.500.000,-', division: 'Accounting & Finance' },
  { name: 'Penggunaan Asuransi', division: 'Employee Benefit' },
  { name: 'Pembelian Barang', division: 'General Affair' },
  { name: 'Peminjaman Kendaraan', division: 'General Affair' },
  { name: 'Internal Memo HRD', division: 'HRD' },
  { name: 'Pengajuan Karyawan', division: 'HRD' },
  { name: 'Perjalanan Dinas', division: 'HRD' },
  { name: 'Pembelian Hardware/Software', division: 'IT' },
  { name: 'Internal Memo Legal', division: 'Legal' },
  { name: 'Permintaan NDA', division: 'Legal' },
  { name: 'Permintaan PKS', division: 'Legal' },
  { name: 'Penggunaan Asuransi', division: 'Technical' },
  { name: 'Self Insurance', division: 'Technical' },
];

const isSearchingInWizard = computed(() => wizardSearch.value.trim().length > 0);
const wizardFilteredTemplates = computed(() => {
    const q = wizardSearch.value.trim().toLowerCase();
    if (!q) return [];
    return templateListFull.filter(t => t.name.toLowerCase().includes(q) || t.division.toLowerCase().includes(q));
});

const divisionMeta = {
  'Accounting & Finance': { color: '#2563eb', bg: '#eff6ff', borderColor: '#bfdbfe', component: DollarSign },
  'Claim': { color: '#7c3aed', bg: '#f5f3ff', borderColor: '#ddd6fe', component: FileText },
  'Employee Benefit': { color: '#059669', bg: '#ecfdf5', borderColor: '#a7f3d0', component: Shield },
  'General Affair': { color: '#d97706', bg: '#fffbeb', borderColor: '#fde68a', component: Building2 },
  'HRD': { color: '#db2777', bg: '#fdf2f8', borderColor: '#fbcfe8', component: Users },
  'IT': { color: '#0891b2', bg: '#ecfeff', borderColor: '#a5f3fc', component: Monitor },
  'Legal': { color: '#475569', bg: '#f8fafc', borderColor: '#cbd5e1', component: Briefcase },
  'Technical': { color: '#dc2626', bg: '#fef2f2', borderColor: '#fecaca', component: Wrench },
};

const divisions = computed(() => {
  const map = {};
  templateListFull.forEach(t => { map[t.division] = (map[t.division] || 0) + 1; });
  return Object.entries(map).map(([name, count]) => ({ name, count, ...divisionMeta[name] }));
});

const selectWizardDivision = (division) => { wizardDivision.value = division; wizardStep.value = 2; };
const wizardDivisionTemplates = computed(() => templateListFull.filter(t => t.division === wizardDivision.value));
const selectWizardTemplate = (item) => {
    isWizardOpen.value = false;
    selectedMemo.value = { title: '', description: '', category: item.division, categoryType: item.name, status: 'Draft', approvalChain: [] };
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
          <div class="memo-card" :class="['status-' + getStatusColor(memo.status), { active: selectedRow && selectedRow.id === memo.id }]"
            @click="handleRowClick(memo)" @touchstart="handlePressStart(memo)" @touchend="handlePressEnd">
            
            <div class="memo-card-header-new">
              <div class="header-left">
                <h3 class="memo-card-title-new">{{ memo.title }}</h3>
                <span class="memo-card-number-new">#{{ memo.memoNumber }}</span>
              </div>
              <div class="header-right">
                <div class="status-icon-ghost"><component :is="getStatusIcon(memo.status)" class="status-icon-large" /></div>
              </div>
            </div>

            <div class="memo-card-body-grid">
              <div class="grid-item">
                <User class="grid-icon" />
                <span class="grid-text">{{ memo.requester }}</span>
              </div>
              <div class="grid-item">
                <Layers class="grid-icon" />
                <span class="grid-text">{{ memo.requesterDepartment }} → {{ memo.targetDepartment }}</span>
              </div>
              <div class="grid-item full-width">
                <Calendar class="grid-icon" />
                <span class="grid-text">{{ formatDate(memo.createdAt) }}</span>
              </div>
            </div>

            <div class="card-footer-separator-new"></div>

            <div class="memo-card-footer-new">
              <div class="progress-row-new">
                <span class="progress-label-new">{{ getProgressLabel(memo) }}</span>
                <div class="card-actions-mini-new">
                  <button class="mini-action-btn view" @click.stop="openViewModal(memo, false)" title="View Details">
                    <Eye class="icon-tiny" />
                  </button>
                  <button v-if="getActions(memo).includes('edit') || getActions(memo).includes('update')" class="mini-action-btn edit"
                    @click.stop="openViewModal(memo, true)" title="Edit/Update">
                    <Edit class="icon-tiny" />
                  </button>
                </div>
              </div>

              <div class="progress-bar-container-new" v-if="memo.status !== 'Draft'">
                <div class="progress-bar-wrapper-new">
                  <div class="progress-bar-fill-new" :style="{ width: getApprovalProgress(memo) + '%' }"></div>
                </div>
              </div>
            </div>

            <Transition name="fade">
              <div v-if="selectedRow && selectedRow.id === memo.id" class="card-overlay" @click.stop>
                <div class="overlay-btns">
                  <button class="overlay-main-btn view" @click="openViewModal(memo, false)">
                    <Eye class="icon-small" /> Open Memo
                  </button>
                  <button v-if="getActions(memo).includes('update') || getActions(memo).includes('edit')"
                    class="overlay-main-btn edit" @click="openViewModal(memo, true)">
                    <Edit class="icon-small" /> {{ getActions(memo).includes('edit') ? 'Edit Draft' : 'Update Content' }}
                  </button>
                  <button v-if="getActions(memo).includes('remind')" class="overlay-main-btn remind"
                    @click="handleRemind(memo)">
                    <Bell class="icon-small" /> Remind Approvers
                  </button>
                  <button v-if="getActions(memo).includes('delete')" class="overlay-main-btn delete"
                    @click="handleDelete(memo)">
                    <Trash2 class="icon-small" /> Delete Draft
                  </button>
                </div>
                <button class="overlay-close" @click="selectedRow = null">
                  <X class="icon-small" />
                </button>
              </div>
            </Transition>
          </div>
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
    <div v-if="isWizardOpen" class="modal-overlay" @click.self="closeWizard">
      <div class="wizard-modal">
        <div class="wizard-header">
          <div class="wizard-header-left">
            <button v-if="wizardStep === 2 && !isSearchingInWizard" class="btn-back" @click="wizardStep = 1"><ArrowLeft class="icon" /></button>
            <div class="wizard-search-container">
              <Search class="search-icon" />
              <input v-model="wizardSearch" type="text" placeholder="Search templates..." class="wizard-search-input" autofocus />
            </div>
          </div>
          <button class="btn-close" @click="closeWizard"><X class="icon" /></button>
        </div>
        <div class="wizard-body">
          <div v-if="isSearchingInWizard" class="template-list">
            <button v-for="tpl in wizardFilteredTemplates" :key="tpl.name" class="template-item" @click="selectWizardTemplate(tpl)">
                {{ tpl.name }} ({{ tpl.division }})
            </button>
          </div>
          <div v-else-if="wizardStep === 1" class="division-grid">
            <button v-for="div in divisions" :key="div.name" class="division-card" @click="selectWizardDivision(div.name)"
                :style="{ '--div-color': div.color, '--div-bg': div.bg, '--div-border': div.borderColor }">
              <div class="division-icon-wrap"><component :is="div.component" class="division-icon" /></div>
              <div class="division-info">
                <div class="division-name">{{ div.name }}</div>
                <div class="division-count">{{ div.count }} items</div>
              </div>
            </button>
          </div>
          <div v-else class="template-list">
            <button v-for="tpl in wizardDivisionTemplates" :key="tpl.name" class="template-item" @click="selectWizardTemplate(tpl)">{{ tpl.name }}</button>
          </div>
        </div>
      </div>
    </div>

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

.memo-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #e2e8f0;
  padding: 1.25rem;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  height: 100%;
}
.memo-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1); }
.memo-card.active { border-color: #3b82f6; background-color: #f8fafc; }

.status-approved { border-left-color: #10b981; }
.status-pending { border-left-color: #f59e0b; }
.status-draft { border-left-color: #64748b; }
.status-requested-changes { border-left-color: #f97316; }
.status-rejected { border-left-color: #dc2626; }

.memo-card-header-new { display: flex; justify-content: space-between; align-items: flex-start; }
.memo-card-title-new { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
.memo-card-number-new { font-family: monospace; font-size: 0.75rem; color: #64748b; }

.status-icon-ghost {
  width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  background: #f1f5f9; color: #64748b;
}
.status-approved .status-icon-ghost { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.memo-card-body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.grid-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #475569; }
.grid-item.full-width { grid-column: span 2; }
.grid-icon { width: 14px; height: 14px; color: #94a3b8; }

.card-footer-separator-new { height: 1px; background: #e2e8f0; }
.memo-card-footer-new { display: flex; flex-direction: column; gap: 0.5rem; }
.progress-row-new { display: flex; justify-content: space-between; align-items: center; }
.progress-label-new { font-size: 0.75rem; font-weight: 700; color: #64748b; }
.card-actions-mini-new { display: flex; gap: 0.5rem; }
.mini-action-btn {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; color: #64748b;
}

.progress-bar-wrapper-new { height: 6px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.progress-bar-fill-new { height: 100%; background: #3b82f6; transition: width 0.3s; }
.status-approved .progress-bar-fill-new { background: #10b981; }

/* Overlay */
.card-overlay {
  position: absolute; inset: 0; background: rgba(255, 255, 255, 0.95);
  display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem;
  z-index: 20;
}
.overlay-btns { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; }
.overlay-main-btn {
  width: 100%; padding: 0.6rem; border-radius: 8px; border: none; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer;
}
.overlay-main-btn.view { background: #3b82f6; color: white; }
.overlay-main-btn.edit { background: #f59e0b; color: white; }
.overlay-main-btn.remind { background: #10b981; color: white; }
.overlay-main-btn.delete { background: #ef4444; color: white; }
.overlay-close { position: absolute; top: 0.75rem; right: 0.75rem; border: none; background: none; cursor: pointer; color: #475569; z-index: 30; }

/* Wizard */
.wizard-modal {
  background: white; border-radius: 16px; width: 100%; max-width: 500px; max-height: 80vh;
  display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.wizard-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #e2e8f0; }
.wizard-header-left { display: flex; align-items: center; gap: 1rem; flex: 1; }
.wizard-search-input { flex: 1; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.wizard-body { padding: 1.5rem; overflow-y: auto; }
.division-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.division-card {
  padding: 1rem; border-radius: 12px; border: 2px solid var(--div-border);
  background: var(--div-bg); color: var(--div-color); text-align: left; cursor: pointer;
}
.template-list { display: flex; flex-direction: column; gap: 0.5rem; }
.template-item { padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: left; cursor: pointer; }

/* Pagination */
.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-top: 1px solid #e2e8f0; }
.page-buttons { display: flex; gap: 0.5rem; }
.page-btn { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; }
.page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

@media (max-width: 640px) {
  .memo-card { border-left-width: 1px; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
