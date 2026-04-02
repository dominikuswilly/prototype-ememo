<script setup>
import { ref, computed } from 'vue';
import { ArrowLeft, Search, X, DollarSign, FileText, Shield, Building2, Users, Monitor, Briefcase, Wrench } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'select-template']);

const wizardStep = ref(1);
const wizardDivision = ref('');
const wizardSearch = ref('');

// Template Data
const templateListFull = [
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

const selectWizardDivision = (division) => {
  wizardDivision.value = division;
  wizardStep.value = 2;
  wizardSearch.value = '';
};

const wizardDivisionTemplates = computed(() => templateListFull.filter(t => t.division === wizardDivision.value));

const closeWizard = () => {
  emit('close');
  // Optional: reset step after animation completes if desired
  setTimeout(() => {
    wizardStep.value = 1;
    wizardSearch.value = '';
  }, 300);
};

const selectWizardTemplate = (item) => {
  emit('select-template', item);
  closeWizard();
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeWizard">
    <div class="wizard-modal">
      <div class="wizard-header">
        <div class="wizard-header-left">
          <button v-if="wizardStep === 2 && !isSearchingInWizard" class="btn-back" @click="wizardStep = 1">
            <ArrowLeft class="icon" />
          </button>
          <div class="wizard-search-container">
            <Search class="search-icon" />
            <input v-model="wizardSearch" type="text" placeholder="Search templates..." class="wizard-search-input"
              autofocus />
          </div>
        </div>
        <button class="btn-close" @click="closeWizard">
          <X class="icon" />
        </button>
      </div>
      <div class="wizard-body">
        <div v-if="isSearchingInWizard" class="template-list">
          <button v-for="tpl in wizardFilteredTemplates" :key="tpl.name" class="template-item"
            @click="selectWizardTemplate(tpl)">
            <span class="font-semibold text-slate-800">{{ tpl.name }}</span>
            <span class="text-xs text-slate-500 ml-2">({{ tpl.division }})</span>
          </button>
          <div v-if="wizardFilteredTemplates.length === 0" class="text-center py-8 text-slate-400">
            No templates found matching "{{ wizardSearch }}"
          </div>
        </div>
        <div v-else-if="wizardStep === 1" class="division-grid">
          <button v-for="div in divisions" :key="div.name" class="division-card" @click="selectWizardDivision(div.name)"
            :style="{ '--div-color': div.color, '--div-bg': div.bg, '--div-border': div.borderColor }">
            <div class="division-icon-wrap">
              <component :is="div.component" class="division-icon" />
            </div>
            <div class="division-info">
              <div class="division-name">{{ div.name }}</div>
              <div class="division-count">{{ div.count }} items</div>
            </div>
          </button>
        </div>
        <div v-else class="template-list">
          <button v-for="tpl in wizardDivisionTemplates" :key="tpl.name" class="template-item"
            @click="selectWizardTemplate(tpl)">
            <span class="font-semibold text-slate-800">{{ tpl.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.wizard-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 540px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
}

.wizard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.wizard-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.wizard-search-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #94a3b8;
}

.wizard-search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  background: white;
}

.wizard-search-input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.btn-back,
.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover,
.btn-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-close {
  border: none;
  background: transparent;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.wizard-body {
  padding: 1.5rem;
  overflow-y: auto;
  background-color: white;
}

.division-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.division-card {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border-radius: 12px;
  border: 2px solid var(--div-border);
  background: var(--div-bg);
  color: var(--div-color);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.division-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.division-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.division-icon {
  width: 20px;
  height: 20px;
}

.division-name {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.division-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.template-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.template-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(4px);
}

@media (max-width: 640px) {
  .division-grid {
    grid-template-columns: 1fr;
  }
}
</style>
