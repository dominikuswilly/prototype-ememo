<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import {
  Eye, Edit, Trash2, Paperclip, Bell, Calendar,
  CheckCircle, Clock, AlertCircle, FileText, User, Layers, Check, XCircle
} from 'lucide-vue-next';

const props = defineProps({
  memo: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  currentUser: { type: String, default: 'Willy' }
});

const emit = defineEmits(['select', 'view', 'remind', 'delete']);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getStatusColor = (status) => {
  if (!status) return 'default';
  switch (status.toLowerCase()) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    case 'in review': return 'in-review';
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
    case 'in review': return Clock;
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

const getActions = (memo) => {
  const isRequester = memo.requester === props.currentUser;
  const actions = ['view'];
  if (memo.status === 'In Review' && isRequester) actions.push('remind');
  if (memo.status === 'Requested Changes') actions.push('update');
  if (memo.status === 'Draft') actions.push('edit', 'delete');
  return actions;
};
</script>

<template>
  <div class="memo-row" :class="['status-' + getStatusColor(memo.status), { active: isSelected }]" @click="emit('select', memo)">
    <div class="col-number">
      <span class="memo-number">#{{ memo.memoNumber }}</span>
    </div>
    
    <div class="col-title">
      <div class="title-wrap">
        <component :is="getStatusIcon(memo.status)" class="status-icon-small" />
        <span class="memo-title" :title="memo.title">{{ memo.title }}</span>
      </div>
    </div>

    <div class="col-requester">
      <div class="requester-info">
        <User class="icon-tiny" />
        <span>{{ memo.requester }}</span>
      </div>
    </div>

    <div class="col-dept">
      <div class="dept-path">
        <span class="dept-tag">{{ memo.requesterDepartment }}</span>
        <span class="path-arrow">→</span>
        <span class="dept-tag">{{ memo.targetDepartment }}</span>
      </div>
    </div>

    <div class="col-date">
      <div class="date-info">
        <Calendar class="icon-tiny" />
        <span>{{ formatDate(memo.createdAt) }}</span>
      </div>
    </div>

    <div class="col-progress">
      <div class="progress-container">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: getApprovalProgress(memo) + '%' }"></div>
        </div>
        <span class="progress-pct">{{ getApprovalProgress(memo) }}%</span>
      </div>
    </div>

    <div class="col-actions" @click.stop>
      <button class="row-action-btn view" @click="emit('view', memo, false)" title="View">
        <Eye class="icon-small" />
      </button>
      <button v-if="getActions(memo).includes('edit') || getActions(memo).includes('update')" 
        class="row-action-btn edit" @click="emit('view', memo, true)" title="Edit">
        <Edit class="icon-small" />
      </button>
      <button v-if="getActions(memo).includes('remind')" 
        class="row-action-btn remind" @click="emit('remind', memo)" title="Remind">
        <Bell class="icon-small" />
      </button>
      <button v-if="getActions(memo).includes('delete')" 
        class="row-action-btn delete" @click="emit('delete', memo)" title="Delete">
        <Trash2 class="icon-small" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.memo-row {
  display: grid;
  grid-template-columns: 100px 1fr 150px 220px 130px 160px 180px;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.memo-row:hover {
  background: #f8fafc;
  transform: translateX(4px);
}

.memo-row.active {
  background: #f1f5f9;
  border-left-color: var(--brand-primary);
}

.col-number { font-family: ui-monospace, monospace; font-size: 0.8rem; color: #64748b; font-weight: 600; }
.col-title { min-width: 0; }
.title-wrap { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
.memo-title { 
  font-weight: 700; 
  color: #1e293b; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

.status-icon-small { width: 18px; height: 18px; flex-shrink: 0; }
.status-approved .status-icon-small { color: #10b981; }
.status-rejected .status-icon-small { color: #ef4444; }
.status-in-review .status-icon-small { color: #f59e0b; }

.requester-info, .date-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #475569; font-weight: 500; }
.icon-tiny { width: 14px; height: 14px; color: #94a3b8; }
.icon-small { width: 16px; height: 16px; }

.dept-path { display: flex; align-items: center; gap: 0.4rem; }
.dept-tag { 
  background: #eff6ff; 
  color: #1e40af; 
  font-size: 0.7rem; 
  font-weight: 700; 
  padding: 0.15rem 0.4rem; 
  border-radius: 4px; 
}
.path-arrow { color: #94a3b8; font-size: 0.8rem; }

.progress-container { display: flex; align-items: center; gap: 0.75rem; }
.progress-bar-bg { flex: 1; height: 6px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: var(--brand-primary); transition: width 0.3s; }
.status-approved .progress-bar-fill { background: #10b981; }
.progress-pct { font-size: 0.75rem; font-weight: 700; color: #64748b; width: 30px; }

.col-actions { display: flex; justify-content: flex-end; gap: 0.4rem; }
.row-action-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.row-action-btn:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }
.row-action-btn.view:hover { color: var(--brand-primary); background: #fef2f2; border-color: #fee2e2; }
.row-action-btn.delete:hover { color: #ef4444; background: #fef2f2; border-color: #fee2e2; }

@media (max-width: 1200px) {
  .memo-row { grid-template-columns: 80px 1fr 120px 180px 120px 0 140px; }
  .col-progress { display: none; }
}

@media (max-width: 1024px) {
  .memo-row { grid-template-columns: 0 1fr 0 0 120px 0 140px; }
  .col-number, .col-requester, .col-dept { display: none; }
}
</style>
