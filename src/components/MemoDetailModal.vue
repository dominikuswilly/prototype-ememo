<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  X, ArrowLeft, ChevronLeft, FileText, Bell, CheckCircle, Clock, AlertCircle, FileEdit, User, ChevronRight,
  Monitor, XCircle, Plus, AlertTriangle, Loader2, Calendar, MapPin
} from 'lucide-vue-next';
import MapPicker from './MapPicker.vue';

const props = defineProps({
  modelValue: Boolean,
  memo: Object,
  isEdit: Boolean,
  isCreate: Boolean,
  currentUser: String,
  activeTab: String
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel', 'back-to-wizard']);

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const localMemo = ref(null);
const isEditMode = ref(false);
const isCreateMode = ref(false);
const isConfirming = ref(false);
const isHistoryCollapsed = ref(true);
const isAttachmentsCollapsed = ref(true);

const isMobile = ref(false);
const checkMobile = () => { isMobile.value = window.innerWidth <= 1024; };

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// Rejection/Review Modal State
const isReviewModalOpen = ref(false);
const reviewModalType = ref('Reject');
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

const HR_TEMPLATES = [
  'Pengajuan Karyawan Kontrak Khusus Trainee',
  'Pengajuan/Perpanjangan Karyawan Kontrak',
  'Pengangkatan/Pengajuan Karyawan (Diatas Staff)',
  'Pengangkatan/Pengajuan Karyawan (Staff)'
];

const isHrTemplate = (name) => HR_TEMPLATES.includes(name);

// Watch for prop changes to initialize local state
watch(() => props.memo, (newMemo) => {
  if (newMemo) {
    localMemo.value = JSON.parse(JSON.stringify(newMemo));
    isEditMode.value = props.isEdit;
    isCreateMode.value = props.isCreate;
    isConfirming.value = false;

    // Auto-populate Purposing of Memo
    if (newMemo.categoryType) {
      templateSearch.value = newMemo.categoryType;
    } else {
      templateSearch.value = '';
    }
  }
}, { immediate: true });

// Autocomplete State for Template
const templateSearch = ref(props.memo?.categoryType || '');
const showSuggestions = ref(false);
const templateInputRef = ref(null);
const dropdownStyle = ref({});

const templateList = [
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
  { name: 'Internal Memo', division: 'Claim' },
  { name: 'Reimburse Entertain diatas Rp. 10.000.000,-', division: 'Claim' },
  { name: 'Reimburse Entertain dibawah Rp. 500.000,-', division: 'Claim' },
  { name: 'Reimburse Entertain Rp. 2.500.000,- s/d Rp. 10.000.000,-', division: 'Claim' },
  { name: 'Reimburse Entertain Rp. 500.000,- s/d Rp. 2.500.000,-', division: 'Claim' },
  { name: 'Penggunaan Asuransi', division: 'Employee Benefit' },
  { name: 'Internal Memo General Affair', division: 'General Affair' },
  { name: 'Pembelian Barang', division: 'General Affair' },
  { name: 'Peminjaman Kendaraan', division: 'General Affair' },
  { name: 'Peminjaman Perangkat', division: 'General Affair' },
  { name: 'Penarikan kendaraan', division: 'General Affair' },
  { name: 'Pengajuan Pulsa', division: 'General Affair' },
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
  { name: 'Pembelian Hardware/Software', division: 'IT' },
  { name: 'Pembelian Hardware/Software Diatas 4 Juta', division: 'IT' },
  { name: 'Pengajuan/Perpanjangan Lisensi', division: 'IT' },
  { name: 'Pengajuan/Perpanjangan Maintenance', division: 'IT' },
  { name: 'Service Hardware/Software', division: 'IT' },
  { name: 'Internal Memo Legal', division: 'Legal' },
  { name: 'Pengisian Dokumen Non PKS', division: 'Legal' },
  { name: 'Pengisian Form Data Vendor', division: 'Legal' },
  { name: 'Permintaan NDA', division: 'Legal' },
  { name: 'Permintaan PKS (Biasa)', division: 'Legal' },
  { name: 'Permintaan PKS (Persetujuan Khusus)', division: 'Legal' },
  { name: 'Review / Drafting PKS', division: 'Legal' },
  { name: 'Penggunaan Asuransi', division: 'Technical' },
  { name: 'Self Insurance', division: 'Technical' },
  { name: 'Sponsorship', division: 'Technical' },
];

const targetDeptMap = {
  'Accounting & Finance': 'Finance',
  'Claim': 'HR',
  'Employee Benefit': 'HR',
  'General Affair': 'GA',
  'HRD': 'HR',
  'IT': 'IT',
  'Legal': 'Legal',
  'Technical': 'Medical'
};

const filteredTemplates = computed(() => {
  const q = templateSearch.value.trim().toLowerCase();
  if (!q) return templateList;
  return templateList.filter(
    t => t.name.toLowerCase().includes(q) || t.division.toLowerCase().includes(q)
  );
});

const memoFieldsToReject = computed(() => {
  if (!localMemo.value) return [];
  const fields = ['Title', 'Description'];
  const type = localMemo.value.categoryType;

  if (type === 'Entertainment Fund') {
    fields.push('Location', 'Amount');
  } else if (type === 'Pengajuan Perjalanan Dinas') {
    fields.push('Timeline');
  } else if (isHrTemplate(type)) {
    fields.push('Employee Info');
    if (localMemo.value.hrSalaryChange === 'yes') fields.push('Salary Details');
  } else if (localMemo.value.entDebitAmount || localMemo.value.entCreditAmount) {
    fields.push('Amount');
  }
  fields.push('Attachments');
  return fields;
});

const getFieldValue = (fieldName) => {
  if (!localMemo.value) return '';
  switch (fieldName) {
    case 'Title': return localMemo.value.title;
    case 'Description': return localMemo.value.description;
    case 'Location': return localMemo.value.entLocation || localMemo.value.hrBranch || '-';
    case 'Amount': {
      const amt = (Number(localMemo.value.entDebitAmount || 0) + Number(localMemo.value.entCreditAmount || 0));
      return amt > 0 ? `Rp ${amt.toLocaleString('id-ID')}` : '-';
    }
    case 'Timeline': return `${localMemo.value.travStartDate || '?'} to ${localMemo.value.travEndDate || '?'}`;
    case 'Employee Info': return localMemo.value.hrName || 'Not specified';
    case 'Salary Details': {
      const total = Number(localMemo.value.newSalary?.basic || 0) +
        Number(localMemo.value.newSalary?.allowance || 0) +
        Number(localMemo.value.newSalary?.position || 0);
      return `Total Rp ${total.toLocaleString('id-ID')}`;
    }
    case 'Attachments': return `${localMemo.value.attachmentsCount || 0} files`;
    default: return '';
  }
};

const selectTemplate = (item) => {
  localMemo.value.categoryType = item.name;
  localMemo.value.category = item.division;
  localMemo.value.requesterDepartment = props.currentUser === 'Willy' ? 'Engineering' : 'Staff';
  localMemo.value.targetDepartment = targetDeptMap[item.division] || item.division;

  if (item.name === 'Pengajuan Perjalanan Dinas') {
    if (localMemo.value.travStartDate === undefined) {
      localMemo.value.travStartDate = '';
      localMemo.value.travEndDate = '';
    }
  }

  if (isHrTemplate(item.name)) {
    if (localMemo.value.hrEmployeeType === undefined) {
      localMemo.value.hrEmployeeType = 'Existing';
      localMemo.value.hrName = '';
      localMemo.value.hrID = '';
      localMemo.value.hrDOB = '';
      localMemo.value.hrStartWork = '';
      localMemo.value.hrDivision = '';
      localMemo.value.hrBranch = '';
      localMemo.value.hrJobTitle = '';
      localMemo.value.hrStatus = 'Single';
      localMemo.value.hrChildren = 0;
      localMemo.value.hrSalaryChange = 'no';
      localMemo.value.oldSalary = { basic: 0, allowance: 0, position: 0 };
      localMemo.value.newSalary = { basic: 0, allowance: 0, position: 0 };
      localMemo.value.hrEffectiveDate = '';
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

const handleTemplateBlur = () => { setTimeout(() => { showSuggestions.value = false; }, 180); };
const handleTemplateFocus = () => { showSuggestions.value = true; updateDropdownPos(); };
const handleTemplateInput = () => { showSuggestions.value = true; updateDropdownPos(); };

const handlePlaceSelected = (info) => {
  if (!localMemo.value) return;
  localMemo.value.entLat = info.lat;
  localMemo.value.entLng = info.lng;
  localMemo.value.entPlaceName = info.placeName;
  if (!localMemo.value.entLocation) localMemo.value.entLocation = info.displayName;
};

const closeViewModal = () => {
  isModalOpen.value = false;
  emit('cancel');
};

const handleSaveDraft = () => {
  alert('Draft saved successfully!');
  emit('save', { ...localMemo.value, status: 'Draft' });
  closeViewModal();
};

const handleApprove = () => {
  alert(`Approved Memo ${localMemo.value?.memoNumber}`);
  emit('save', { ...localMemo.value, status: 'Approved' });
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

const cancelReviewAction = () => { isReviewModalOpen.value = false; };

const confirmReviewAction = () => {
  if (!rejectionReason.value) {
    alert('Please provide specific details/reason.');
    return;
  }
  if (reviewModalType.value === 'Reject') {
    localMemo.value.rejectionConcern = '';
    localMemo.value.rejectedFields = [];
  } else {
    localMemo.value.rejectionConcern = rejectionConcern.value;
    localMemo.value.rejectedFields = [...rejectedFields.value];
  }
  localMemo.value.status = reviewModalType.value;
  localMemo.value.rejectionReason = rejectionReason.value;

  const actionText = reviewModalType.value === 'Reject' ? 'Rejected' : 'Requested Changes for';
  alert(`${actionText} Memo ${localMemo.value?.memoNumber}`);
  isReviewModalOpen.value = false;
  emit('save', { ...localMemo.value });
  closeViewModal();
};

const handleUpdate = () => {
  if (isCreateMode.value && !isConfirming.value) {
    isConfirming.value = true;
    return;
  }

  if (isCreateMode.value) {
    alert(`Created New Memo: ${localMemo.value.title}`);
  } else {
    alert(`Updated Memo ${localMemo.value?.memoNumber}`);
  }
  emit('save', { ...localMemo.value });
  closeViewModal();
};

const goBackToWizard = () => {
  isModalOpen.value = false;
  emit('back-to-wizard');
};

const cancelConfirmation = () => { isConfirming.value = false; };

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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

const openDatePicker = (event) => {
  const input = event.currentTarget.querySelector('input[type="date"]');
  if (input && input.showPicker) {
    input.showPicker();
  } else if (input) {
    input.focus();
    input.click();
  }
};

const getActions = (memo) => {
  if (!memo) return ['view'];
  const isRequester = memo.requester === props.currentUser;
  const isApprover = memo.approvalChain?.some(tier =>
    tier.approvers?.some(a => a.name === props.currentUser)
  );

  if (!isRequester && !isApprover) return ['view'];
  if (memo.status === 'Approved') return ['view'];
  if (memo.status === 'Pending') {
    const actions = ['view'];
    if (isRequester && !memo.isReminded) {
      const created = new Date(memo.createdAt);
      const now = new Date();
      if ((now - created) >= (3 * 24 * 60 * 60 * 1000)) actions.push('remind');
    }
    return actions;
  }
  if (memo.status === 'Rejected') return ['view'];
  if (memo.status === 'Requested Changes') return ['view', 'update'];
  if (memo.status === 'Draft') return ['view', 'edit', 'delete'];
  return ['view'];
};

const handleRemind = (memo) => { alert(`Reminder sent to approvers for Memo ${memo.memoNumber}`); };

</script>

<template>
  <div>
    <!-- View/Edit/Create Memo Modal -->
    <div v-if="isModalOpen && localMemo" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <button v-if="isConfirming" class="btn-back mr-2" @click="cancelConfirmation">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button v-else-if="isCreateMode" class="btn-back mr-2" @click="goBackToWizard">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button v-else class="btn-back mr-2 mobile-back-btn" @click="closeViewModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h2 v-if="isConfirming">Review Submission</h2>
            <h2 v-else-if="isCreateMode">New Memo Request</h2>
            <h2 v-else>{{ isEditMode ? 'Edit Memo' : 'Memo Details' }}</h2>
            <span v-if="!isCreateMode && localMemo" class="header-memo-number hide-on-mobile">{{ localMemo.memoNumber
              }}</span>
          </div>
          <div class="modal-header-right">
            <div v-if="localMemo && localMemo.isReminded" class="reminded-tag mr-2"
              title="Approvers have been reminded">
              <Bell class="icon-tiny" />
              <span v-if="!isEditMode" class="tag-text hide-on-mobile">REMINDED</span>
            </div>
            <div v-if="!isCreateMode" :class="['status-badge-premium', getStatusColor(localMemo.status)]"
              :title="localMemo.status">
              <component :is="getStatusIcon(localMemo.status)" class="status-icon" />
              <span v-if="!isEditMode" class="badge-text hide-on-mobile">{{ localMemo.status }}</span>
            </div>
            <button class="btn-close desktop-close-btn ml-3" @click="closeViewModal">
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
                  <div class="summary-value font-semibold">{{ localMemo.title }}</div>
                </div>
                <div class="summary-item mt-3">
                  <label>Purposing of Memo (Template)</label>
                  <div class="summary-value">{{ localMemo.categoryType }}</div>
                </div>
                <div class="summary-item mt-3">
                  <label>Departments</label>
                  <div class="summary-value">
                    <span class="font-medium">{{ localMemo.requesterDepartment }}</span>
                    <ChevronRight class="icon-tiny inline mx-1 text-slate-400" />
                    <span class="font-medium text-blue-600">{{ localMemo.targetDepartment }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section mt-4">
                <h3 class="section-group-title">Content Preview</h3>
                <div class="summary-item">
                  <label>Description</label>
                  <div class="summary-value leading-relaxed whitespace-pre-wrap">{{ localMemo.description || '-' }}
                  </div>
                </div>
                <div class="summary-item mt-3">
                  <label>Attachment ({{ localMemo.attachmentsCount }})</label>
                  <div v-if="localMemo.attachmentsCount > 0" class="attachments-grid mt-2">
                    <div v-for="n in localMemo.attachmentsCount" :key="n" class="attachment-card">
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
              <div v-if="localMemo.categoryType === 'Pengajuan Perjalanan Dinas'" class="detail-section mt-4">
                <h3 class="section-group-title">Travel Details</h3>
                <div class="detail-row">
                  <div class="summary-item">
                    <label>Start Date</label>
                    <div class="summary-value">{{ localMemo.travStartDate }}</div>
                  </div>
                  <div class="summary-item ml-auto">
                    <label>End Date</label>
                    <div class="summary-value">{{ localMemo.travEndDate }}</div>
                  </div>
                </div>
              </div>

              <!-- HR summary -->
              <div v-if="isHrTemplate(localMemo.categoryType)" class="detail-section mt-4">
                <h3 class="section-group-title">Employee & Salary</h3>
                <div class="summary-item">
                  <label>Employee Name</label>
                  <div class="summary-value font-semibold">{{ localMemo.hrName }} ({{ localMemo.hrID }})</div>
                </div>
                <div class="summary-item mt-2">
                  <label>New Salary Total</label>
                  <div class="summary-value font-bold text-blue-600">
                    Rp {{ (Number(localMemo.newSalary?.basic || 0) + Number(localMemo.newSalary?.allowance || 0) +
                      Number(localMemo.newSalary?.position || 0)).toLocaleString('id-ID') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="modal-sections-column">
            <!-- Section 1: Core Information -->
            <!-- Rejection/Changes (Conditional) - Moved to top -->
            <div
              v-if="!isCreateMode && ['Rejected', 'Requested Changes'].includes(localMemo.status) && localMemo.rejectionReason"
              :class="['detail-section', localMemo.status === 'Rejected' ? 'rejection-alert-new' : 'requested-changes-alert-new']"
              style="margin-bottom: 1.5rem;">
              <h3 class="section-group-title"
                :class="localMemo.status === 'Rejected' ? 'text-red-700' : 'text-amber-700'">
                <component :is="localMemo.status === 'Rejected' ? X : Loader2" class="icon-small mr-1" />
                {{ localMemo.status === 'Rejected' ? 'Rejection Details' : 'Requested Changes' }}
              </h3>
              <div class="detail-row">
                <div class="detail-group">
                  <label>Concerning</label>
                  <div class="detail-value font-semibold"
                    :class="localMemo.status === 'Rejected' ? 'text-red-700' : 'text-amber-700'">
                    {{ localMemo.rejectionConcern || 'Not specified' }}
                  </div>
                </div>
                <div class="detail-group" v-if="localMemo.rejectedFields && localMemo.rejectedFields.length > 0">
                  <label>Flagged Fields</label>
                  <div class="flagged-fields-list mt-1">
                    <span v-for="field in localMemo.rejectedFields" :key="field"
                      :class="['flagged-field-badge', localMemo.status === 'Rejected' ? 'badge-red' : 'badge-amber']">
                      {{ field }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="detail-group mt-3">
                <label>{{ localMemo.status === 'Rejected' ? 'Reason for Rejection' : 'Request Details' }}</label>
                <div class="detail-value" :class="localMemo.status === 'Rejected' ? 'text-red-900' : 'text-amber-900'">
                  {{ localMemo.rejectionReason }}
                </div>
              </div>
            </div>
            <div class="detail-section">
              <h3 class="section-group-title">General Information</h3>
              <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div class="detail-group-stacked">
                  <label>Requester</label>
                  <div v-if="isCreateMode" class="detail-value font-medium text-slate-400 italic">Self ({{ currentUser
                    }})</div>
                  <div v-else class="detail-value requester-info-row" style="display: flex; align-items: center;">
                    <User class="icon-tiny mr-1 text-slate-400" />
                    <span class="requester-name font-medium">{{ localMemo.requester }}</span>
                  </div>
                </div>

                <div class="detail-group-stacked">
                  <label>Departments</label>
                  <div class="detail-value dept-flow-row" style="display: flex; align-items: center;">
                    <span class="department-marker" title="Requester Department">
                      {{ localMemo.requesterDepartment }}
                    </span>
                    <ChevronRight class="icon-tiny mx-1 text-slate-400" />
                    <span class="department-marker target" title="Target Department">
                      {{ localMemo.targetDepartment }}
                    </span>
                  </div>
                </div>

                <div v-if="!isCreateMode" class="detail-group-stacked">
                  <label>Created At</label>
                  <div class="detail-value">{{ formatDate(localMemo.createdAt) }}</div>
                </div>

                <div class="detail-group-stacked">
                  <label>Purposing of Memo</label>
                  <div class="detail-value">
                    <div class="font-semibold">{{ localMemo.categoryType || '-' }}</div>
                  </div>
                </div>

                <div v-if="!isCreateMode" class="detail-group-stacked">
                  <label>Status</label>
                  <div class="detail-value flex-align-center" style="display: flex; align-items: center;">
                    <div :class="['status-badge-premium', getStatusColor(localMemo.status)]" :title="localMemo.status"
                      style="width: max-content;">
                      <component :is="getStatusIcon(localMemo.status)" class="status-icon" />
                      <span class="badge-text" style="margin-left: 4px;">{{ localMemo.status }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <!-- Section 2: Content -->
            <template v-if="!isCreateMode || (localMemo.category && localMemo.categoryType)">
              <div class="detail-section">
                <h3 class="section-group-title">Memo Content</h3>
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                  <div class="detail-group-stacked">
                    <label>Title</label>
                    <div class="field-with-marker-wrapper">
                      <input v-if="isEditMode" type="text" v-model="localMemo.title" class="form-input" />
                      <div v-if="isEditMode && localMemo.markerDescriptions?.['Title']"
                        class="marker-description-alert">
                        <AlertCircle class="icon-tiny" />
                        <span class="marker-text">{{ localMemo.markerDescriptions['Title'] }}</span>
                      </div>
                    </div>
                    <div v-if="!isEditMode" class="detail-value font-semibold text-lg">{{ localMemo.title }}</div>
                  </div>

                  <div class="detail-group-stacked">
                    <label>Description</label>
                    <div class="field-with-marker-wrapper">
                      <textarea v-if="isEditMode" v-model="localMemo.description" class="form-textarea"
                        rows="4"></textarea>
                      <div v-if="isEditMode && localMemo.markerDescriptions?.['Description']"
                        class="marker-description-alert">
                        <AlertCircle class="icon-tiny" />
                        <span class="marker-text">{{ localMemo.markerDescriptions['Description'] }}</span>
                      </div>
                    </div>
                    <div v-if="!isEditMode" class="detail-value leading-relaxed">{{ localMemo.description }}</div>
                  </div>

                  <!-- Attachments Section -->
                  <div class="detail-group-stacked">
                    <label>Attachment ({{ localMemo.attachmentsCount }})</label>
                    <div class="mt-2">
                      <div v-if="localMemo.attachmentsCount > 0" class="attachments-grid">
                        <div v-for="n in localMemo.attachmentsCount" :key="n" class="attachment-card"
                          :class="{ 'is-edit': isEditMode }">
                          <div class="attachment-icon-box">
                            <FileText class="attachment-icon-large" />
                          </div>
                          <span class="attachment-name">Doc {{ n }}</span>
                          <button v-if="isEditMode" class="btn-remove-attachment-abs" title="Remove"
                            @click.prevent="localMemo.attachmentsCount--">
                            <X class="icon-tiny" />
                          </button>
                        </div>
                      </div>
                      <div v-else class="detail-value text-muted italic">No attachments included.</div>

                      <div v-if="isEditMode" class="mt-3">
                        <button class="btn-upload" @click.prevent="localMemo.attachmentsCount++">
                          <Plus class="icon-small" /> Add Document
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <!-- Section 3: Category Specific (if Entertainment) -->
              <div v-if="localMemo.categoryType === 'Entertainment Fund'" class="detail-section">
                <h3 class="section-group-title">Entertainment Details</h3>

                <div class="detail-group">
                  <label>Location</label>
                  <div class="field-with-marker-wrapper">
                    <input v-if="isEditMode" type="text" v-model="localMemo.entLocation" class="form-input"
                      placeholder="Type a place or click the map to pin a location..." />
                    <div v-if="isEditMode && localMemo.markerDescriptions?.['Location']"
                      class="marker-description-alert">
                      <AlertCircle class="icon-tiny" />
                      <span class="marker-text">{{ localMemo.markerDescriptions['Location'] }}</span>
                    </div>
                  </div>

                  <div class="map-container mt-2">
                    <MapPicker :locationQuery="isEditMode ? localMemo.entLocation : ''" :lat="localMemo.entLat"
                      :lng="localMemo.entLng" :editable="isEditMode" @place-selected="handlePlaceSelected" />
                  </div>
                  <div v-if="!isEditMode && !localMemo.entLat" class="detail-value text-muted italic">No location
                    provided</div>
                </div>

                <div class="detail-row">
                  <div class="detail-group">
                    <label>Payment Method</label>
                    <select v-if="isEditMode" v-model="localMemo.entPaymentMethod" class="form-select">
                      <option value="Debit/Cash">Debit/Cash</option>
                      <option value="Credit">Credit</option>
                      <option value="Debit/Cash and Credit">Debit/Cash and Credit</option>
                    </select>
                    <div v-else class="detail-value font-medium">{{ localMemo.entPaymentMethod || '-' }}</div>
                  </div>
                </div>

                <div class="detail-row">
                  <div class="detail-group"
                    v-if="['Debit/Cash', 'Debit/Cash and Credit'].includes(localMemo.entPaymentMethod)">
                    <label>Debit/Cash Amount</label>
                    <div class="input-with-prefix" v-if="isEditMode">
                      <span class="prefix">Rp</span>
                      <input type="number" v-model="localMemo.entDebitAmount" class="form-input" />
                    </div>
                    <div v-else class="detail-value font-bold text-blue-600">Rp {{ localMemo.entDebitAmount ?
                      Number(localMemo.entDebitAmount).toLocaleString('id-ID') : '0' }}</div>
                  </div>

                  <div class="detail-group"
                    v-if="['Credit', 'Debit/Cash and Credit'].includes(localMemo.entPaymentMethod)">
                    <label>Credit Amount</label>
                    <div class="input-with-prefix" v-if="isEditMode">
                      <span class="prefix">Rp</span>
                      <input type="number" v-model="localMemo.entCreditAmount" class="form-input" />
                    </div>
                    <div v-else class="detail-value font-bold text-blue-600">Rp {{ localMemo.entCreditAmount ?
                      Number(localMemo.entCreditAmount).toLocaleString('id-ID') : '0' }}</div>
                  </div>
                </div>

                <h4 class="subsection-title mt-4">Person to be Entertained</h4>
                <div class="detail-row">
                  <div class="detail-group">
                    <label>Name</label>
                    <input v-if="isEditMode" type="text" v-model="localMemo.entPersonName" class="form-input" />
                    <div v-else class="detail-value font-medium">{{ localMemo.entPersonName || '-' }}</div>
                  </div>
                  <div class="detail-group">
                    <label>Company</label>
                    <input v-if="isEditMode" type="text" v-model="localMemo.entPersonCompany" class="form-input" />
                    <div v-else class="detail-value">{{ localMemo.entPersonCompany || '-' }}</div>
                  </div>
                </div>
                <div class="detail-group">
                  <label>Role</label>
                  <input v-if="isEditMode" type="text" v-model="localMemo.entPersonRole" class="form-input" />
                  <div v-else class="detail-value text-slate-600">{{ localMemo.entPersonRole || '-' }}</div>
                </div>
              </div>

              <!-- Section 3.5: Travel Request Specific -->
              <div v-if="localMemo.categoryType === 'Pengajuan Perjalanan Dinas'" class="detail-section">
                <h3 class="section-group-title">Travel Period</h3>
                <div class="detail-row">
                  <div class="detail-group">
                    <label>Start Date</label>
                    <div v-if="isEditMode" class="date-input-group">
                      <input type="text" v-model="localMemo.travStartDate" placeholder="YYYY-MM-DD"
                        class="form-input" />
                      <div class="date-picker-trigger">
                        <Calendar class="icon-small" />
                        <input type="date" v-model="localMemo.travStartDate" class="hidden-date-picker" />
                      </div>
                    </div>
                    <div v-else class="detail-value font-medium">{{ localMemo.travStartDate || '-' }}</div>
                  </div>
                  <div class="detail-group">
                    <label>End Date</label>
                    <div v-if="isEditMode" class="date-input-group">
                      <input type="text" v-model="localMemo.travEndDate" placeholder="YYYY-MM-DD" class="form-input" />
                      <div class="date-picker-trigger">
                        <Calendar class="icon-small" />
                        <input type="date" v-model="localMemo.travEndDate" class="hidden-date-picker" />
                      </div>
                    </div>
                    <div v-else class="detail-value font-medium">{{ localMemo.travEndDate || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Section 3.6: HR Request Specific -->
              <div v-if="isHrTemplate(localMemo.categoryType)" class="modal-sections-column hr-details-container">
                <!-- Employee Information -->
                <div class="detail-section">
                  <h3 class="section-group-title">Employee Information</h3>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Types of Employees</label>
                      <select v-if="isEditMode" v-model="localMemo.hrEmployeeType" class="form-select">
                        <option value="Existing">Existing</option>
                        <option value="New">New</option>
                      </select>
                      <div v-else class="detail-value font-medium">{{ localMemo.hrEmployeeType }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Name</label>
                      <input v-if="isEditMode" type="text" v-model="localMemo.hrName" class="form-input" />
                      <div v-else class="detail-value font-medium">{{ localMemo.hrName || '-' }}</div>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Employee ID Number</label>
                      <input v-if="isEditMode" type="text" v-model="localMemo.hrID" class="form-input" />
                      <div v-else class="detail-value">{{ localMemo.hrID || '-' }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Date of Birth</label>
                      <div v-if="isEditMode" class="date-input-group">
                        <input type="text" v-model="localMemo.hrDOB" placeholder="YYYY-MM-DD" class="form-input" />
                        <div class="date-picker-trigger">
                          <Calendar class="icon-small" />
                          <input type="date" v-model="localMemo.hrDOB" class="hidden-date-picker" />
                        </div>
                      </div>
                      <div v-else class="detail-value">{{ localMemo.hrDOB || '-' }}</div>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Start Work</label>
                      <div v-if="isEditMode" class="date-input-group">
                        <input type="text" v-model="localMemo.hrStartWork" placeholder="YYYY-MM-DD"
                          class="form-input" />
                        <div class="date-picker-trigger">
                          <Calendar class="icon-small" />
                          <input type="date" v-model="localMemo.hrStartWork" class="hidden-date-picker" />
                        </div>
                      </div>
                      <div v-else class="detail-value">{{ localMemo.hrStartWork || '-' }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Division</label>
                      <input v-if="isEditMode" type="text" v-model="localMemo.hrDivision" class="form-input" />
                      <div v-else class="detail-value">{{ localMemo.hrDivision || '-' }}</div>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Branch</label>
                      <input v-if="isEditMode" type="text" v-model="localMemo.hrBranch" class="form-input" />
                      <div v-else class="detail-value">{{ localMemo.hrBranch || '-' }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Job Title</label>
                      <input v-if="isEditMode" type="text" v-model="localMemo.hrJobTitle" class="form-input" />
                      <div v-else class="detail-value">{{ localMemo.hrJobTitle || '-' }}</div>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-group">
                      <label>Status</label>
                      <select v-if="isEditMode" v-model="localMemo.hrStatus" class="form-select">
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                      <div v-else class="detail-value">{{ localMemo.hrStatus }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Number of Children</label>
                      <input v-if="isEditMode" type="number" v-model="localMemo.hrChildren" class="form-input" />
                      <div v-else class="detail-value">{{ localMemo.hrChildren ?? '0' }}</div>
                    </div>
                  </div>
                  <div class="detail-group">
                    <label>Salary Change</label>
                    <select v-if="isEditMode" v-model="localMemo.hrSalaryChange" class="form-select">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <div v-else class="detail-value">{{ localMemo.hrSalaryChange === 'yes' ? 'Yes' : 'No' }}</div>
                  </div>
                </div>

                <!-- Old Salary Breakdown (Conditional) -->
                <div v-if="localMemo.hrSalaryChange === 'yes'" class="detail-section">
                  <h3 class="section-group-title">Old Salary Breakdown</h3>
                  <div class="salary-grid">
                    <div class="detail-group">
                      <label>Basic Salary</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="localMemo.oldSalary.basic" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(localMemo.oldSalary?.basic ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Meal / Transport Allowance</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="localMemo.oldSalary.allowance" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(localMemo.oldSalary?.allowance ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Position Allowance</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="localMemo.oldSalary.position" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(localMemo.oldSalary?.position ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group salary-total-group">
                      <label>Total (Read-Only)</label>
                      <div class="detail-value font-bold text-blue-600">
                        Rp {{ (Number(localMemo.oldSalary?.basic || 0) + Number(localMemo.oldSalary?.allowance ||
                          0) + Number(localMemo.oldSalary?.position || 0)).toLocaleString('id-ID') }}
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
                        <input type="number" v-model="localMemo.newSalary.basic" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(localMemo.newSalary?.basic ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Meal / Transport Allowance</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="localMemo.newSalary.allowance" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(localMemo.newSalary?.allowance ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group">
                      <label>Position Allowance</label>
                      <div class="input-with-prefix" v-if="isEditMode">
                        <span class="prefix">Rp</span>
                        <input type="number" v-model="localMemo.newSalary.position" class="form-input" />
                      </div>
                      <div v-else class="detail-value">Rp {{ Number(localMemo.newSalary?.position ||
                        0).toLocaleString('id-ID') }}</div>
                    </div>
                    <div class="detail-group salary-total-group">
                      <label>Total (Read-Only)</label>
                      <div class="detail-value font-bold text-blue-600">
                        Rp {{ (Number(localMemo.newSalary?.basic || 0) + Number(localMemo.newSalary?.allowance ||
                          0) + Number(localMemo.newSalary?.position || 0)).toLocaleString('id-ID') }}
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
                      <input type="text" v-model="localMemo.hrEffectiveDate" placeholder="YYYY-MM-DD"
                        class="form-input" />
                      <div class="date-picker-trigger">
                        <Calendar class="icon-small" />
                        <input type="date" v-model="localMemo.hrEffectiveDate" class="hidden-date-picker" />
                      </div>
                    </div>
                    <div v-else class="detail-value font-medium">{{ localMemo.hrEffectiveDate || '-' }}</div>
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
                      <template v-for="(tier, tierIdx) in localMemo.approvalChain" :key="tierIdx">
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
                        <div v-if="tierIdx < localMemo.approvalChain.length - 1" class="chain-connector-compact">
                          <ChevronRight class="chain-arrow-compact" />
                        </div>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- History Section -->
                <div v-if="!isCreateMode && localMemo.history && localMemo.history.length > 0"
                  class="mt-4 history-collapsible border-t pt-4 border-dashed border-slate-200">
                  <button class="section-toggle-header" @click="isHistoryCollapsed = !isHistoryCollapsed">
                    <h3 class="section-group-title m-0">Memo History</h3>
                    <div class="history-toggle-icon" :class="{ 'is-open': !isHistoryCollapsed }">
                      <ChevronRight class="icon-small" />
                    </div>
                  </button>

                  <div v-if="!isHistoryCollapsed" class="history-content-wrap mt-4">
                    <div class="history-timeline">
                      <div v-for="(item, idx) in localMemo.history" :key="idx" class="timeline-item">
                        <div class="timeline-visual">
                          <div class="timeline-dot" :class="getHistoryDotColor(item.action)"></div>
                          <div v-if="idx < localMemo.history.length - 1" class="timeline-connector"></div>
                        </div>
                        <div class="timeline-content">
                          <div class="timeline-header"
                            style="justify-content: flex-start; gap: 8px; align-items: center;">
                            <span class="timeline-action font-bold" :class="getHistoryColor(item.action)">{{ item.action
                              }}</span>
                            <span class="timeline-date" style="color: #64748b; font-size: 0.75rem;">{{
                              formatDate(item.at) }}</span>
                          </div>
                          <div class="timeline-user mt-1">
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

              <!-- External System Status (Moved to Bottom) -->
              <div v-if="localMemo.externalSystem" class="detail-section external-system-info mt-4">
                <h3 class="section-group-title">External System Information</h3>
                <div class="detail-row">
                  <div class="detail-group">
                    <label>System Name</label>
                    <div class="detail-value flex-align-center">
                      <Monitor class="icon-tiny mr-2 text-slate-400" />
                      {{ localMemo.externalSystem }}
                    </div>
                  </div>
                  <div class="detail-group">
                    <label>Current Status</label>
                    <div class="detail-value">
                      <div
                        :class="['external-status-indicator', localMemo.externalStatus.toLowerCase() === 'sent' ? 'status-closed' : 'status-process']">
                        <component :is="localMemo.externalStatus.toLowerCase() === 'sent' ? CheckCircle : Clock"
                          class="icon-tiny mr-1" />
                        <span>{{ localMemo.externalStatus }}<span v-if="localMemo.externalReceiptNumber"> ({{
                          localMemo.externalReceiptNumber }})</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Action Area (Moved from footer) -->
          <div class="modal-section-actions">
            <div v-if="!isEditMode && activeTab === 'pending_approval' && localMemo.status === 'Pending'"
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
              <div v-if="getActions(localMemo).includes('remind')" class="modal-actions-group is-centered">
                <button class="btn-remind" @click="handleRemind(localMemo)">
                  <Bell class="icon-small mr-1" /> Remind Approvers
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Action Modal (Reject / Request Changes) -->
    <div v-if="isReviewModalOpen" class="modal-overlay" style="z-index: 1100;" @click.self="cancelReviewAction">
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
/* Modal Overlay & Base Content */
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
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 840px;
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

/* Header & Title */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
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

.modal-header-right {
  display: flex;
  align-items: center;
}

/* Buttons */
.btn-back,
.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
}

.btn-back {
  width: 36px;
  min-width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  flex-shrink: 0;
  padding: 0;
}

.btn-back:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}

.btn-close {
  background: none;
  border: none;
  color: #64748b;
  padding: 0.25rem;
}

.btn-close:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.mobile-back-btn {
  display: none !important;
}

@media (max-width: 1024px) {
  .mobile-back-btn {
    display: flex !important;
  }

  .desktop-close-btn {
    display: none !important;
  }

  .hide-on-mobile {
    display: none !important;
  }
}

/* Modal Body & Sections */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #f8fafc;
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

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-group {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 1.5rem;
  align-items: flex-start;
}

.detail-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-group-stacked {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.detail-group-stacked label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.detail-value {
  color: #1e293b;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Forms */
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

/* Attachments */
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
}

/* Approval Chain */
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

.approver-node-compact {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  position: relative;
}

.approver-tooltip {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(-5px);
  background: #0f172a;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.7rem;
  width: max-content;
  max-width: 160px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 1000;
}

.approver-node-compact:hover .approver-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Utilities */
.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.approved {
  background: #ecfdf5;
  color: #10b981;
}

.pending {
  background: #fffbeb;
  color: #f59e0b;
}

.rejected {
  background: #fef2f2;
  color: #ef4444;
}

.requested-changes {
  background: #fff7ed;
  color: #f97316;
}

.draft {
  background: #f8fafc;
  color: #64748b;
}

.modal-section-actions {
  margin-top: auto;
  padding-top: 1.5rem;
  padding-bottom: 1rem;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-actions-group {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  background: #f8fafc;
  gap: 1rem;
}

.btn-success {
  background: #10b981;
  color: white;
  border: none;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
}

.btn-warning {
  background: #f59e0b;
  color: white;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-draft {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

button {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ml-3 {
  margin-left: 0.75rem;
}

.ml-auto {
  margin-left: auto;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.text-blue-600 {
  color: #2563eb;
}

.font-bold {
  font-weight: 700;
}

@media (max-width: 640px) {
  .detail-group {
    grid-template-columns: 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }

  .modal-actions-group {
    flex-direction: column;
  }

  .modal-actions-group button {
    width: 100%;
  }
}

/* History */
.timeline-item {
  display: flex;
  gap: 1rem;
}

.timeline-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
}

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.4rem;
}

.timeline-connector {
  flex: 1;
  width: 2px;
  background: #f1f5f9;
}

.timeline-content {
  flex: 1;
  padding-bottom: 1.25rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

/* Travel Grid */
.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* HR Salary Grid */
.salary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .salary-grid {
    grid-template-columns: 1fr;
  }
}

/* Autocomplete Suggestions */
.suggestions-dropdown-teleport {
  position: fixed;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 240px;
}

.suggestion-item {
  padding: 0.6rem 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.suggestion-item:hover {
  background: #f8fafc;
}

.suggestion-name {
  font-weight: 600;
  color: #1e293b;
}

.suggestion-division {
  font-size: 0.75rem;
  color: #64748b;
}
</style>
