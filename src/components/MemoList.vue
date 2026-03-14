<script setup>
import { ref, defineProps, defineExpose, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { ChevronRight, Eye, Edit, Trash2, X, Paperclip, Plus, ArrowLeft, DollarSign, FileText, Shield, Building2, Users, Monitor, Briefcase, Wrench, Loader2, Bell, Search } from 'lucide-vue-next';
import MapPicker from './MapPicker.vue';

const props = defineProps({
  memos: {
    type: Array,
    required: true
  },
  activeTab: {
    type: String,
    default: 'all'
  },
  currentUser: {
    type: String,
    default: 'Tyrell Wellick'
  }
});

const isModalOpen = ref(false);
const isEditMode = ref(false);
const isCreateMode = ref(false);
const selectedMemo = ref(null);
const selectedRow = ref(null);
const isHistoryCollapsed = ref(true);
const isAttachmentsCollapsed = ref(true);

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(10);
const pageSizeOptions = [5, 10, 20, 50];

const totalPages = computed(() => Math.ceil(props.memos.length / itemsPerPage.value));

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    selectedRow.value = null; // Deselect on page change
  }
};

// Lazy Load / Mobile State
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const loadMore = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Long Press Logic for Mobile
let holdTimer = null;
const handlePressStart = (memo) => {
  if (!isMobile.value) return;
  
  // Clear any existing timer
  if (holdTimer) clearTimeout(holdTimer);
  
  holdTimer = setTimeout(() => {
    selectedRow.value = memo;
    // Vibrations can enhance mobile feel if supported
    if (navigator.vibrate) navigator.vibrate(50);
  }, 600); // 600ms for a solid "hold"
};

const handlePressEnd = () => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
};

const handleRowClick = (memo) => {
  if (isMobile.value) {
    // Requirement: "if only click, then show nothing"
    return;
  }
  // Desktop: Standard toggle behavior
  selectedRow.value = (selectedRow.value && selectedRow.value.id === memo.id) ? null : memo;
};

const processedMemos = computed(() => {
  if (isMobile.value) {
    // Lazy load: Show everything from page 1 up to current page
    return props.memos.slice(0, currentPage.value * itemsPerPage.value);
  }
  // Standard pagination: Show only the current page
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return props.memos.slice(start, end);
});

const isReviewModalOpen = ref(false);
const reviewModalType = ref('Reject'); // 'Reject' or 'Requested Changes'
const rejectionReason = ref('');
const rejectionConcern = ref('');
const rejectionConcernsList = [
  'Budget / Finance',
  'Compliance / Policy',
  'Incomplete Information',
  'Scope / Objective',
  'Timeline / Schedule',
  'Other'
];
const rejectedFields = ref([]);
const memoFieldsToReject = [
  'Title',
  'Description',
  'Department',
  'Location',
  'Amount',
  'Attachments'
];

const templateList = [
  // Accounting & Finance
  { name: 'Cash Advance', division: 'Accounting & Finance' },
  { name: 'Housing Loan', division: 'Accounting & Finance' },
  { name: 'Internal Memo Accounting & Finance', division: 'Accounting & Finance' },
  { name: 'LPJ Cash Advance diatas Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'LPJ Cash Advance dibawah Rp. 2.500.000,-', division: 'Accounting & Finance' },
  { name: 'LPJ Cash Advance Rp. 2.500.000,- s/d Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'Pembelian Karangan Bunga', division: 'Accounting & Finance' },
  { name: 'Pembelian Kue / Parsel', division: 'Accounting & Finance' },
  { name: 'Pengajuan Fee Agent', division: 'Accounting & Finance' },
  { name: 'Pengajuan Kartu Kredit Corporate', division: 'Accounting & Finance' },
  { name: 'Pengajuan Pembukaan Rekening Perusahaan', division: 'Accounting & Finance' },
  { name: 'Pengajuan Perjalanan Dinas', division: 'Accounting & Finance' },
  { name: 'Pengajuan Sewa Kantor', division: 'Accounting & Finance' },
  { name: 'Pertanggung Jawaban Perjalanan Dinas', division: 'Accounting & Finance' },
  { name: 'Reimburse diatas Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse diatas Rp. 500.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse dibawah Rp. 500.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Entertain diatas Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Entertain diatas Rp. 500.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Entertain dibawah Rp. 500.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Entertain Rp. 2.500.000,- s/d Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Entertain Rp. 500.000,- s/d Rp. 2.500.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Rp. 2.500.000,- s/d Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Rp. 500.000,- s/d Rp. 2.500.000,-', division: 'Accounting & Finance' },
  { name: 'Sponsorship', division: 'Accounting & Finance' },
  // Claim
  { name: 'Internal Memo', division: 'Claim' },
  { name: 'Reimburse Entertain diatas Rp. 10.000.000,-', division: 'Claim' },
  { name: 'Reimburse Entertain dibawah Rp. 500.000,-', division: 'Claim' },
  { name: 'Reimburse Entertain Rp. 2.500.000,- s/d Rp. 10.000.000,-', division: 'Claim' },
  { name: 'Reimburse Entertain Rp. 500.000,- s/d Rp. 2.500.000,-', division: 'Claim' },
  // Employee Benefit
  { name: 'Penggunaan Asuransi', division: 'Employee Benefit' },
  // General Affair
  { name: 'Internal Memo General Affair', division: 'General Affair' },
  { name: 'Pembelian Barang', division: 'General Affair' },
  { name: 'Peminjaman Kendaraan', division: 'General Affair' },
  { name: 'Peminjaman Perangkat', division: 'General Affair' },
  { name: 'Penarikan kendaraan', division: 'General Affair' },
  { name: 'Pengajuan Pulsa', division: 'General Affair' },
  // HRD
  { name: 'Internal Memo HRD', division: 'HRD' },
  { name: 'Pengajuan Karyawan Kontrak Khusus Trainee', division: 'HRD' },
  { name: 'Pengajuan Karyawan Magang', division: 'HRD' },
  { name: 'Pengajuan Mitra', division: 'HRD' },
  { name: 'Pengajuan Mutasi Karyawan', division: 'HRD' },
  { name: 'Pengajuan Perjalanan Dinas', division: 'HRD' },
  { name: 'Pengajuan/Perpanjangan Karyawan Kontrak', division: 'HRD' },
  { name: 'Pengajuan Traning/Peserta Training', division: 'HRD' },
  { name: 'Pengangkatan/Pengajuan Karyawan (Diatas Staff)', division: 'HRD' },
  { name: 'Pengangkatan/Pengajuan Karyawan (Staff)', division: 'HRD' },
  { name: 'Perjalanan Dinas', division: 'HRD' },
  { name: 'Perpanjangan Masa Jabatan', division: 'HRD' },
  // IT
  { name: 'IT Testing', division: 'IT' },
  { name: 'Pembelian Hardware/Software', division: 'IT' },
  { name: 'Pembelian Hardware/Software Diatas 4 Juta', division: 'IT' },
  { name: 'Pengajuan/Perpanjangan Lisensi', division: 'IT' },
  { name: 'Pengajuan/Perpanjangan Maintenance', division: 'IT' },
  { name: 'Service Hardware/Software', division: 'IT' },
  // Legal
  { name: 'Internal Memo Legal', division: 'Legal' },
  { name: 'Pengisian Dokumen Non PKS', division: 'Legal' },
  { name: 'Pengisian Form Data Vendor', division: 'Legal' },
  { name: 'Permintaan NDA', division: 'Legal' },
  { name: 'Permintaan PKS (Biasa)', division: 'Legal' },
  { name: 'Permintaan PKS (Persetujuan Khusus)', division: 'Legal' },
  { name: 'Review / Drafting PKS', division: 'Legal' },
  // Technical
  { name: 'Lain-Lain', division: 'Technical' },
  { name: 'Penggunaan Asuransi', division: 'Technical' },
  { name: 'Self Insurance', division: 'Technical' },
  { name: 'Sponsorship', division: 'Technical' },
];

const templateSearch = ref('');
const showSuggestions = ref(false);

const filteredTemplates = computed(() => {
  const q = templateSearch.value.trim().toLowerCase();
  if (!q) return templateList;
  return templateList.filter(
    t => t.name.toLowerCase().includes(q) || t.division.toLowerCase().includes(q)
  );
});

const templateInputRef = ref(null);
const dropdownStyle = ref({});

const selectTemplate = (item) => {
  selectedMemo.value.categoryType = item.name;
  selectedMemo.value.category = item.division;
  templateSearch.value = item.name;
  showSuggestions.value = false;
};

const updateDropdownPos = async () => {
  await nextTick();
  const el = templateInputRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  dropdownStyle.value = {
    position: 'fixed',
    top: rect.bottom + 4 + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    zIndex: 9999,
  };
};

const handleTemplateBlur = () => {
  setTimeout(() => { showSuggestions.value = false; }, 180);
};

const handleTemplateFocus = () => {
  showSuggestions.value = true;
  updateDropdownPos();
};

const handleTemplateInput = () => {
  showSuggestions.value = true;
  updateDropdownPos();
};

const openViewModal = (memo, edit = false) => {
  // We make a reactive copy for editing so we don't mutate the prop directly
  // In a real app we'd emit an event up, but for the mockup we'll modify it here locally
  selectedMemo.value = JSON.parse(JSON.stringify(memo));
  isEditMode.value = edit;
  isCreateMode.value = false;
  isModalOpen.value = true;
  // Pre-fill the template search input when editing
  templateSearch.value = memo.categoryType || '';

};

// ─── Wizard State ──────────────────────────────────────────────────────────────
const isWizardOpen = ref(false);
const wizardStep = ref(1);
const wizardDivision = ref('');
const wizardSearch = ref('');

const isSearchingInWizard = computed(() => wizardSearch.value.trim().length > 0);

const wizardFilteredTemplates = computed(() => {
  const q = wizardSearch.value.trim().toLowerCase();
  if (!q) return [];
  return templateList.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.division.toLowerCase().includes(q)
  );
});

const divisionMeta = {
  'Accounting & Finance': { color: '#2563eb', bg: '#eff6ff', borderColor: '#bfdbfe', component: DollarSign },
  'Claim':                { color: '#7c3aed', bg: '#f5f3ff', borderColor: '#ddd6fe', component: FileText },
  'Employee Benefit':     { color: '#059669', bg: '#ecfdf5', borderColor: '#a7f3d0', component: Shield },
  'General Affair':       { color: '#d97706', bg: '#fffbeb', borderColor: '#fde68a', component: Building2 },
  'HRD':                  { color: '#db2777', bg: '#fdf2f8', borderColor: '#fbcfe8', component: Users },
  'IT':                   { color: '#0891b2', bg: '#ecfeff', borderColor: '#a5f3fc', component: Monitor },
  'Legal':                { color: '#475569', bg: '#f8fafc', borderColor: '#cbd5e1', component: Briefcase },
  'Technical':            { color: '#dc2626', bg: '#fef2f2', borderColor: '#fecaca', component: Wrench },
};

const divisions = computed(() => {
  const map = {};
  templateList.forEach(t => {
    if (!map[t.division]) map[t.division] = 0;
    map[t.division]++;
  });
  return Object.entries(map).map(([name, count]) => ({ name, count, ...divisionMeta[name] }));
});

const wizardDivisionTemplates = computed(() =>
  templateList.filter(t => t.division === wizardDivision.value)
);

const openWizard = () => {
  isWizardOpen.value = true;
  wizardStep.value = 1;
  wizardDivision.value = '';
  wizardSearch.value = '';
};

const closeWizard = () => {
  isWizardOpen.value = false;
};

const selectWizardDivision = (division) => {
  wizardDivision.value = division;
  wizardStep.value = 2;
};

const selectWizardTemplate = (item) => {
  isWizardOpen.value = false;
  selectedMemo.value = {
    title: '',
    description: '',
    category: item.division,
    categoryType: item.name,
    department: 'Marketing',
    attachmentsCount: 0,
    status: 'Pending',
    approvalChain: [],
    entLocation: '',
    entPaymentMethod: 'Debit/Cash',
    entDebitAmount: null,
    entCreditAmount: null,
    entPersonName: '',
    entPersonCompany: '',
    entPersonRole: '',
    entLat: null,
    entLng: null,
    entPlaceName: ''
  };
  templateSearch.value = item.name;
  isEditMode.value = true;
  isCreateMode.value = true;
  isModalOpen.value = true;
};

const openCreateModal = () => {
  openWizard();
};


const handlePlaceSelected = (info) => {
  if (!selectedMemo.value) return;
  selectedMemo.value.entLat = info.lat;
  selectedMemo.value.entLng = info.lng;
  selectedMemo.value.entPlaceName = info.placeName;
  // Also sync the text field with the resolved place name
  if (!selectedMemo.value.entLocation) {
    selectedMemo.value.entLocation = info.displayName;
  }
};

defineExpose({ openCreateModal });

const closeViewModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  isCreateMode.value = false;
  isReviewModalOpen.value = false;
  selectedMemo.value = null;
};

const handleApprove = () => {
  alert(`Approved Memo ${selectedMemo.value?.memoNumber}`);
  closeViewModal();
};

const handleReject = () => {
  reviewModalType.value = 'Reject';
  rejectionReason.value = '';
  rejectionConcern.value = '';
  rejectedFields.value = [];
  isReviewModalOpen.value = true;
};

const handleRequestChanges = () => {
  reviewModalType.value = 'Requested Changes';
  rejectionReason.value = '';
  rejectionConcern.value = '';
  rejectedFields.value = [];
  isReviewModalOpen.value = true;
};

const cancelReviewAction = () => {
  isReviewModalOpen.value = false;
};

const confirmReviewAction = () => {
  if (!rejectionReason.value) {
    alert('Please provide specific details/reason.');
    return;
  }
  if (reviewModalType.value === 'Reject') {
    selectedMemo.value.rejectionConcern = '';
    selectedMemo.value.rejectedFields = [];
  } else {
    selectedMemo.value.rejectionConcern = rejectionConcern.value;
    selectedMemo.value.rejectedFields = [...rejectedFields.value];
  }
  selectedMemo.value.status = reviewModalType.value;
  selectedMemo.value.rejectionReason = rejectionReason.value;
  
  const actionText = reviewModalType.value === 'Reject' ? 'Rejected' : 'Requested Changes for';
  alert(`${actionText} Memo ${selectedMemo.value?.memoNumber}`);
  isReviewModalOpen.value = false;
  closeViewModal();
};

const handleUpdate = () => {
  if (isCreateMode.value) {
    alert(`Created New Memo: ${selectedMemo.value.title}`);
    // In a real app: emit('create-memo', selectedMemo.value);
  } else {
    alert(`Updated Memo ${selectedMemo.value?.memoNumber}`);
    // In a real app: emit('update-memo', selectedMemo.value);
  }
  closeViewModal();
};

const handleDelete = (memo) => {
  const isConfirmed = window.confirm(`Are you sure you want to delete Memo ${memo.memoNumber}? This action cannot be undone.`);
  if (isConfirmed) {
    alert(`Deleted Memo ${memo.memoNumber}`);
    // In a real app: emit('delete-memo', memo.id);
  }
};

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'status-approved';
    case 'rejected': return 'status-rejected';
    case 'pending': return 'status-pending';
    case 'requested changes': return 'status-requested-changes';
    default: return 'status-default';
  }
};

const handleRemind = (memo) => {
  alert(`Reminder sent to approvers for Memo ${memo.memoNumber}`);
};

const getActions = (memo) => {
  // Check if current user is involved (Requester or Approver)
  const isRequester = memo.requester === props.currentUser;
  const isApprover = memo.approvalChain?.some(tier => 
    tier.approvers?.some(a => a.name === props.currentUser)
  );

  // If not involved, only allow "view"
  if (!isRequester && !isApprover) {
    return ['view'];
  }

  if (memo.status === 'Approved') return ['view'];
  if (memo.status === 'Pending') {
    const actions = ['view'];
    
    // Logic for Remind: if requester and pending > 3 days
    if (isRequester) {
      const created = new Date(memo.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 3) {
        actions.push('remind');
      }
    }

    // Check if the first tier is still pending
    const tier1 = memo.approvalChain && memo.approvalChain[0];
    
    if (tier1) {
      // If the first tier has any pending approvers, it's generally still in tier 1
      const isTier1Pending = tier1.approvers?.some(a => a.status === 'Pending');
      
      if (isTier1Pending) {
        // New Rule: If Tier 1 is quorum, and at least 1 person HAS approved, show VIEW ONLY
        if (tier1.type === 'quorum') {
          const hasAnyApproved = tier1.approvers?.some(a => a.status === 'Approved');
          if (hasAnyApproved) {
            return actions;
          }
        }
        
        // Otherwise, it's fully pending at Tier 1 -> View, Edit, Delete
        // Only requester can delete/edit usually, but we check involvement above
        actions.push('delete');
        return actions;
      }
    }
    
    // Pending on second tier or later
    return actions;
  }
  if (memo.status === 'Rejected') {
    return ['view'];
  }
  if (memo.status === 'Requested Changes') {
    return ['view', 'update'];
  }
  return ['view']; // Default fallback
};

const getHistoryColor = (action) => {
  const a = action.toLowerCase();
  if (a.includes('approve')) return 'text-green-600';
  if (a.includes('reject')) return 'text-red-600';
  if (a.includes('requested')) return 'text-amber-600';
  if (a.includes('create')) return 'text-blue-600';
  if (a.includes('update')) return 'text-indigo-600';
  return 'text-gray-600';
};

const getHistoryDotColor = (action) => {
  const a = action.toLowerCase();
  if (a.includes('approve')) return 'bg-green-500';
  if (a.includes('reject')) return 'bg-red-500';
  if (a.includes('requested')) return 'bg-amber-500';
  if (a.includes('create')) return 'bg-blue-500';
  if (a.includes('update')) return 'bg-indigo-500';
  return 'bg-gray-400';
};
</script>

<template>
  <div class="memo-list-container">
    <div class="table-responsive">
      <table class="simple-table">
        <thead>
          <tr>
            <th>Memo#</th>
            <th>Title</th>
            <th>Requester</th>
            <th>Created At</th>
            <th>Status</th>
            <th>Approval Chain</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="memo in processedMemos"
            :key="memo.id"
            class="memo-row"
            :class="{ 'row-selected': selectedRow && selectedRow.id === memo.id }"
            @mousedown="handlePressStart(memo)"
            @mouseup="handlePressEnd"
            @mouseleave="handlePressEnd"
            @touchstart="handlePressStart(memo)"
            @touchend="handlePressEnd"
            @touchcancel="handlePressEnd"
            @contextmenu="isMobile ? $event.preventDefault() : null"
            @click="handleRowClick(memo)"
          >
            <td class="num-col" data-label="Memo#">{{ memo.memoNumber }}</td>
            <td class="title-col" data-label="Title">
              <div class="memo-title">{{ memo.title }}</div>
            </td>
            <td data-label="Requester">
              <div class="font-medium text-gray-900">
                {{ memo.requester }}
                <span v-if="memo.requester === currentUser" class="text-muted italic text-xs ml-1">(you)</span>
              </div>
              <div class="text-xs text-muted mt-0.5">{{ memo.department }}</div>
            </td>
            <td class="date-col" data-label="Created">{{ formatDate(memo.createdAt) }}</td>
            <td data-label="Status">
              <span class="status-badge" :class="getStatusColor(memo.status)">{{ memo.status }}</span>
            </td>
            <td class="approvers-col" data-label="Chain">
              <div class="approval-chain">
                <template v-for="(tier, tierIdx) in memo.approvalChain" :key="tierIdx">
                  <!-- Tier Container -->
                  <div class="tier-group" :class="{'is-quorum': tier.approvers.length > 1}">
                    <!-- Quorum Label (if applicable) -->
                    <div v-if="tier.approvers.length > 1" class="tier-label">
                      {{ tier.type === 'quorum' ? `Any ${tier.requiredApprovals} of ${tier.approvers.length}` : 'All Required' }}
                    </div>
                    <div class="tier-nodes">
                      <template v-for="(approver, approverIdx) in tier.approvers" :key="approverIdx">
                        <div class="approver-node-compact" :class="getStatusColor(approver.status)">
                          <span class="approver-initials">{{ approver.name.substring(0, 1) }}</span>
                          <div class="approver-tooltip">
                            <div class="tooltip-name">{{ approver.name }}</div>
                            <div class="tooltip-role">{{ approver.role }}</div>
                            <div class="tooltip-status" :class="getStatusColor(approver.status)">{{ approver.status }}</div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                  <div v-if="tierIdx < memo.approvalChain.length - 1" class="chain-connector-compact">
                    <ChevronRight class="chain-arrow-compact" />
                  </div>
                </template>
              </div>
            </td>
            
            <!-- Row Action Overlay (Moved to tr level for structural stability) -->
            <Transition name="fade">
              <div 
                v-if="selectedRow && selectedRow.id === memo.id" 
                class="row-action-overlay" 
                @click.stop 
                @touchstart.stop 
                @mousedown.stop
                draggable="false"
              >
                <div class="overlay-buttons" draggable="false">
                  <button class="overlay-btn view" @click="openViewModal(memo, false)" draggable="false">
                    <Eye class="icon-small" /> View
                  </button>
                  <button v-if="getActions(memo).includes('update')" class="overlay-btn edit" @click="openViewModal(memo, true)" draggable="false">
                    <Edit class="icon-small" /> Update
                  </button>
                  <button v-if="getActions(memo).includes('edit')" class="overlay-btn edit" @click="openViewModal(memo, true)" draggable="false">
                    <Edit class="icon-small" /> Edit
                  </button>
                  <button v-if="getActions(memo).includes('delete')" class="overlay-btn delete" @click="handleDelete(memo)" draggable="false">
                    <Trash2 class="icon-small" /> Delete
                  </button>
                  <button v-if="getActions(memo).includes('remind')" class="overlay-btn remind" @click.stop="handleRemind(memo)" draggable="false">
                    <Bell class="icon-small" /> Remind
                  </button>
                  <button class="overlay-btn-close" @click="selectedRow = null" draggable="false">
                    <X class="icon-small" />
                  </button>
                </div>
              </div>
            </Transition>
          </tr>
          <tr v-if="processedMemos.length === 0">
            <td colspan="6" class="empty-state">No memos found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls (Desktop) -->
    <div v-if="memos.length > 0 && !isMobile" class="pagination-bar">
      <div class="pagination-info">
        Showing 
        <span class="font-bold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> 
        to 
        <span class="font-bold">{{ Math.min(currentPage * itemsPerPage, memos.length) }}</span> 
        of 
        <span class="font-bold">{{ memos.length }}</span> 
        entries
      </div>
      
      <div class="pagination-controls">
        <div class="page-size-selector">
          <label>Show</label>
          <select v-model="itemsPerPage" @change="currentPage = 1" class="page-select">
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>

        <div class="page-buttons">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1" 
            @click="goToPage(currentPage - 1)"
          >
            Previous
          </button>
          
          <template v-for="page in totalPages" :key="page">
            <button 
              v-if="Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages"
              class="page-btn"
              :class="{ 'active': page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else-if="page === 2 || page === totalPages - 1" class="page-dots">...</span>
          </template>

          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages" 
            @click="goToPage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Load More Control (Mobile Lazy Load) -->
    <div v-if="isMobile && currentPage < totalPages" class="mobile-load-more">
      <button class="btn-load-more" @click="loadMore">
        Load More Memos
        <Plus class="icon-small" />
      </button>
      <div class="load-more-info">
        Showing {{ processedMemos.length }} of {{ memos.length }}
      </div>
    </div>



    <!-- ─── New Memo Wizard ─────────────────────────────────────────────── -->
    <div v-if="isWizardOpen" class="modal-overlay" @click.self="closeWizard">
      <div class="wizard-modal">

        <!-- Step 1: Division Selection -->
        <template v-if="wizardStep === 1">
          <div class="wizard-header">
            <div>
              <div class="wizard-step-label">Step 1 of 2</div>
              <h2 class="wizard-title">Select Division</h2>
            </div>
            <button class="btn-close" @click="closeWizard"><X class="icon" /></button>
          </div>
          <div class="wizard-body">
            <!-- Wizard Search -->
            <div class="wizard-search-container">
              <div class="search-input-wrapper">
                <Search class="search-icon" />
                <input 
                  v-model="wizardSearch" 
                  type="text" 
                  placeholder="Search templates (e.g. 'Cash', 'Reimburse')..." 
                  class="wizard-search-input"
                  autofocus
                />
                <button v-if="isSearchingInWizard" class="btn-clear-search" @click="wizardSearch = ''">
                  <X class="icon-tiny" />
                </button>
              </div>
            </div>

            <div v-if="!isSearchingInWizard" class="division-grid">
              <button
                v-for="div in divisions"
                :key="div.name"
                class="division-card"
                :style="{ '--div-color': div.color, '--div-bg': div.bg, '--div-border': div.borderColor }"
                @click="selectWizardDivision(div.name)"
              >
                <div class="division-icon-wrap">
                  <component :is="div.component" class="division-icon" />
                </div>
                <div class="division-info">
                  <div class="division-name">{{ div.name }}</div>
                  <div class="division-count">{{ div.count }} template{{ div.count > 1 ? 's' : '' }}</div>
                </div>
                <ChevronRight class="division-arrow" />
              </button>
            </div>

            <!-- Search Results -->
            <div v-else class="template-list search-results">
              <div class="search-results-meta">
                Found {{ wizardFilteredTemplates.length }} templates matching "{{ wizardSearch }}"
              </div>
              <button
                v-for="(tpl, idx) in wizardFilteredTemplates"
                :key="idx"
                class="template-item"
                @click="selectWizardTemplate(tpl)"
              >
                <div class="template-item-content">
                  <div class="template-item-name">{{ tpl.name }}</div>
                  <div class="template-item-division">{{ tpl.division }}</div>
                </div>
                <ChevronRight class="template-item-arrow" />
              </button>
              <div v-if="wizardFilteredTemplates.length === 0" class="search-empty">
                No templates found for "{{ wizardSearch }}"
              </div>
            </div>
          </div>
        </template>

        <!-- Step 2: Template Selection -->
        <template v-else>
          <div class="wizard-header">
            <div class="wizard-header-left">
              <button class="btn-back" @click="wizardStep = 1">
                <ArrowLeft class="icon" />
              </button>
              <div>
                <div class="wizard-step-label">Step 2 of 2</div>
                <h2 class="wizard-title">{{ wizardDivision }}</h2>
              </div>
            </div>
            <button class="btn-close" @click="closeWizard"><X class="icon" /></button>
          </div>
          <div class="wizard-body">
            <div class="template-list">
              <button
                v-for="(tpl, idx) in wizardDivisionTemplates"
                :key="idx"
                class="template-item"
                @click="selectWizardTemplate(tpl)"
              >
                <div class="template-item-name">{{ tpl.name }}</div>
                <ChevronRight class="template-item-arrow" />
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>

    <!-- View/Edit/Create Memo Modal -->

    <div v-if="isModalOpen && selectedMemo" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 v-if="isCreateMode">New Memo Request</h2>
          <h2 v-else>{{ isEditMode ? 'Edit Memo' : 'Memo Details' }}</h2>
          <button class="btn-close" @click="closeViewModal">
            <X class="icon" />
          </button>
        </div>
        <div class="modal-body">
          <!-- Section 1: Core Information -->
          <div class="detail-section">
            <h3 class="section-group-title">General Information</h3>
            <div class="detail-row">
              <div v-if="!isCreateMode" class="detail-group">
                <label>Memo Number</label>
                <div class="detail-value font-mono">{{ selectedMemo.memoNumber }}</div>
              </div>
              <div class="detail-group">
                <label>Department</label>
                <div class="detail-value">{{ selectedMemo.department }}</div>
              </div>
            </div>

            <div class="detail-row">
              <div v-if="!isCreateMode" class="detail-group">
                <label>Created At</label>
                <div class="detail-value">{{ formatDate(selectedMemo.createdAt) }}</div>
              </div>
              <div v-if="!isCreateMode" class="detail-group">
                <label>Status</label>
                <div class="detail-value">
                   <span class="status-badge" :class="getStatusColor(selectedMemo.status)">{{ selectedMemo.status }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-group">
              <label>Template</label>
              <div v-if="isEditMode" class="autocomplete-wrapper">
                <input
                  ref="templateInputRef"
                  type="text"
                  class="form-input"
                  placeholder="Search template by name or division..."
                  v-model="templateSearch"
                  @focus="handleTemplateFocus"
                  @blur="handleTemplateBlur"
                  @input="handleTemplateInput"
                  autocomplete="off"
                />
                <Teleport to="body">
                  <div
                    v-if="showSuggestions"
                    class="suggestions-dropdown-teleport"
                    :style="dropdownStyle"
                  >
                    <template v-if="filteredTemplates.length > 0">
                      <div
                        v-for="(item, idx) in filteredTemplates"
                        :key="idx"
                        class="suggestion-item"
                        @mousedown.prevent="selectTemplate(item)"
                      >
                        <span class="suggestion-name">{{ item.name }}</span>
                        <span class="suggestion-division">{{ item.division }}</span>
                      </div>
                    </template>
                    <div v-else class="suggestion-empty">No templates found</div>
                  </div>
                </Teleport>
              </div>
              <div v-else class="detail-value">
                <div class="font-semibold">{{ selectedMemo.categoryType || '-' }}</div>
                <div v-if="selectedMemo.category" class="template-division-badge">{{ selectedMemo.category }}</div>
              </div>
            </div>
          </div>

          <!-- Section 2: Content -->
          <template v-if="!isCreateMode || (selectedMemo.category && selectedMemo.categoryType)">
            <div class="detail-section">
              <h3 class="section-group-title">Memo Content</h3>
              <div class="detail-group">
                <label>Title</label>
                <input v-if="isEditMode" type="text" v-model="selectedMemo.title" class="form-input" />
                <div v-else class="detail-value font-semibold text-lg">{{ selectedMemo.title }}</div>
              </div>
              <div class="detail-group">
                <label>Description</label>
                <textarea v-if="isEditMode" v-model="selectedMemo.description" class="form-textarea" rows="4"></textarea>
                <div v-else class="detail-value leading-relaxed">{{ selectedMemo.description }}</div>
              </div>
              <!-- Attachments Section -->
              <div class="detail-group mt-4 attachments-collapsible">
                <button class="section-toggle-header" @click="isAttachmentsCollapsed = !isAttachmentsCollapsed">
                  <label class="m-0 cursor-pointer">Attachments ({{ selectedMemo.attachmentsCount }})</label>
                  <div class="history-toggle-icon" :class="{ 'is-open': !isAttachmentsCollapsed }">
                    <ChevronRight class="icon-small" />
                  </div>
                </button>

                <div v-if="!isAttachmentsCollapsed" class="history-content-wrap mt-3">
                  <div v-if="selectedMemo.attachmentsCount > 0" class="attachments-grid">
                    <div v-for="n in selectedMemo.attachmentsCount" :key="n" class="attachment-card" :class="{'is-edit': isEditMode}">
                      <div class="attachment-icon-box">
                        <FileText class="attachment-icon-large" />
                      </div>
                      <span class="attachment-name">Doc #{{ n }}</span>
                      <button v-if="isEditMode" class="btn-remove-attachment-abs" title="Remove" @click.prevent="selectedMemo.attachmentsCount--">
                        <X class="icon-tiny" />
                      </button>
                    </div>
                  </div>
                  <div v-else class="detail-value text-muted italic">No attachments included.</div>
                  
                  <div v-if="isEditMode" class="mt-3">
                     <button class="btn-upload" @click.prevent="selectedMemo.attachmentsCount++">
                       <Plus class="icon-small" /> Add Document
                     </button>
                  </div>
                </div>
              </div>
            </div>


            <!-- Section 3: Category Specific (if Entertainment) -->
            <div v-if="selectedMemo.categoryType === 'Entertainment Fund'" class="detail-section">
              <h3 class="section-group-title">Entertainment Details</h3>
              
              <div class="detail-group">
                <label>Location</label>
                <input v-if="isEditMode" type="text" v-model="selectedMemo.entLocation" class="form-input" placeholder="Type a place or click the map to pin a location..." />

                <div class="map-container mt-2">
                  <MapPicker
                    :locationQuery="isEditMode ? selectedMemo.entLocation : ''"
                    :lat="selectedMemo.entLat"
                    :lng="selectedMemo.entLng"
                    :editable="isEditMode"
                    @place-selected="handlePlaceSelected"
                  />
                </div>
                <div v-if="!isEditMode && !selectedMemo.entLat" class="detail-value text-muted italic">No location provided</div>
              </div>

              <div class="detail-row">
                <div class="detail-group">
                  <label>Payment Method</label>
                  <select v-if="isEditMode" v-model="selectedMemo.entPaymentMethod" class="form-select">
                    <option value="Debit/Cash">Debit/Cash</option>
                    <option value="Credit">Credit</option>
                    <option value="Debit/Cash and Credit">Debit/Cash and Credit</option>
                  </select>
                  <div v-else class="detail-value font-medium">{{ selectedMemo.entPaymentMethod || '-' }}</div>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-group" v-if="['Debit/Cash', 'Debit/Cash and Credit'].includes(selectedMemo.entPaymentMethod)">
                  <label>Debit/Cash Amount</label>
                   <div class="input-with-prefix" v-if="isEditMode">
                     <span class="prefix">Rp</span>
                     <input type="number" v-model="selectedMemo.entDebitAmount" class="form-input" />
                   </div>
                   <div v-else class="detail-value font-bold text-blue-600">Rp {{ selectedMemo.entDebitAmount ? Number(selectedMemo.entDebitAmount).toLocaleString('id-ID') : '0' }}</div>
                </div>
                
                <div class="detail-group" v-if="['Credit', 'Debit/Cash and Credit'].includes(selectedMemo.entPaymentMethod)">
                  <label>Credit Amount</label>
                   <div class="input-with-prefix" v-if="isEditMode">
                     <span class="prefix">Rp</span>
                     <input type="number" v-model="selectedMemo.entCreditAmount" class="form-input" />
                   </div>
                   <div v-else class="detail-value font-bold text-blue-600">Rp {{ selectedMemo.entCreditAmount ? Number(selectedMemo.entCreditAmount).toLocaleString('id-ID') : '0' }}</div>
                </div>
              </div>

              <h4 class="subsection-title mt-4">Person to be Entertained</h4>
              <div class="detail-row">
                <div class="detail-group">
                  <label>Name</label>
                  <input v-if="isEditMode" type="text" v-model="selectedMemo.entPersonName" class="form-input" />
                  <div v-else class="detail-value font-medium">{{ selectedMemo.entPersonName || '-' }}</div>
                </div>
                <div class="detail-group">
                  <label>Company</label>
                  <input v-if="isEditMode" type="text" v-model="selectedMemo.entPersonCompany" class="form-input" />
                  <div v-else class="detail-value">{{ selectedMemo.entPersonCompany || '-' }}</div>
                </div>
              </div>
              <div class="detail-group">
                <label>Role</label>
                <input v-if="isEditMode" type="text" v-model="selectedMemo.entPersonRole" class="form-input" />
                <div v-else class="detail-value text-slate-600">{{ selectedMemo.entPersonRole || '-' }}</div>
              </div>
            </div>

            <!-- Section 4: Rejection/Changes (Conditional) -->
            <div v-if="!isCreateMode && ['Rejected', 'Requested Changes'].includes(selectedMemo.status) && selectedMemo.rejectionReason" 
                 :class="['detail-section', selectedMemo.status === 'Rejected' ? 'rejection-alert-new' : 'requested-changes-alert-new']">
              <h3 class="section-group-title" :class="selectedMemo.status === 'Rejected' ? 'text-red-700' : 'text-amber-700'">
                <component :is="selectedMemo.status === 'Rejected' ? X : Loader2" class="icon-small mr-1" /> 
                {{ selectedMemo.status === 'Rejected' ? 'Rejection Details' : 'Requested Changes' }}
              </h3>
              <div class="detail-row">
                <div class="detail-group">
                  <label>Concerning</label>
                  <div class="detail-value font-semibold" :class="selectedMemo.status === 'Rejected' ? 'text-red-700' : 'text-amber-700'">
                    {{ selectedMemo.rejectionConcern || 'Not specified' }}
                  </div>
                </div>
                <div class="detail-group" v-if="selectedMemo.rejectedFields && selectedMemo.rejectedFields.length > 0">
                  <label>Flagged Fields</label>
                  <div class="flagged-fields-list mt-1">
                    <span v-for="field in selectedMemo.rejectedFields" :key="field" 
                          :class="['flagged-field-badge', selectedMemo.status === 'Rejected' ? 'badge-red' : 'badge-amber']">
                      {{ field }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="detail-group mt-3">
                <label>{{ selectedMemo.status === 'Rejected' ? 'Reason for Rejection' : 'Request Details' }}</label>
                <div class="detail-value" :class="selectedMemo.status === 'Rejected' ? 'text-red-900' : 'text-amber-900'">
                  {{ selectedMemo.rejectionReason }}
                </div>
              </div>
            </div>

            <!-- Section 5: Workflow & Files -->
            <div class="detail-section">
              <h3 class="section-group-title">Workflow & History</h3>
              
              <div v-if="!isCreateMode" class="detail-group" style="position: relative; z-index: 10;">
                <label>Approval Chain</label>
                <div class="modal-approval-chain-container">
                  <div class="modal-approval-chain">
                    <template v-for="(tier, tierIdx) in selectedMemo.approvalChain" :key="tierIdx">
                      <div class="tier-group" :class="{'is-quorum': tier.approvers.length > 1}">
                        <div v-if="tier.approvers.length > 1" class="tier-label">
                          {{ tier.type === 'quorum' ? `Any ${tier.requiredApprovals} of ${tier.approvers.length}` : 'All Required' }}
                        </div>
                        <div class="tier-nodes">
                          <template v-for="(approver, approverIdx) in tier.approvers" :key="approverIdx">
                            <div class="approver-node-compact" :class="getStatusColor(approver.status)">
                              <span class="approver-initials">{{ approver.name.substring(0, 1) }}</span>
                              <div class="approver-tooltip">
                                <div class="tooltip-name">{{ approver.name }}</div>
                                <div class="tooltip-role">{{ approver.role }}</div>
                                <div class="tooltip-status" :class="getStatusColor(approver.status)">{{ approver.status }}</div>
                              </div>
                            </div>
                          </template>
                        </div>
                      </div>
                      <div v-if="tierIdx < selectedMemo.approvalChain.length - 1" class="chain-connector-compact">
                        <ChevronRight class="chain-arrow-compact" />
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- History Section -->
              <div v-if="!isCreateMode && selectedMemo.history && selectedMemo.history.length > 0" class="mt-4 history-collapsible border-t pt-4 border-dashed border-slate-200">
                <button class="section-toggle-header" @click="isHistoryCollapsed = !isHistoryCollapsed">
                  <h3 class="section-group-title m-0">Memo History</h3>
                <div class="history-toggle-icon" :class="{ 'is-open': !isHistoryCollapsed }">
                  <ChevronRight class="icon-small" />
                </div>
              </button>
              
              <div v-if="!isHistoryCollapsed" class="history-content-wrap mt-4">
                <div class="history-timeline">
                  <div v-for="(item, idx) in selectedMemo.history" :key="idx" class="timeline-item">
                    <div class="timeline-visual">
                      <div class="timeline-dot" :class="getHistoryDotColor(item.action)"></div>
                      <div v-if="idx < selectedMemo.history.length - 1" class="timeline-connector"></div>
                    </div>
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <span class="timeline-action" :class="getHistoryColor(item.action)">{{ item.action }}</span>
                        <span class="timeline-date">{{ formatDate(item.at) }}</span>
                      </div>
                      <div class="timeline-user">
                        <span class="font-semibold text-slate-800">{{ item.user }}</span>
                        <span v-if="item.user === currentUser" class="text-xs italic text-slate-400 ml-1">(you)</span>
                      </div>
                      <div v-if="item.note" class="timeline-note mt-1">
                        {{ item.note }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
        <div class="modal-footer">
          <div v-if="!isEditMode && activeTab === 'pending_approval' && selectedMemo.status === 'Pending'" class="modal-actions-left">
            <button class="btn-success" @click="handleApprove">Approve</button>
            <button class="btn-warning" @click="handleRequestChanges">Request Changes</button>
            <button class="btn-danger" @click="handleReject">Reject</button>
          </div>
          
          <template v-if="isEditMode">
            <button class="btn-secondary" @click="closeViewModal">Cancel</button>
            <button class="btn-primary" @click="handleUpdate">{{ isCreateMode ? 'Submit Request' : 'Update Memo' }}</button>
          </template>
          <template v-else>
            <button v-if="getActions(selectedMemo).includes('remind')" class="btn-remind" @click="handleRemind(selectedMemo)">
              <Bell class="icon-small mr-1" /> Remind Approvers
            </button>
            <button class="btn-secondary ml-2" @click="closeViewModal">Close</button>
          </template>
        </div>
      </div>
    </div>

    <!-- Review Action Modal (Reject / Request Changes) -->
    <div v-if="isReviewModalOpen" class="modal-overlay" style="z-index: 1050;" @click.self="cancelReviewAction">
      <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header">
          <h2>{{ reviewModalType === 'Reject' ? 'Reject Memo' : 'Request Changes' }}</h2>
          <button class="btn-close" @click="cancelReviewAction"><X class="icon" /></button>
        </div>
        <div class="modal-body">
          <template v-if="reviewModalType === 'Requested Changes'">
            <div class="detail-group">
              <label>Concerning (Optional)</label>
              <select v-model="rejectionConcern" class="form-select">
                <option value="" disabled>Select the type of concern...</option>
                <option v-for="c in rejectionConcernsList" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            
            <div class="detail-group mt-3">
              <label>Concerning Fields (Optional)</label>
              <div class="checkbox-grid">
                <label v-for="field in memoFieldsToReject" :key="field" class="checkbox-label">
                  <input type="checkbox" :value="field" v-model="rejectedFields" class="form-checkbox">
                  <span>{{ field }}</span>
                </label>
              </div>
            </div>
          </template>

          <div class="detail-group" :class="{ 'mt-3': reviewModalType === 'Requested Changes' }">
            <label>{{ reviewModalType === 'Reject' ? 'Rejection Reason Details' : 'Requested Changes Details' }} <span class="text-red-500">*</span></label>
            <textarea v-model="rejectionReason" class="form-textarea" rows="4" 
                      :placeholder="reviewModalType === 'Reject' ? 'Explain why this cannot be approved...' : 'Describe what needs to be changed...'"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelReviewAction">Cancel</button>
          <button :class="reviewModalType === 'Reject' ? 'btn-danger' : 'btn-primary' + ' ml-2'" 
                  @click="confirmReviewAction">
            {{ reviewModalType === 'Reject' ? 'Confirm Rejection' : 'Confirm Request' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.memo-list-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.simple-table th {
  background-color: #f8fafc;
  padding: 1rem;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.simple-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.simple-table tr:hover td {
  background-color: #f1f5f9;
}

.memo-row {
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  user-select: none;
  -webkit-touch-callout: none; /* Disable native context menu on iOS */
}

.memo-row.row-selected td {
  background-color: #eff6ff !important;
  border-bottom-color: #3b82f6;
}

.num-col {
  font-family: monospace;
  color: #64748b;
  font-weight: 600;
}

.title-col {
  max-width: 300px;
}

.memo-title {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.memo-desc {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.4;
  /* Truncate desc if too long */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date-col {
  color: #475569;
  font-size: 0.85rem;
  white-space: nowrap;
}

.center-col {
  text-align: center;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-approved { background: #dcfce7; color: #15803d; }
.status-rejected { background: #fee2e2; color: #b91c1c; }
.status-pending { background: #f1f5f9; color: #64748b; } /* Switched to Gray */
.status-requested-changes { background: #fef9c3; color: #854d0e; } /* Yellow/Amber remains correct */
.status-default { background: #f1f5f9; color: #475569; }

/* Compact Approver Chain */
.approvers-col {
  min-width: 150px;
}

.approval-chain {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tier-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.tier-group.is-quorum {
  padding: 0.35rem 0.5rem 0.25rem 0.75rem;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px dashed #cbd5e1;
}

.tier-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.2rem;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.tier-nodes {
  display: flex;
  align-items: center;
}

.approver-node-compact {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 1px #cbd5e1;
  background: white;
  cursor: pointer;
  transition: transform 0.2s, z-index 0.2s;
  z-index: 1;
}

/* Overlap effect */
.approver-node-compact:not(:first-child) {
  margin-left: -8px;
}

.approver-node-compact:hover {
  transform: translateY(-2px);
  z-index: 10;
}

.approver-initials {
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
}

/* Colored Rings based on status */
.approver-node-compact.status-approved {
  box-shadow: 0 0 0 2px #10b981;
  background: #ecfdf5;
}
.approver-node-compact.status-approved .approver-initials { color: #059669; }

.approver-node-compact.status-rejected {
  box-shadow: 0 0 0 2px #ef4444;
  background: #fef2f2;
}
.approver-node-compact.status-rejected .approver-initials { color: #dc2626; }

.approver-node-compact.status-pending {
  box-shadow: 0 0 0 2px #cbd5e1;
  background: #f8fafc;
}
.approver-node-compact.status-pending .approver-initials { color: #64748b; }

.approver-node-compact.status-requested-changes {
  box-shadow: 0 0 0 2px #fde047;
  background: #fef9c3;
}
.approver-node-compact.status-requested-changes .approver-initials { color: #854d0e; }

/* Tooltip */
.approver-tooltip {
  position: absolute;
  top: calc(100% + 12px); /* Render BELOW the node in the modal */
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: #0f172a; /* Darker navy */
  color: white;
  padding: 0.6rem 0.85rem;
  border-radius: 8px; /* Softer corners */
  font-size: 0.75rem;
  white-space: normal; /* Allow wrapping */
  width: max-content;
  max-width: 180px; /* Prevent it from being too wide */
  text-align: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1000; /* Max z-index for absolute visibility */
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.approver-tooltip::after {
  content: '';
  position: absolute;
  bottom: 100%; /* Arrow on TOP pointing UP */
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent #0f172a transparent;
}

.approver-node-compact:hover .approver-tooltip,
.approver-node-compact:active .approver-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.tooltip-name {
  font-weight: 600;
}

.tooltip-role {
  color: #94a3b8;
  font-size: 0.65rem;
}

.tooltip-status {
  margin-top: 0.25rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: bold;
}

.tooltip-status.status-approved { background: rgba(16, 185, 129, 0.2); color: #059669; }
.tooltip-status.status-rejected { background: rgba(239, 68, 68, 0.2); color: #dc2626; }
.tooltip-status.status-pending { background: rgba(148, 163, 184, 0.2); color: #64748b; }
.tooltip-status.status-requested-changes { background: rgba(245, 158, 11, 0.2); color: #d97706; }

.chain-connector-compact {
  display: flex;
  align-items: center;
  color: #94a3b8;
  margin-left: 0.15rem;
}

.chain-arrow-compact {
  width: 14px;
  height: 14px;
}

.action-col {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #64748b;
}

.btn-icon .icon {
  width: 16px;
  height: 16px;
}

.btn-view:hover {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.btn-edit:hover {
  background-color: #f1f5f9;
  color: #eab308;
}

.btn-delete:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

/* Bottom Action Bar */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 250px; /* align with main content, after sidebar */
  right: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  background: #1e293b;
  color: white;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.25);
  flex-wrap: wrap;
}

/* Row Action Overlay */
.row-action-overlay {
  position: absolute;
  inset: 0;
  background: rgba(239, 246, 255, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 1.5rem;
  z-index: 100;
  border-bottom: 2px solid #3b82f6;
  touch-action: none;
  user-select: none;
}

@media (max-width: 768px) {
  .row-action-overlay {
    justify-content: center;
    padding: 0;
  }
}

.overlay-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .overlay-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem;
    width: 100%;
    max-width: 220px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .overlay-btn {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .overlay-btn-close {
    width: 100%;
    justify-content: center;
    padding: 0.75rem !important;
  }
}

.overlay-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.overlay-btn.view   { background: #3b82f6; color: white; }
.overlay-btn.edit   { background: #f59e0b; color: white; }
.overlay-btn.delete { background: #ef4444; color: white; }
.overlay-btn.remind { background: #6366f1; color: white; } /* Indigo for Remind */

.overlay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  filter: brightness(1.1);
}

.overlay-btn-close {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.overlay-btn-close:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 840px; /* Wider for better readability */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px -10px rgba(0,0,0,0.25), 0 8px 16px -6px rgba(0,0,0,0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #f8fafc; /* Subtle background for contrast with sections */
}

.detail-section {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.section-group-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
}

.section-group-title.m-0 { margin: 0; }

.rejection-alert-new {
  background-color: #fef2f2 !important;
  border-color: #fecaca !important;
}

.requested-changes-alert-new {
  background-color: #fffbeb !important;
  border-color: #fef08a !important;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  color: #1e293b;
  font-size: 0.95rem;
  line-height: 1.5;
}

.font-semibold {
  font-weight: 600;
  font-size: 1.1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.modal-approval-chain {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #f8fafc;
}

.modal-actions-left {
  display: flex;
  gap: 0.5rem;
  margin-right: auto;
}

.btn-success {
  padding: 0.5rem 1rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-success:hover {
  background-color: #16a34a;
}

.btn-warning {
  background-color: #f59e0b;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-warning:hover {
  background-color: #d97706;
}

.btn-danger {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  border: none;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 0.5rem;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-remind {
  padding: 0.5rem 1rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.btn-remind:hover {
  background-color: #4f46e5;
}

/* Edit Form Styles */
.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #1e293b;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-textarea {
  resize: vertical;
}

/* Category Specific Fields */
.category-section {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.subsection-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-prefix .prefix {
  position: absolute;
  left: 0.75rem;
  color: #64748b;
  font-weight: 500;
  pointer-events: none;
}

.input-with-prefix .form-input {
  padding-left: 2rem;
}

.text-blue-500 {
  color: #3b82f6;
}

.underline {
  text-decoration: underline;
}

.cursor-pointer {
  cursor: pointer;
}

/* Attachments */
.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.attachment-item.is-edit {
  cursor: default;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attachment-item:hover:not(.is-edit) {
  background-color: #f1f5f9;
}

.attachment-icon {
  width: 14px;
  height: 14px;
  color: #64748b;
}

.icon-small {
  width: 14px;
  height: 14px;
}

.btn-remove-attachment {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-attachment:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px dashed #cbd5e1;
  color: #475569;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #eff6ff;
}

.text-muted {
  color: #94a3b8;
}

.italic {
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

/* Pagination Styles */
.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.page-select {
  padding: 0.35rem 1.5rem 0.35rem 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: white;
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.page-select:focus {
  border-color: #3b82f6;
}

.page-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}

.page-btn.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8fafc;
}

.page-dots {
  padding: 0 0.25rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .pagination-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }
  
  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-buttons {
    width: 100%;
    justify-content: center;
  }
}

.font-bold {
  font-weight: 700;
  color: #1e293b;
}

/* Mobile Load More */
.mobile-load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  background: white;
  border-top: 1px solid #f1f5f9;
}

.btn-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: white;
  border: 2px solid #3b82f6;
  color: #3b82f6;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.btn-load-more:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

.btn-load-more:active {
  transform: translateY(0);
}

.load-more-info {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.icon-small {
  width: 16px;
  height: 16px;
}

/* Attachments Grid Layout */
.attachments-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.attachment-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  text-align: center;
}

.attachment-card:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.attachment-icon-box {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.attachment-icon-large {
  width: 24px;
  height: 24px;
}

.attachment-name {
  font-size: 0.7rem;
  color: #475569;
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-remove-attachment-abs {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.btn-remove-attachment-abs:hover {
  transform: scale(1.1);
  background: #dc2626;
}

.icon-tiny {
  width: 12px;
  height: 12px;
}

/* Modal Approval Chain Widen */
.modal-approval-chain-container {
  width: 100%;
  overflow: visible; /* Prevent clipping of flipped tooltips */
  padding: 0.5rem 0.5rem 4rem 0.5rem; /* Large bottom padding for tooltips */
}

.modal-approval-chain {
  display: inline-flex;
  min-width: 100%;
  align-items: center;
  gap: 0.75rem; /* Space between tiers/arrows */
  justify-content: flex-start;
}

.modal-approval-chain .tier-nodes {
  gap: 0.5rem; /* Space between approver nodes in a tier */
}

.modal-approval-chain .approver-node-compact:not(:first-child) {
  margin-left: 0; /* Clear the overlap from global styles */
}

/* History Collapsible Styles */
.section-toggle-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.history-toggle-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.history-toggle-icon.is-open {
  transform: rotate(90deg);
  background: #e0e7ff;
  color: #4338ca;
}

.history-content-wrap {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* History Timeline Styling */
.history-section {
  border-top: 1px dashed #e2e8f0;
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 1.25rem;
}

.timeline-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 0.35rem;
  z-index: 2;
  box-shadow: 0 0 0 3px white;
}

.timeline-connector {
  flex: 1;
  width: 2px;
  background-color: #f1f5f9;
  margin-top: 2px;
  margin-bottom: 2px;
}

.timeline-content {
  flex: 1;
  padding-bottom: 1.5rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.15rem;
}

.timeline-action {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.timeline-date {
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: monospace;
}

.timeline-user {
  font-size: 0.9rem;
  color: #334155;
}

.timeline-note {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
  padding: 0.5rem 0.75rem;
  background-color: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #e2e8f0;
}

.text-green-600 { color: #16a34a; }
.text-blue-600 { color: #2563eb; }
.text-indigo-600 { color: #4f46e5; }
.text-amber-600 { color: #d97706; }
.text-red-600 { color: #dc2626; }
.bg-green-500 { background-color: #22c55e; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-indigo-500 { background-color: #6366f1; }
.bg-amber-500 { background-color: #f59e0b; }
.bg-red-500 { background-color: #ef4444; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem !important;
  color: #334155 !important;
  cursor: pointer;
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: 500 !important;
}
.form-checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  /* Convert Table to Card Layout on Mobile */
  .simple-table, .simple-table tbody, .simple-table tr, .simple-table td {
    display: block;
    width: 100%;
  }
  
  .simple-table thead {
    display: none; /* Hide headers */
  }
  
  .simple-table tr {
    margin-bottom: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: white;
    padding: 1rem;
    position: relative;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  
  .simple-table td {
    padding: 0.5rem 0;
    border-bottom: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
  }
  
  /* Add simulated headers using data attributes */
  .simple-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #64748b;
    text-align: left;
    margin-right: 1rem;
  }
  
  /* Layout adjustments */
  .title-col {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    margin-bottom: 0.5rem;
    background-color: #f8fafc;
    padding: 0.75rem !important;
    border-radius: 6px;
  }
  
  .title-col::before {
    content: none !important;
  }
  
  .memo-desc {
    -webkit-line-clamp: 3;
    line-clamp: 3;
    margin-top: 0.25rem;
  }
  
  .num-col {
    color: #3b82f6;
    padding-bottom: 0.25rem !important;
  }
  
  .approvers-col {
    min-width: auto;
  }
  
  .action-col {
    margin-top: 0.5rem;
    padding-top: 0.75rem !important;
    border-top: 1px dashed #e2e8f0;
    justify-content: flex-end;
  }
  
  .action-col::before {
    content: none !important; /* HideAction label */
  }

  /* Modal Responsiveness */
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-body {
    padding: 1rem;
    gap: 1rem;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modal-actions-left {
    width: 100%;
    margin-bottom: 0.75rem;
    justify-content: space-between;
  }
  
  .btn-success, .btn-danger {
    flex: 1;
  }

  .modal-footer {
    flex-direction: column;
    padding: 1rem;
  }

  .btn-secondary {
    width: 100%;
  }

  /* Bottom bar spans full width on mobile (no sidebar) */
  .bottom-action-bar {
    left: 0;
  }
}
/* Autocomplete / Intellisense */
.autocomplete-wrapper {
  position: relative;
}

/* Template division badge (view mode) */
.template-division-badge {
  display: inline-flex;
  align-items: center;
  margin-top: 0.2rem;
  font-size: 0.85rem;
  color: #4338ca;
  background: #e0e7ff;
  padding: 4px 10px;
  border-radius: 99px;
  font-weight: 600;
}

/* ─── Wizard ──────────────────────────────────────────────────────────────── */
.wizard-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px -12px rgba(0,0,0,0.28);
  overflow: hidden;
}

.wizard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.wizard-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.wizard-step-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.wizard-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.btn-back {
  background: #f1f5f9;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 0.45rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-back:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.wizard-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.division-grid {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.division-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: var(--div-bg);
  border: 1.5px solid var(--div-border);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: transform 0.15s, box-shadow 0.15s;
}

.division-card:hover {
  transform: translateX(3px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.09);
}

.division-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.division-icon {
  width: 18px;
  height: 18px;
  color: var(--div-color);
}

.division-info { flex: 1; }

.division-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.1rem;
}

.division-count {
  font-size: 0.73rem;
  color: var(--div-color);
  font-weight: 500;
}

.division-arrow {
  width: 15px;
  height: 15px;
  color: #cbd5e1;
  flex-shrink: 0;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.template-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.12s, border-color 0.12s;
  gap: 0.75rem;
}

.template-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.template-item-name {
  font-size: 0.88rem;
  color: #1e293b;
  font-weight: 500;
  flex: 1;
  line-height: 1.4;
  text-align: left;
}

.template-item-arrow {
  width: 14px;
  height: 14px;
  color: #94a3b8;
  flex-shrink: 0;
}

.wizard-search-container {
  padding: 1rem 1.5rem 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.wizard-search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.wizard-search-input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #94a3b8;
}

.btn-clear-search {
  position: absolute;
  right: 0.75rem;
  padding: 0.25rem;
  color: #64748b;
  border-radius: 50%;
  transition: background 0.2s;
}

.btn-clear-search:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.icon-tiny {
  width: 0.875rem;
  height: 0.875rem;
}

.search-results {
  padding: 0.5rem;
}

.search-results-meta {
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
}

.template-item-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.template-item-division {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.search-empty {
  padding: 3rem 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.95rem;
}
</style>

<!-- Global styles for teleported autocomplete dropdown (cannot be scoped) -->
<style>
.suggestions-dropdown-teleport {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  max-height: 260px;
  overflow-y: auto;
}

.suggestions-dropdown-teleport .suggestion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s;
  gap: 0.5rem;
}

.suggestions-dropdown-teleport .suggestion-item:last-child {
  border-bottom: none;
}

.suggestions-dropdown-teleport .suggestion-item:hover {
  background: #eff6ff;
}

.suggestions-dropdown-teleport .suggestion-name {
  font-size: 0.875rem;
  color: #1e293b;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestions-dropdown-teleport .suggestion-division {
  font-size: 0.7rem;
  color: #4338ca;
  background: #e0e7ff;
  padding: 2px 8px;
  border-radius: 99px;
  white-space: nowrap;
  flex-shrink: 0;
  font-weight: 500;
}

.suggestions-dropdown-teleport .suggestion-empty {
  padding: 0.85rem;
  font-size: 0.875rem;
  color: #94a3b8;
  text-align: center;
}
</style>
