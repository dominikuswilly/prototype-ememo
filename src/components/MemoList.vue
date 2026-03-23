<script setup>
import { ref, defineProps, defineExpose, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import {
  ChevronRight, Eye, Edit, Trash2, X, Paperclip, Plus, ArrowLeft, DollarSign, FileText, Shield, Building2, Users, Monitor, Briefcase, Wrench, Loader2, Bell, Search, Calendar,
  CheckCircle, Clock, AlertCircle, FileEdit, Hash, User, Layout, Layers, Check, XCircle
} from 'lucide-vue-next';
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
    default: 'Willy'
  }
});

const isModalOpen = ref(false);
const isEditMode = ref(false);
const isCreateMode = ref(false);
const selectedMemo = ref(null);
const selectedRow = ref(null);
const isHistoryCollapsed = ref(true);
const isAttachmentsCollapsed = ref(true);
const isConfirming = ref(false);

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(12);
const pageSizeOptions = [4, 8, 12, 16, 20, 24, 48];

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

const dragSourceId = ref(null);

const onDragStart = (id) => {
  dragSourceId.value = id;
};

const onDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};

const onDrop = (targetId) => {
  if (dragSourceId.value === targetId) return;

  const sourceIdx = memosCopy.value.findIndex(m => m.id === dragSourceId.value);
  const targetIdx = memosCopy.value.findIndex(m => m.id === targetId);

  if (sourceIdx !== -1 && targetIdx !== -1) {
    const [movedItem] = memosCopy.value.splice(sourceIdx, 1);
    memosCopy.value.splice(targetIdx, 0, movedItem);
    // In a real app, we would emit('reorder', memosCopy.value) or sync with backend
  }
  dragSourceId.value = null;
};

const memosCopy = ref([]);
watch(() => props.memos, (newMemos) => {
  memosCopy.value = [...newMemos];
}, { immediate: true });

const processedMemos = computed(() => {
  if (isMobile.value) {
    // Lazy load: Show everything from page 1 up to current page
    return memosCopy.value.slice(0, currentPage.value * itemsPerPage.value);
  }
  // Standard pagination: Show only the current page
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return memosCopy.value.slice(start, end);
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
const memoFieldsToReject = computed(() => {
  if (!selectedMemo.value) return [];
  const fields = ['Title', 'Description'];

  const type = selectedMemo.value.categoryType;

  if (type === 'Entertainment Fund') {
    fields.push('Location');
    fields.push('Amount');
  } else if (type === 'Pengajuan Perjalanan Dinas') {
    fields.push('Timeline');
  } else if (isHrTemplate(type)) {
    fields.push('Employee Info');
    if (selectedMemo.value.hrSalaryChange === 'yes') {
      fields.push('Salary Details');
    }
  } else if (selectedMemo.value.entDebitAmount || selectedMemo.value.entCreditAmount) {
    fields.push('Amount');
  }

  fields.push('Attachments');
  return fields;
});

const getFieldValue = (fieldName) => {
  if (!selectedMemo.value) return '';
  switch (fieldName) {
    case 'Title': return selectedMemo.value.title;
    case 'Description': return selectedMemo.value.description;
    case 'Location': return selectedMemo.value.entLocation || selectedMemo.value.hrBranch || '-';
    case 'Amount': {
      const amt = (Number(selectedMemo.value.entDebitAmount || 0) + Number(selectedMemo.value.entCreditAmount || 0));
      return amt > 0 ? `Rp ${amt.toLocaleString('id-ID')}` : '-';
    }
    case 'Timeline': return `${selectedMemo.value.travStartDate || '?'} to ${selectedMemo.value.travEndDate || '?'}`;
    case 'Employee Info': return selectedMemo.value.hrName || 'Not specified';
    case 'Salary Details': {
      const total = Number(selectedMemo.value.newSalary?.basic || 0) +
        Number(selectedMemo.value.newSalary?.allowance || 0) +
        Number(selectedMemo.value.newSalary?.position || 0);
      return `Total Rp ${total.toLocaleString('id-ID')}`;
    }
    case 'Attachments': return `${selectedMemo.value.attachmentsCount || 0} files`;
    default: return '';
  }
};

const templateList = [
  // Accounting & Finance
  { name: 'Cash Advance', division: 'Accounting & Finance' },
  { name: 'Housing Loan', division: 'Accounting & Finance' },
  { name: 'Internal Memo Accounting & Finance', division: 'Accounting & Finance' },
  { name: 'LPJ Cash Advance diatas Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'LPJ Cash Advance dibawah Rp. 2.500.000,-', division: 'Accounting & Finance' },
  { name: 'LPJ Cash Advance Rp. 2.500.000,- s/d Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'Pembelian Karangan Bunga', division: 'Accounting & Finance' },
  { name: 'Pengajuan Fee Agent', division: 'Accounting & Finance' },
  { name: 'Pengajuan Kartu Kredit Corporate', division: 'Accounting & Finance' },
  { name: 'Pengajuan Pembukaan Rekening Perusahaan', division: 'Accounting & Finance' },
  { name: 'Pengajuan Sewa Kantor', division: 'Accounting & Finance' },
  { name: 'Pertanggung Jawaban Perjalanan Dinas', division: 'Accounting & Finance' },
  { name: 'Reimburse Entertain diatas Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Entertain dibawah Rp. 500.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Entertain Rp. 2.500.000,- s/d Rp. 10.000.000,-', division: 'Accounting & Finance' },
  { name: 'Reimburse Entertain Rp. 500.000,- s/d Rp. 2.500.000,-', division: 'Accounting & Finance' },
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
  { name: 'Pembelian Hardware/Software', division: 'IT' },
  { name: 'Pembelian Hardware/Software Diatas 4 Juta', division: 'IT' },
  { name: 'Pengajuan/Perpanjangan Lisensi', division: 'IT' },
  { name: 'Pengajuan/Perpanjangan Maintenance', division: 'IT' },
  { name: 'Service Hardware/Software', division: 'IT' },
  { name: 'Template Test PJDNS 1.76.7', division: 'IT' },
  { name: 'Template Test STD 1.76.8', division: 'IT' },
  // Legal
  { name: 'Internal Memo Legal', division: 'Legal' },
  { name: 'Pengisian Dokumen Non PKS', division: 'Legal' },
  { name: 'Pengisian Form Data Vendor', division: 'Legal' },
  { name: 'Permintaan NDA', division: 'Legal' },
  { name: 'Permintaan PKS (Biasa)', division: 'Legal' },
  { name: 'Permintaan PKS (Persetujuan Khusus)', division: 'Legal' },
  { name: 'Review / Drafting PKS', division: 'Legal' },
  // Technical
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

const HR_TEMPLATES = [
  'Pengajuan Karyawan Kontrak Khusus Trainee',
  'Pengajuan/Perpanjangan Karyawan Kontrak',
  'Pengangkatan/Pengajuan Karyawan (Diatas Staff)',
  'Pengangkatan/Pengajuan Karyawan (Staff)'
];

const isHrTemplate = (name) => HR_TEMPLATES.includes(name);

const selectTemplate = (item) => {
  selectedMemo.value.categoryType = item.name;
  selectedMemo.value.category = item.division;
  selectedMemo.value.department = item.division;

  // Initialize Travel fields if applicable
  if (item.name === 'Pengajuan Perjalanan Dinas') {
    if (selectedMemo.value.travStartDate === undefined) {
      selectedMemo.value.travStartDate = '';
      selectedMemo.value.travEndDate = '';
    }
  }

  // Initialize HR fields if applicable
  if (isHrTemplate(item.name)) {
    if (selectedMemo.value.hrEmployeeType === undefined) {
      selectedMemo.value.hrEmployeeType = 'Existing';
      selectedMemo.value.hrName = '';
      selectedMemo.value.hrID = '';
      selectedMemo.value.hrDOB = '';
      selectedMemo.value.hrStartWork = '';
      selectedMemo.value.hrDivision = '';
      selectedMemo.value.hrBranch = '';
      selectedMemo.value.hrJobTitle = '';
      selectedMemo.value.hrStatus = 'Single';
      selectedMemo.value.hrChildren = 0;
      selectedMemo.value.hrSalaryChange = 'no';
      selectedMemo.value.oldSalary = { basic: 0, allowance: 0, position: 0 };
      selectedMemo.value.newSalary = { basic: 0, allowance: 0, position: 0 };
      selectedMemo.value.hrEffectiveDate = '';
    }
  }

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
    department: item.division,
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
    entPlaceName: '',
    travStartDate: '',
    travEndDate: '',
    // HR Fields
    hrEmployeeType: 'Existing',
    hrName: '',
    hrID: '',
    hrDOB: '',
    hrStartWork: '',
    hrDivision: '',
    hrBranch: '',
    hrJobTitle: '',
    hrStatus: 'Single',
    hrChildren: 0,
    hrSalaryChange: 'no',
    oldSalary: { basic: 0, allowance: 0, position: 0 },
    newSalary: { basic: 0, allowance: 0, position: 0 },
    hrEffectiveDate: ''
  };
  templateSearch.value = item.name;
  isEditMode.value = true;
  isCreateMode.value = true;
  isModalOpen.value = true;
};

const openCreateModal = () => {
  openWizard();
};

const goBackToWizard = () => {
  isModalOpen.value = false;
  isWizardOpen.value = true;
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
  isConfirming.value = false;
  selectedMemo.value = null;
  templateSearch.value = '';
};

const handleSaveDraft = () => {
  alert('Draft saved successfully!');
  closeViewModal();
};

const cancelConfirmation = () => {
  isConfirming.value = false;
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
  if (isCreateMode.value && !isConfirming.value) {
    isConfirming.value = true;
    return;
  }

  if (isCreateMode.value) {
    alert(`Created New Memo: ${selectedMemo.value.title}`);
  } else {
    alert(`Updated Memo ${selectedMemo.value?.memoNumber}`);
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
    case 'draft': return 'status-draft';
    default: return 'status-default';
  }
};

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'approved': return CheckCircle;
    case 'rejected': return AlertCircle;
    case 'pending': return Clock;
    case 'requested changes': return FileEdit;
    case 'draft': return FileText;
    default: return FileText;
  }
};

const getApprovalProgress = (memo) => {
  if (memo.status === 'Draft') return 0;
  if (memo.status === 'Approved') return 100;

  const total = memo.approvalChain?.length || 0;
  if (total === 0) return memo.status === 'Approved' ? 100 : 0;

  const approved = memo.approvalChain.filter(tier => tier.status === 'Approved').length;
  return Math.round((approved / total) * 100);
};

const getProgressLabel = (memo) => {
  if (memo.status === 'Draft') return 'Draft';
  if (memo.status === 'Approved') return '100% Approved';
  if (memo.status === 'Rejected') return 'Rejected';
  if (memo.status === 'Requested Changes') return 'Changes Requested';
  return `${getApprovalProgress(memo)}% Progress`;
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

    // Logic for Remind: if requester and pending > 3 days and NOT already reminded
    if (isRequester && !memo.isReminded) {
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

        // Otherwise, it's fully pending at Tier 1 -> View only for now
        // (Previously allowed delete/edit here)
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
  if (memo.status === 'Draft') {
    return ['view', 'edit', 'delete'];
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
    <div class="memo-container">
      <div v-if="processedMemos.length > 0" class="memo-grid">
        <div v-for="memo in processedMemos" :key="memo.id" class="memo-card-wrapper" draggable="true"
          @dragstart="onDragStart(memo.id)" @dragover="onDragOver" @drop="onDrop(memo.id)">
          <div class="memo-card" :class="{ active: selectedRow && selectedRow.id === memo.id }"
            @click="selectedRow = selectedRow?.id === memo.id ? null : memo">
            <!-- Card Header: Title and Status -->
            <div class="memo-card-header">
              <div class="memo-card-header-top">
                <div class="memo-card-title-group">
                  <h3 class="memo-card-title">{{ memo.title }}</h3>
                  <span class="memo-card-number">#{{ memo.memoNumber }}</span>
                </div>
                <div class="header-right-group">
                  <div v-if="memo.isReminded" class="reminded-tag" title="Approvers have been reminded">
                    <Bell class="icon-tiny" />
                  </div>
                  <div :class="['status-badge-premium', getStatusColor(memo.status)]" :title="memo.status">
                    <component :is="getStatusIcon(memo.status)" class="status-icon" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Body: Metadata -->
            <div class="memo-card-body">
              <p class="memo-card-desc">{{ memo.description }}</p>
              <div class="memo-details-row">
                <div class="detail-item" title="Requester">
                  <User class="detail-icon" />
                  <span>{{ memo.requester }}</span>
                </div>
                <div class="detail-item" title="Created Date">
                  <Calendar class="detail-icon" />
                  <span>{{ formatDate(memo.createdAt) }}</span>
                </div>
                <div class="detail-item" title="Department">
                  <Layers class="detail-icon" />
                  <span>{{ memo.department }}</span>
                </div>
              </div>
            </div>

            <!-- Card Footer: Progress & Actions -->
            <div class="memo-card-footer">
              <div class="progress-container" v-if="memo.status !== 'Draft'">
                <div class="progress-bar-wrapper">
                  <div class="progress-bar-fill" :class="getStatusColor(memo.status)"
                    :style="{ width: getApprovalProgress(memo) + '%' }"></div>
                </div>
                <span class="progress-label">{{ getProgressLabel(memo) }}</span>
              </div>
              <div v-else class="draft-indicator">
                <FileText class="icon-tiny text-slate-400" />
                <span>Not Submitted</span>
              </div>

              <div class="card-actions-mini">
                <button class="mini-action-btn view" @click.stop="openViewModal(memo, false)" title="View Details">
                  <Eye class="icon-tiny" />
                </button>
                <button v-if="getActions(memo).includes('edit')" class="mini-action-btn edit"
                  @click.stop="openViewModal(memo, true)" title="Edit Draft">
                  <Edit class="icon-tiny" />
                </button>
                <button v-if="getActions(memo).includes('update')" class="mini-action-btn update"
                  @click.stop="openViewModal(memo, true)" title="Update/Review">
                  <Edit class="icon-tiny" />
                </button>
              </div>
            </div>

            <!-- Selection Overlay (Quick Actions on Click) -->
            <Transition name="fade">
              <div v-if="selectedRow && selectedRow.id === memo.id" class="card-overlay" @click.stop>
                <div class="overlay-btns">
                  <button class="overlay-main-btn view" @click="openViewModal(memo, false)">
                    <Eye class="icon-small" /> Open Memo
                  </button>
                  <button v-if="getActions(memo).includes('update') || getActions(memo).includes('edit')"
                    class="overlay-main-btn edit" @click="openViewModal(memo, true)">
                    <Edit class="icon-small" /> {{ getActions(memo).includes('edit') ? 'Edit Draft' : 'Update Content'
                    }}
                  </button>
                  <button v-if="getActions(memo).includes('delete')" class="overlay-main-btn delete"
                    @click="handleDelete(memo)">
                    <Trash2 class="icon-small" /> Delete
                  </button>
                  <button v-if="getActions(memo).includes('remind')" class="overlay-main-btn remind"
                    @click="handleRemind(memo)">
                    <Bell class="icon-small" /> Remind Approvers
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

      <!-- Empty State -->
      <div v-else class="empty-state-premium">
        <div class="empty-icon-circle">
          <Check class="empty-icon" />
        </div>
        <h2>{{ activeTab === 'pending_approval' ? 'No pending items — great job!' : 'All clear!' }}</h2>
        <p>There are no memos available in this section currently.</p>
        <button v-if="activeTab === 'my_memos' || activeTab === 'all'" class="btn-create-empty"
          @click="openCreateModal">
          <Plus class="icon-small mr-2" /> Create Your First Memo
        </button>
      </div>
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
          <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            Previous
          </button>

          <template v-for="page in totalPages" :key="page">
            <button v-if="Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages" class="page-btn"
              :class="{ 'active': page === currentPage }" @click="goToPage(page)">
              {{ page }}
            </button>
            <span v-else-if="page === 2 || page === totalPages - 1" class="page-dots">...</span>
          </template>

          <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
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
        <!-- Unified Header with Integrated Search -->
        <div class="wizard-header">
          <div class="wizard-header-left">
            <button v-if="wizardStep === 2 && !isSearchingInWizard" class="btn-back" @click="wizardStep = 1">
              <ArrowLeft class="icon" />
            </button>
            <div class="wizard-search-container">
              <div class="search-input-wrapper">
                <Search class="search-icon" />
                <input v-model="wizardSearch" type="text" placeholder="Search templates (e.g. 'Cash', 'Reimburse')..."
                  class="wizard-search-input" autofocus />
                <button v-if="isSearchingInWizard" class="btn-clear-search" @click="wizardSearch = ''">
                  <X class="icon-tiny" />
                </button>
              </div>
            </div>
          </div>
          <button class="btn-close" @click="closeWizard">
            <X class="icon" />
          </button>
        </div>

        <div class="wizard-body">
          <!-- Content Switching -->

          <!-- Content Switching -->
          <!-- Global Search Results -->
          <div v-if="isSearchingInWizard" class="template-list search-results">
            <div class="search-results-meta">
              Found {{ wizardFilteredTemplates.length }} templates matching "{{ wizardSearch }}"
            </div>
            <button v-for="(tpl, idx) in wizardFilteredTemplates" :key="idx" class="template-item"
              @click="selectWizardTemplate(tpl)">
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

          <!-- Step 1: Division Grid -->
          <div v-else-if="wizardStep === 1" class="division-grid">
            <button v-for="div in divisions" :key="div.name" class="division-card"
              :style="{ '--div-color': div.color, '--div-bg': div.bg, '--div-border': div.borderColor }"
              @click="selectWizardDivision(div.name)">
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

          <!-- Step 2: Division Templates -->
          <div v-else class="template-list">
            <button v-for="(tpl, idx) in wizardDivisionTemplates" :key="idx" class="template-item"
              @click="selectWizardTemplate(tpl)">
              <div class="template-item-name">{{ tpl.name }}</div>
              <ChevronRight class="template-item-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View/Edit/Create Memo Modal -->

    <div v-if="isModalOpen && selectedMemo" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <button v-if="isConfirming" class="btn-back" @click="cancelConfirmation">
              <ArrowLeft class="icon" />
            </button>
            <button v-else-if="isCreateMode" class="btn-back" @click="goBackToWizard">
              <ArrowLeft class="icon" />
            </button>
            <h2 v-if="isConfirming">Review Submission</h2>
            <h2 v-else-if="isCreateMode">New Memo Request</h2>
            <h2 v-else>{{ isEditMode ? 'Edit Memo' : 'Memo Details' }}</h2>
            <span v-if="!isCreateMode && selectedMemo" class="header-memo-number">{{ selectedMemo.memoNumber }}</span>
          </div>
          <div class="modal-header-right">
            <div v-if="selectedMemo && selectedMemo.isReminded" class="reminded-tag mr-2"
              title="Approvers have been reminded">
              <Bell class="icon-tiny" />
              <span v-if="!isEditMode" class="tag-text">REMINDED</span>
            </div>
            <div v-if="!isCreateMode" :class="['status-badge-premium', getStatusColor(selectedMemo.status)]"
              :title="selectedMemo.status">
              <component :is="getStatusIcon(selectedMemo.status)" class="status-icon" />
              <span v-if="!isEditMode" class="badge-text">{{ selectedMemo.status }}</span>
            </div>
            <button class="btn-close ml-3" @click="closeViewModal">
              <X class="icon" />
            </button>
          </div>
        </div>
        <div class="modal-body">
          <div v-if="isConfirming" class="confirmation-view">
            <div class="confirmation-header">
              <h3 class="text-xl font-bold text-slate-800">Review Your Submission</h3>
              <p class="text-slate-500 mt-1">Please review all data carefully before final submission.</p>
            </div>

            <div class="confirmation-grid mt-6">
              <div class="detail-section">
                <h3 class="section-group-title">Summary</h3>
                <div class="summary-item">
                  <label>Title</label>
                  <div class="summary-value font-semibold">{{ selectedMemo.title }}</div>
                </div>
                <div class="summary-item mt-3">
                  <label>Purposing of Memo (Template)</label>
                  <div class="summary-value">{{ selectedMemo.categoryType }}</div>
                </div>
                <div class="summary-item mt-3">
                  <label>Division/Department</label>
                  <div class="summary-value">{{ selectedMemo.department }}</div>
                </div>
              </div>

              <div class="detail-section mt-4">
                <h3 class="section-group-title">Content Preview</h3>
                <div class="summary-item">
                  <label>Description</label>
                  <div class="summary-value leading-relaxed whitespace-pre-wrap">{{ selectedMemo.description || '-' }}
                  </div>
                </div>
                <div class="summary-item mt-3">
                  <label>Attachment ({{ selectedMemo.attachmentsCount }})</label>
                  <div v-if="selectedMemo.attachmentsCount > 0" class="attachments-grid mt-2">
                    <div v-for="n in selectedMemo.attachmentsCount" :key="n" class="attachment-card">
                      <div class="attachment-icon-box">
                        <FileText class="attachment-icon-large" />
                      </div>
                      <span class="attachment-name">Doc {{ n }}</span>
                    </div>
                  </div>
                  <div v-else class="summary-value mt-1 text-slate-400 italic">No files attached</div>
                </div>
              </div>

              <!-- Travel summary -->
              <div v-if="selectedMemo.categoryType === 'Pengajuan Perjalanan Dinas'" class="detail-section mt-4">
                <h3 class="section-group-title">Travel Details</h3>
                <div class="detail-row">
                  <div class="summary-item">
                    <label>Start Date</label>
                    <div class="summary-value">{{ selectedMemo.travStartDate }}</div>
                  </div>
                  <div class="summary-item ml-auto">
                    <label>End Date</label>
                    <div class="summary-value">{{ selectedMemo.travEndDate }}</div>
                  </div>
                </div>
              </div>

              <!-- HR summary -->
              <div v-if="isHrTemplate(selectedMemo.categoryType)" class="detail-section mt-4">
                <h3 class="section-group-title">Employee & Salary</h3>
                <div class="summary-item">
                  <label>Employee Name</label>
                  <div class="summary-value font-semibold">{{ selectedMemo.hrName }} ({{ selectedMemo.hrID }})</div>
                </div>
                <div class="summary-item mt-2">
                  <label>New Salary Total</label>
                  <div class="summary-value font-bold text-blue-600">
                    Rp {{ (Number(selectedMemo.newSalary.basic || 0) + Number(selectedMemo.newSalary.allowance || 0) +
                      Number(selectedMemo.newSalary.position || 0)).toLocaleString('id-ID') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="modal-sections-column">
            <!-- Section 1: Core Information -->
            <!-- Rejection/Changes (Conditional) - Moved to top -->
            <div
              v-if="!isCreateMode && ['Rejected', 'Requested Changes'].includes(selectedMemo.status) && selectedMemo.rejectionReason"
              :class="['detail-section', selectedMemo.status === 'Rejected' ? 'rejection-alert-new' : 'requested-changes-alert-new']"
              style="margin-bottom: 1.5rem;">
              <h3 class="section-group-title"
                :class="selectedMemo.status === 'Rejected' ? 'text-red-700' : 'text-amber-700'">
                <component :is="selectedMemo.status === 'Rejected' ? X : Loader2" class="icon-small mr-1" />
                {{ selectedMemo.status === 'Rejected' ? 'Rejection Details' : 'Requested Changes' }}
              </h3>
              <div class="detail-row">
                <div class="detail-group">
                  <label>Concerning</label>
                  <div class="detail-value font-semibold"
                    :class="selectedMemo.status === 'Rejected' ? 'text-red-700' : 'text-amber-700'">
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
                <div class="detail-value"
                  :class="selectedMemo.status === 'Rejected' ? 'text-red-900' : 'text-amber-900'">
                  {{ selectedMemo.rejectionReason }}
                </div>
              </div>
            </div>
            <div class="detail-section">
              <h3 class="section-group-title">General Information</h3>
              <div class="detail-row">
                <div class="detail-group">
                  <label>{{ isCreateMode ? 'Department' : 'Requester' }}</label>
                  <div v-if="isCreateMode" class="detail-value">{{ selectedMemo.department }}</div>
                  <div v-else class="detail-value requester-info-row">
                    <span class="requester-name">{{ selectedMemo.requester }}</span>
                    <span class="department-marker">
                      <Building2 class="icon-tiny" style="margin: 0 0.25rem;" />
                      {{ selectedMemo.department }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-row">
                <div v-if="!isCreateMode" class="detail-group">
                  <label>Created At</label>
                  <div class="detail-value">{{ formatDate(selectedMemo.createdAt) }}</div>
                </div>
              </div>

              <div class="detail-group">
                <label>Purposing of Memo</label>
                <div v-if="isCreateMode" class="autocomplete-wrapper">
                  <input ref="templateInputRef" type="text" class="form-input"
                    placeholder="Search template by name or division..." v-model="templateSearch"
                    @focus="handleTemplateFocus" @blur="handleTemplateBlur" @input="handleTemplateInput"
                    autocomplete="off" />
                  <Teleport to="body">
                    <div v-if="showSuggestions" class="suggestions-dropdown-teleport" :style="dropdownStyle">
                      <template v-if="filteredTemplates.length > 0">
                        <div v-for="(item, idx) in filteredTemplates" :key="idx" class="suggestion-item"
                          @mousedown.prevent="selectTemplate(item)">
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
                  <div class="field-with-marker-wrapper">
                    <input v-if="isEditMode" type="text" v-model="selectedMemo.title" class="form-input" />
                    <div v-if="isEditMode && selectedMemo.markerDescriptions?.['Title']" class="marker-description-alert">
                      <AlertCircle class="icon-tiny" />
                      <span class="marker-text">{{ selectedMemo.markerDescriptions['Title'] }}</span>
                    </div>
                  </div>
                  <div v-if="!isEditMode" class="detail-value font-semibold text-lg">{{ selectedMemo.title }}</div>
                </div>
                <div class="detail-group">
                  <label>Description</label>
                  <div class="field-with-marker-wrapper">
                    <textarea v-if="isEditMode" v-model="selectedMemo.description" class="form-textarea"
                      rows="4"></textarea>
                    <div v-if="isEditMode && selectedMemo.markerDescriptions?.['Description']"
                      class="marker-description-alert">
                      <AlertCircle class="icon-tiny" />
                      <span class="marker-text">{{ selectedMemo.markerDescriptions['Description'] }}</span>
                    </div>
                  </div>
                  <div v-if="!isEditMode" class="detail-value leading-relaxed">{{ selectedMemo.description }}</div>
                </div>
                <!-- Attachments Section -->
                <div class="detail-group mt-4 attachments-collapsible">
                  <button class="section-toggle-header" @click="isAttachmentsCollapsed = !isAttachmentsCollapsed">
                    <label class="m-0 cursor-pointer">Attachment ({{ selectedMemo.attachmentsCount }})</label>
                    <div class="history-toggle-icon" :class="{ 'is-open': !isAttachmentsCollapsed }">
                      <ChevronRight class="icon-small" />
                    </div>
                  </button>

                  <div v-if="!isAttachmentsCollapsed" class="history-content-wrap mt-3">
                    <div v-if="selectedMemo.attachmentsCount > 0" class="attachments-grid">
                      <div v-for="n in selectedMemo.attachmentsCount" :key="n" class="attachment-card"
                        :class="{ 'is-edit': isEditMode }">
                        <div class="attachment-icon-box">
                          <FileText class="attachment-icon-large" />
                        </div>
                        <span class="attachment-name">Doc {{ n }}</span>
                        <button v-if="isEditMode" class="btn-remove-attachment-abs" title="Remove"
                          @click.prevent="selectedMemo.attachmentsCount--">
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
                  <div class="field-with-marker-wrapper">
                    <input v-if="isEditMode" type="text" v-model="selectedMemo.entLocation" class="form-input"
                      placeholder="Type a place or click the map to pin a location..." />
                    <div v-if="isEditMode && selectedMemo.markerDescriptions?.['Location']"
                      class="marker-description-alert">
                      <AlertCircle class="icon-tiny" />
                      <span class="marker-text">{{ selectedMemo.markerDescriptions['Location'] }}</span>
                    </div>
                  </div>

                  <div class="map-container mt-2">
                    <MapPicker :locationQuery="isEditMode ? selectedMemo.entLocation : ''" :lat="selectedMemo.entLat"
                      :lng="selectedMemo.entLng" :editable="isEditMode" @place-selected="handlePlaceSelected" />
                  </div>
                  <div v-if="!isEditMode && !selectedMemo.entLat" class="detail-value text-muted italic">No location
                    provided</div>
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
                  <div class="detail-group"
                    v-if="['Debit/Cash', 'Debit/Cash and Credit'].includes(selectedMemo.entPaymentMethod)">
                    <label>Debit/Cash Amount</label>
                    <div class="input-with-prefix" v-if="isEditMode">
                      <span class="prefix">Rp</span>
                      <input type="number" v-model="selectedMemo.entDebitAmount" class="form-input" />
                    </div>
                    <div v-else class="detail-value font-bold text-blue-600">Rp {{ selectedMemo.entDebitAmount ?
                      Number(selectedMemo.entDebitAmount).toLocaleString('id-ID') : '0' }}</div>
                  </div>

                  <div class="detail-group"
                    v-if="['Credit', 'Debit/Cash and Credit'].includes(selectedMemo.entPaymentMethod)">
                    <label>Credit Amount</label>
                    <div class="input-with-prefix" v-if="isEditMode">
                      <span class="prefix">Rp</span>
                      <input type="number" v-model="selectedMemo.entCreditAmount" class="form-input" />
                    </div>
                    <div v-else class="detail-value font-bold text-blue-600">Rp {{ selectedMemo.entCreditAmount ?
                      Number(selectedMemo.entCreditAmount).toLocaleString('id-ID') : '0' }}</div>
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

              <!-- Section 3.5: Travel Request Specific -->
              <div v-if="selectedMemo.categoryType === 'Pengajuan Perjalanan Dinas'" class="detail-section">
                <h3 class="section-group-title">Travel Period</h3>
                <div class="detail-row">
                  <div class="detail-group">
                    <label>Start Date</label>
                    <div v-if="isEditMode" class="date-input-group">
                      <input type="text" v-model="selectedMemo.travStartDate" placeholder="YYYY-MM-DD"
                        class="form-input" />
                      <div class="date-picker-trigger">
                        <Calendar class="icon-small" />
                        <input type="date" v-model="selectedMemo.travStartDate" class="hidden-date-picker" />
                      </div>
                    </div>
                    <div v-else class="detail-value font-medium">{{ selectedMemo.travStartDate || '-' }}</div>
                  </div>
                  <div class="detail-group">
                    <label>End Date</label>
                    <div v-if="isEditMode" class="date-input-group">
                      <input type="text" v-model="selectedMemo.travEndDate" placeholder="YYYY-MM-DD"
                        class="form-input" />
                      <div class="date-picker-trigger">
                        <Calendar class="icon-small" />
                        <input type="date" v-model="selectedMemo.travEndDate" class="hidden-date-picker" />
                      </div>
                    </div>
                    <div v-else class="detail-value font-medium">{{ selectedMemo.travEndDate || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Section 3.6: HR Request Specific -->
              <div v-if="isHrTemplate(selectedMemo.categoryType)" class="modal-sections-column hr-details-container">
                <!-- Employee Information -->
                <div class="detail-section">
                  <h3 class="section-group-title">Employee Information</h3>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Types of Employees</label>
                      <select v-if="isEditMode" v-model="selectedMemo.hrEmployeeType" class="form-select">
                        <option value="Existing">Existing</option>
                        <option value="New">New</option>
                      </select>
                      <div v-else class="detail-value font-medium">{{ selectedMemo.hrEmployeeType }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Name</label>
                      <input v-if="isEditMode" type="text" v-model="selectedMemo.hrName" class="form-input" />
                      <div v-else class="detail-value font-medium">{{ selectedMemo.hrName || '-' }}</div>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Employee ID Number</label>
                      <input v-if="isEditMode" type="text" v-model="selectedMemo.hrID" class="form-input" />
                      <div v-else class="detail-value">{{ selectedMemo.hrID || '-' }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Date of Birth</label>
                      <div v-if="isEditMode" class="date-input-group">
                        <input type="text" v-model="selectedMemo.hrDOB" placeholder="YYYY-MM-DD" class="form-input" />
                        <div class="date-picker-trigger">
                          <Calendar class="icon-small" />
                          <input type="date" v-model="selectedMemo.hrDOB" class="hidden-date-picker" />
                        </div>
                      </div>
                      <div v-else class="detail-value">{{ selectedMemo.hrDOB || '-' }}</div>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Start Work</label>
                      <div v-if="isEditMode" class="date-input-group">
                        <input type="text" v-model="selectedMemo.hrStartWork" placeholder="YYYY-MM-DD"
                          class="form-input" />
                        <div class="date-picker-trigger">
                          <Calendar class="icon-small" />
                          <input type="date" v-model="selectedMemo.hrStartWork" class="hidden-date-picker" />
                        </div>
                      </div>
                      <div v-else class="detail-value">{{ selectedMemo.hrStartWork || '-' }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Division</label>
                      <input v-if="isEditMode" type="text" v-model="selectedMemo.hrDivision" class="form-input" />
                      <div v-else class="detail-value">{{ selectedMemo.hrDivision || '-' }}</div>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Branch</label>
                      <input v-if="isEditMode" type="text" v-model="selectedMemo.hrBranch" class="form-input" />
                      <div v-else class="detail-value">{{ selectedMemo.hrBranch || '-' }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Job Title</label>
                      <input v-if="isEditMode" type="text" v-model="selectedMemo.hrJobTitle" class="form-input" />
                      <div v-else class="detail-value">{{ selectedMemo.hrJobTitle || '-' }}</div>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Status</label>
                      <select v-if="isEditMode" v-model="selectedMemo.hrStatus" class="form-select">
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                      <div v-else class="detail-value">{{ selectedMemo.hrStatus }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Number of Children</label>
                      <input v-if="isEditMode" type="number" v-model="selectedMemo.hrChildren" class="form-input" />
                      <div v-else class="detail-value">{{ selectedMemo.hrChildren ?? '0' }}</div>
                    </div>
                  </div>
                  <div class="detail-group">
                    <label>Salary Change</label>
                    <select v-if="isEditMode" v-model="selectedMemo.hrSalaryChange" class="form-select">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <div v-else class="detail-value">{{ selectedMemo.hrSalaryChange === 'yes' ? 'Yes' : 'No' }}</div>
                  </div>
                </div>

                <!-- Old Salary Breakdown (Conditional) -->
                <div v-if="selectedMemo.hrSalaryChange === 'yes'" class="detail-section">
                  <h3 class="section-group-title">Old Salary Breakdown</h3>
                  <div class="salary-grid">
                    <div class="detail-group">
                      <label>Basic Salary</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="selectedMemo.oldSalary.basic" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(selectedMemo.oldSalary?.basic ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Meal / Transport Allowance</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="selectedMemo.oldSalary.allowance" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(selectedMemo.oldSalary?.allowance ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Position Allowance</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="selectedMemo.oldSalary.position" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(selectedMemo.oldSalary?.position ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group salary-total-group">
                      <label>Total (Read-Only)</label>
                      <div class="detail-value font-bold text-blue-600">
                        Rp {{ (Number(selectedMemo.oldSalary?.basic || 0) + Number(selectedMemo.oldSalary?.allowance ||
                          0) + Number(selectedMemo.oldSalary?.position || 0)).toLocaleString('id-ID') }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- New Salary Breakdown -->
                <div class="detail-section">
                  <h3 class="section-group-title">New Salary Breakdown</h3>
                  <div class="salary-grid">
                    <div class="detail-group">
                      <label>Basic Salary</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="selectedMemo.newSalary.basic" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(selectedMemo.newSalary?.basic ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Meal / Transport Allowance</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="selectedMemo.newSalary.allowance" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(selectedMemo.newSalary?.allowance ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Position Allowance</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="selectedMemo.newSalary.position" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(selectedMemo.newSalary?.position ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group salary-total-group">
                      <label>Total (Read-Only)</label>
                      <div class="detail-value font-bold text-blue-600">
                        Rp {{ (Number(selectedMemo.newSalary?.basic || 0) + Number(selectedMemo.newSalary?.allowance ||
                          0) + Number(selectedMemo.newSalary?.position || 0)).toLocaleString('id-ID') }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Effective Date -->
                <div class="detail-section">
                  <h3 class="section-group-title">Effective Date</h3>
                  <div class="detail-group">
                    <label>Effective starting from</label>
                    <div v-if="isEditMode" class="date-input-group">
                      <input type="text" v-model="selectedMemo.hrEffectiveDate" placeholder="YYYY-MM-DD"
                        class="form-input" />
                      <div class="date-picker-trigger">
                        <Calendar class="icon-small" />
                        <input type="date" v-model="selectedMemo.hrEffectiveDate" class="hidden-date-picker" />
                      </div>
                    </div>
                    <div v-else class="detail-value font-medium">{{ selectedMemo.hrEffectiveDate || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Section 5: Workflow & Files -->
              <div v-if="!isCreateMode" class="detail-section">
                <h3 class="section-group-title">Workflow & History</h3>

                <div class="detail-group" style="position: relative; z-index: 10;">
                  <label>Approval Chain</label>
                  <div class="modal-approval-chain-container">
                    <div class="modal-approval-chain">
                      <template v-for="(tier, tierIdx) in selectedMemo.approvalChain" :key="tierIdx">
                        <div class="tier-group" :class="{ 'is-quorum': tier.approvers.length > 1 }">
                          <div v-if="tier.approvers.length > 1" class="tier-label">
                            {{ tier.type === 'quorum' ? `Any ${tier.requiredApprovals} of ${tier.approvers.length}` :
                              'All Required' }}
                          </div>
                          <div class="tier-nodes">
                            <template v-for="(approver, approverIdx) in tier.approvers" :key="approverIdx">
                              <div class="approver-node-compact" :class="getStatusColor(approver.status)">
                                <div class="node-icon-overlay">
                                  <component :is="getStatusIcon(approver.status)" class="node-mini-icon" />
                                </div>
                                <span class="approver-initials">{{ approver.name.substring(0, 1) }}</span>
                                <div class="approver-tooltip">
                                  <div class="tooltip-name">{{ approver.name }}</div>
                                  <div class="tooltip-role">{{ approver.role }}</div>
                                  <div class="tooltip-status" :class="getStatusColor(approver.status)">{{
                                    approver.status }}</div>
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
                <div v-if="!isCreateMode && selectedMemo.history && selectedMemo.history.length > 0"
                  class="mt-4 history-collapsible border-t pt-4 border-dashed border-slate-200">
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
                            <span v-if="item.user === currentUser"
                              class="text-xs italic text-slate-400 ml-1">(you)</span>
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

          <!-- Action Area (Moved from footer) -->
          <div class="modal-section-actions">
            <div v-if="!isEditMode && activeTab === 'pending_approval' && selectedMemo.status === 'Pending'"
              class="modal-actions-group is-centered">
              <button class="btn-success" @click="handleApprove">
                <CheckCircle class="icon-small mr-2" /> Approve
              </button>
              <button class="btn-warning" @click="handleRequestChanges">
                <FileEdit class="icon-small mr-2" /> Request Changes
              </button>
              <button class="btn-danger" @click="handleReject">
                <XCircle class="icon-small mr-2" /> Reject
              </button>
            </div>

            <template v-if="isEditMode">
              <div class="modal-actions-group is-centered">
                <template v-if="isConfirming">
                  <button class="btn-primary" @click="handleUpdate">Confirm & Submit Submission</button>
                </template>
                <template v-else>
                  <button class="btn-draft" @click="handleSaveDraft">Save Draft</button>
                  <button class="btn-primary" @click="handleUpdate">
                    {{ isCreateMode ? 'Submit Request' : 'Update Memo' }}
                  </button>
                </template>
              </div>
            </template>
            <template v-else>
              <div v-if="getActions(selectedMemo).includes('remind')" class="modal-actions-group is-centered">
                <button class="btn-remind" @click="handleRemind(selectedMemo)">
                  <Bell class="icon-small mr-1" /> Remind Approvers
                </button>
              </div>
            </template>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="isEditMode" class="btn-secondary" @click="closeViewModal">
            <XCircle class="icon-small mr-2" /> Cancel Edit
          </button>
          <button class="btn-secondary ml-auto" @click="closeViewModal">
            <X class="icon-small mr-2" /> Close
          </button>
        </div>
      </div>
    </div>

    <!-- Review Action Modal (Reject / Request Changes) -->
    <div v-if="isReviewModalOpen" class="modal-overlay" style="z-index: 1050;" @click.self="cancelReviewAction">
      <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header">
          <h2>{{ reviewModalType === 'Reject' ? 'Reject Memo' : 'Request Changes' }}</h2>
          <button class="btn-close" @click="cancelReviewAction">
            <X class="icon" />
          </button>
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
              <div>
                <label v-for="field in memoFieldsToReject" :key="field" class="checkbox-label-premium">
                  <input type="checkbox" :value="field" v-model="rejectedFields" class="form-checkbox">
                  <div class="checkbox-text">
                    <span class="field-name-sm">{{ field }}</span>
                    <span class="field-value-sm">{{ getFieldValue(field) }}</span>
                  </div>
                </label>
              </div>
            </div>
          </template>

          <div class="detail-group" :class="{ 'mt-3': reviewModalType === 'Requested Changes' }">
            <label>{{ reviewModalType === 'Reject' ? 'Rejection Reason Details' : 'Requested Changes Details' }} <span
                class="text-red-500">*</span></label>
            <textarea v-model="rejectionReason" class="form-textarea" rows="4"
              :placeholder="reviewModalType === 'Reject' ? 'Explain why this cannot be approved...' : 'Describe what needs to be changed...'"></textarea>
          </div>
          <div class="modal-section-actions">
            <div class="modal-actions-group is-centered">
              <button class="btn-secondary" @click="cancelReviewAction">
                <X class="icon-small mr-2" /> Cancel
              </button>
              <button :class="reviewModalType === 'Reject' ? 'btn-danger' : 'btn-primary'" @click="confirmReviewAction">
                <XCircle v-if="reviewModalType === 'Reject'" class="icon-small mr-2" />
                <FileEdit v-else class="icon-small mr-2" />
                {{ reviewModalType === 'Reject' ? 'Confirm Rejection' : 'Confirm Request' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.memo-list-container {
  width: 100%;
}

.memo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  padding: 0.5rem 0;
}

@media (max-width: 1280px) {
  .memo-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .memo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .memo-grid {
    grid-template-columns: 1fr;
  }
}

.memo-card-wrapper {
  perspective: 1000px;
}

.memo-card {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  height: 100%;
}

.memo-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: #3b82f6;
}

.memo-card.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1), var(--shadow-md);
}

/* Card Header */
.memo-card-header {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.memo-card-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.memo-card-title-group {
  flex: 1;
  min-width: 0;
  /* Important for text truncation inside flexbox */
}

.memo-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
  margin-bottom: 0.35rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.memo-card-number {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  font-family: monospace;
}

.header-right-group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 0.75rem;
  margin-right: 0.25rem;
}

.reminded-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdf2f8;
  color: #db2777;
  padding: 0 0.5rem;
  height: 28px;
  border-radius: 8px;
  border: 1px solid #fbcfe8;
  transition: all 0.2s;
  gap: 0.35rem;
  margin-right: 0.25rem;
}

.tag-text {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.025em;
}

@media (max-width: 640px) {
  .header-right-group {
    margin-left: 0.5rem;
    margin-right: 0;
  }

  .reminded-tag {
    width: auto;
    padding: 0 0.5rem;
    height: 28px;
    border-radius: 6px;
  }
}

.responsive-tag {
  flex-shrink: 0;
}

/* Premium Status Badge */
.status-badge-premium {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.6rem;
  min-width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
  flex-shrink: 0;
  gap: 0.35rem;
  margin-left: 0.25rem;
}

.badge-text {
  font-size: 0.7rem;
}

@media (max-width: 640px) {
  .status-badge-premium {
    width: auto;
    padding: 0 0.6rem;
    height: 28px;
    border-radius: 6px;
  }
}

.status-icon {
  width: 16px;
  height: 16px;
}

.status-approved {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.status-pending {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}

.status-rejected {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.status-requested-changes {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

/* Red for issues */
.status-draft {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

/* Card Body */
.memo-card-body {
  flex: 1;
}

.memo-card-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 4.05rem;
  /* Rigid height for 3 lines (3 * 1.5 * 0.9rem) */
}

.memo-details-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
  min-width: 0;
  /* Allow grid item to shrink below content size */
}

.detail-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

/* Card Footer & Progress */
.memo-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.5rem;
}

.progress-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.progress-bar-wrapper {
  height: 6px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-bar-fill.status-approved {
  background: #10b981;
}

.progress-bar-fill.status-rejected {
  background: #ef4444;
}

.progress-bar-fill.status-requested-changes {
  background: #f59e0b;
}

.progress-bar-fill.status-pending {
  background: #3b82f6;
}

.progress-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
}

.draft-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

.card-actions-mini {
  display: flex;
  gap: 0.4rem;
}

.mini-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-action-btn:hover {
  background: #f8fafc;
  color: #3b82f6;
  border-color: #3b82f6;
}

.mini-action-btn.update:hover {
  color: #f59e0b;
  border-color: #f59e0b;
}

/* Card Overlay (Quick Actions) */
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 1.5rem;
  animation: fadeIn 0.2s ease-out;
}

.overlay-btns {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.overlay-main-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.overlay-main-btn.view {
  background: #3b82f6;
  color: white;
}

.overlay-main-btn.edit {
  background: #f59e0b;
  color: white;
}

.overlay-main-btn.delete {
  background: #ef4444;
  color: white;
}

.overlay-main-btn.remind {
  background: #6366f1;
  color: white;
}

.overlay-main-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.overlay-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
}

/* Empty State Premium */
.empty-state-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  background: white;
  border-radius: var(--radius-lg);
  border: 2px dashed #e2e8f0;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon {
  width: 32px;
  height: 32px;
}

.empty-state-premium h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.empty-state-premium p {
  color: var(--text-muted);
  margin-bottom: 2rem;
  max-width: 320px;
}

.btn-create-empty {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 640px) {
  .memo-grid {
    grid-template-columns: 1fr;
  }
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

.approver-node-compact.status-approved {
  border-color: #10b981;
  background: #ecfdf5;
  color: #059669;
}

.approver-node-compact.status-rejected {
  border-color: #ef4444;
  background: #fef2f2;
  color: #dc2626;
}

.approver-node-compact.status-pending {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #64748b;
}

.approver-node-compact.status-requested-changes {
  border-color: #f59e0b;
  background: #fffbeb;
  color: #d97706;
}

/* Tooltip */
.approver-tooltip {
  position: absolute;
  top: calc(100% + 12px);
  /* Render BELOW the node in the modal */
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: #0f172a;
  /* Darker navy */
  color: white;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  /* Softer corners */
  font-size: 0.75rem;
  white-space: normal;
  /* Allow wrapping */
  width: max-content;
  max-width: 180px;
  /* Prevent it from being too wide */
  text-align: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1000;
  /* Max z-index for absolute visibility */
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.approver-tooltip::after {
  content: '';
  position: absolute;
  bottom: 100%;
  /* Arrow on TOP pointing UP */
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

.tooltip-status.status-approved {
  background: rgba(16, 185, 129, 0.2);
  color: #059669;
}

.tooltip-status.status-rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.tooltip-status.status-pending {
  background: rgba(148, 163, 184, 0.2);
  color: #64748b;
}

.tooltip-status.status-requested-changes {
  background: rgba(245, 158, 11, 0.2);
  color: #d97706;
}

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
  left: 250px;
  /* align with main content, after sidebar */
  right: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  background: #1e293b;
  color: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
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

.overlay-btn.view {
  background: #3b82f6;
  color: white;
}

.overlay-btn.edit {
  background: #f59e0b;
  color: white;
}

.overlay-btn.delete {
  background: #ef4444;
  color: white;
}

.overlay-btn.remind {
  background: #6366f1;
  color: white;
}

/* Indigo for Remind */

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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
  width: 100%;
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
  max-width: 840px;
  /* Wider for better readability */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.25), 0 8px 16px -6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-content {
    max-width: 100% !important;
    height: 100% !important;
    max-height: 100vh !important;
    border-radius: 0;
  }
}

@media (max-width: 640px) {
  .modal-header {
    flex-wrap: wrap;
    gap: 0.75rem;
    position: relative;
    /* Added to anchor absolute close button */
    padding-right: 3.5rem !important;
    /* Ensure room for close button */
  }

  .modal-header-left {
    width: 100%;
    gap: 0.5rem;
  }

  .modal-header-right {
    width: 100%;
    justify-content: flex-start;
    padding-right: 0;
    /* Header-right already has room due to header padding */
  }

  .btn-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    margin: 0 !important;
    /* Clear ml-3 or other margins */
  }

  .modal-header,
  .modal-footer {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
    gap: 1.25rem;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header-right {
  display: flex;
  align-items: center;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
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
  background-color: #f8fafc;
  /* Subtle background for contrast with sections */
}

.modal-sections-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
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

.section-group-title.m-0 {
  margin: 0;
}

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

@media (max-width: 768px) {
  .detail-row {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}

.detail-group {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 1.5rem;
  align-items: flex-start;
}

@media (max-width: 640px) {
  .detail-group {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
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

.requester-info-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.requester-name {
  font-weight: 600;
  color: #0f172a;
}

.department-marker {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  color: #4338ca;
  background: #e0e7ff;
  padding: 2px 8px;
  border-radius: 99px;
  margin-left: 0.6rem;
  font-weight: 600;
}

.header-memo-number {
  font-family: monospace;
  font-size: 0.9rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-left: 0.75rem;
  font-weight: 600;
}

.icon-tiny {
  width: 12px;
  height: 12px;
}

.icon-small {
  width: 16px;
  height: 16px;
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
  padding: 1.25rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #f8fafc;
  gap: 1rem;
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
  border: 1px solid #e2e8f0;
  color: #64748b;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover {
  background-color: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.btn-secondary:active {
  transform: translateY(0);
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

/* Action Area (Moved from footer) */
.modal-section-actions {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid #f1f5f9;
  width: 100%;
}

.modal-actions-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
}


/* Button size consistency */
.modal-actions-group button,
.modal-footer button {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
  height: 2.5rem;
  padding: 0 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.95rem;
}

.modal-actions-group.is-centered,
.modal-footer.is-centered {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
  margin: 0 auto !important;
  gap: 1.25rem !important;
}

.modal-actions-group.is-centered button,
.modal-footer.is-centered button {
  flex: 0 0 auto !important;
  max-width: none !important;
  margin: 0 !important;
}

@media (min-width: 641px) {

  .modal-actions-group.is-centered button,
  .modal-footer.is-centered button {
    width: 240px !important;
  }
}

@media (max-width: 640px) {
  .modal-actions-group button,
  .modal-footer button {
    width: 100% !important;
    max-width: none !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    flex: 0 0 auto !important;
    /* Ensure they don't shrink */
    height: 3rem !important;
    /* Slightly taller for mobile touch targets */
    font-size: 1rem !important;
  }

  .modal-actions-group.is-centered,
  .modal-footer.is-centered {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
  }
}

.modal-footer {
  padding: 1.25rem 2rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-remind {
  background-color: #6366f1;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

/* Edit Form Styles */
.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #1e293b;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
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

/* Checkbox Grid for Review */
.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  width: 100%;
}

.checkbox-label-premium {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.6rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

.checkbox-label-premium:last-child {
  margin-bottom: 0;
}

.checkbox-label-premium:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.field-name-sm {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.field-value-sm {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.4;
  word-break: break-word;
}

.form-checkbox {
  width: 1.1rem;
  height: 1.1rem;
  margin-top: 0.1rem;
  cursor: pointer;
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

/* Date Input Group (Custom Component) */
.date-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.date-picker-trigger {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  pointer-events: none;
  /* Let clicks pass through to the hidden input */
}

.date-picker-trigger:hover {
  color: #3b82f6;
}

.hidden-date-picker {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  pointer-events: auto;
  /* Enable clicks on the hidden native picker */
  width: 100%;
}

/* HR details */
.hr-details-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-group-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.salary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.salary-total-group {
  grid-column: span 3;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #cbd5e1;
}

/* Confirmation View */
.confirmation-view {
  padding: 0.5rem;
}

.confirmation-header {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
}

.summary-item label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1rem;
  color: #1e293b;
}

.btn-draft {
  background-color: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-draft:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #1e293b;
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  overflow: visible;
  /* Prevent clipping of flipped tooltips */
  padding: 0.5rem 0.5rem 4rem 0.5rem;
  /* Large bottom padding for tooltips */
}

.modal-approval-chain {
  display: inline-flex;
  min-width: 100%;
  align-items: center;
  gap: 0.75rem;
  /* Space between tiers/arrows */
  justify-content: flex-start;
}

.modal-approval-chain .tier-nodes {
  gap: 0.5rem;
  /* Space between approver nodes in a tier */
}

.modal-approval-chain .approver-node-compact:not(:first-child) {
  margin-left: 0;
  /* Clear the overlap from global styles */
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
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.text-green-600 {
  color: #16a34a;
}

.text-blue-600 {
  color: #2563eb;
}

.text-indigo-600 {
  color: #4f46e5;
}

.text-amber-600 {
  color: #d97706;
}

.text-red-600 {
  color: #dc2626;
}

.bg-green-500 {
  background-color: #22c55e;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.bg-indigo-500 {
  background-color: #6366f1;
}

.bg-amber-500 {
  background-color: #f59e0b;
}

.bg-red-500 {
  background-color: #ef4444;
}

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
  .simple-table,
  .simple-table tbody,
  .simple-table tr,
  .simple-table td {
    display: block;
    width: 100%;
  }

  .simple-table thead {
    display: none;
    /* Hide headers */
  }

  .simple-table tr {
    margin-bottom: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: white;
    padding: 1rem;
    position: relative;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
    content: none !important;
    /* HideAction label */
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

  .btn-success,
  .btn-danger {
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
  box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.wizard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  min-height: 72px;
}

.wizard-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  max-width: 440px;
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.09);
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
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.division-icon {
  width: 18px;
  height: 18px;
  color: var(--div-color);
}

@media (max-width: 560px) {
  .wizard-modal {
    max-height: 95vh;
  }
  .wizard-header {
    padding: 0.75rem 1rem;
    min-height: 64px;
  }
  .wizard-body {
    padding: 1rem;
  }
  .division-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  .division-card {
    padding: 0.65rem 0.85rem;
  }
  .division-icon-wrap {
    width: 30px;
    height: 30px;
    border-radius: 7px;
  }
  .division-icon {
    width: 14px;
    height: 14px;
  }
  .division-name {
    font-size: 0.85rem;
  }
  .division-count {
    font-size: 0.7rem;
  }
}

.division-info {
  flex: 1;
}

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
  flex: 1;
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

.approver-node-compact {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  border: 2px solid #e2e8f0;
}

.approver-node-compact:hover {
  transform: scale(1.1);
  z-index: 20;
}

.approver-initials {
  font-size: 0.85rem;
  font-weight: 700;
}

.node-icon-overlay {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  z-index: 5;
  border: 1px solid currentColor;
}

.node-mini-icon {
  width: 10px;
  height: 10px;
}

.marker-description-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.6rem 0.8rem;
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #92400e;
  font-size: 0.85rem;
  line-height: 1.4;
  animation: slideInDown 0.3s ease-out;
  width: 100%;
}

.marker-description-alert .icon-tiny {
  color: #d97706;
  margin-top: 2px;
  flex-shrink: 0;
}

.marker-text {
  flex: 1;
  word-break: break-word;
  white-space: normal;
}

.field-with-marker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<!-- Global styles for teleported autocomplete dropdown (cannot be scoped) -->
<style>
.suggestions-dropdown-teleport {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
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
