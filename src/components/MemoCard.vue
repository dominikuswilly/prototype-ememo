<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import {
  Eye, Edit, Trash2, X, Paperclip, Bell, Calendar,
  CheckCircle, Clock, AlertCircle, FileText, User, Layers, Check, XCircle, Zap
} from 'lucide-vue-next';

const props = defineProps({
  memo: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  currentUser: { type: String, default: 'Willy' }
});

const emit = defineEmits(['select', 'deselect', 'press-start', 'press-end', 'view', 'remind', 'delete']);

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const pad = (n) => n.toString().padStart(2, '0');
  const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (!includeTime) return datePart;
  return `${datePart} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
  if (memo.status === 'In Review') {
    const actions = ['view'];
    if (isRequester) actions.push('remind');
    return actions;
  }
  if (memo.status === 'Rejected') return ['view'];
  if (memo.status === 'Requested Changes') return ['view', 'update'];
  if (memo.status === 'Draft') return ['view', 'edit', 'delete'];
  return ['view'];
};

const handleCardClick = () => emit('select', props.memo);
const handlePressStart = () => emit('press-start', props.memo);
const handlePressEnd = () => emit('press-end');
</script>

<template>
  <div class="memo-card" :class="['status-' + getStatusColor(memo.status), { active: isSelected }]"
    @click="handleCardClick" @touchstart="handlePressStart" @touchend="handlePressEnd">
    
    <div class="memo-card-header-new">
      <div class="header-left">
        <h3 class="memo-card-title-new">{{ memo.title }}</h3>
        <span class="memo-card-number-new">#{{ memo.memoNumber }}</span>
      </div>
      <div class="header-right">
        <div class="status-icon-ghost">
          <component :is="getStatusIcon(memo.status)" class="status-icon-large" />
        </div>
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
      
      <!-- System Integration Badge -->
      <div v-if="memo.externalSystem" class="grid-item full-width mt-1">
        <div :class="['system-badge', memo.externalReceiptNumber ? 'badge-sent' : 'badge-waiting']">
          <Zap class="badge-icon" />
          <span class="badge-content">
            {{ memo.externalSystem }}
            <template v-if="memo.externalReceiptNumber">
              <span class="badge-sep">•</span>
              <span class="badge-ref">#{{ memo.externalReceiptNumber }}</span>
            </template>
            <template v-else>
              <span class="badge-sep">:</span>
              <span class="badge-status">Waiting</span>
            </template>
          </span>
        </div>
      </div>
    </div>

    <div class="card-footer-separator-new"></div>

    <div class="memo-card-footer-new">
      <div class="progress-row-new">
        <span class="progress-label-new">{{ getProgressLabel(memo) }}</span>
        <div class="card-actions-mini-new">
          <button class="mini-action-btn view" @click.stop="emit('view', memo, false)" title="View Details">
            <Eye class="icon-tiny" />
          </button>
          <button v-if="getActions(memo).includes('edit') || getActions(memo).includes('update')" class="mini-action-btn edit"
            @click.stop="emit('view', memo, true)" title="Edit/Update">
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
      <div v-if="isSelected" class="card-overlay" @click.stop>
        <div class="overlay-btns">
          <button class="overlay-main-btn view" @click="emit('view', memo, false)">
            <Eye class="icon-small" /> Open Memo
          </button>
          <button v-if="getActions(memo).includes('update') || getActions(memo).includes('edit')"
            class="overlay-main-btn edit" @click="emit('view', memo, true)">
            <Edit class="icon-small" /> {{ getActions(memo).includes('edit') ? 'Edit Draft' : 'Update Content' }}
          </button>
          <button v-if="getActions(memo).includes('remind')" class="overlay-main-btn remind"
            @click="emit('remind', memo)">
            <Bell class="icon-small" /> Remind Approvers
          </button>
          <button v-if="getActions(memo).includes('delete')" class="overlay-main-btn delete"
            @click="emit('delete', memo)">
            <Trash2 class="icon-small" /> Delete Draft
          </button>
        </div>
        <button class="overlay-close" @click="emit('deselect')">
          <X class="icon-small" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
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
.status-in-review { border-left-color: #f59e0b; }
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

.card-footer-separator-new { height: 1px; background: #e2e8f0; margin-top: auto; }
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

@media (max-width: 640px) {
  .memo-card { border-left-width: 1px; }
}

/* System Badge Styles */
.system-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  transition: all 0.2s;
}

.badge-icon {
  width: 12px;
  height: 12px;
}

.badge-waiting {
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.badge-sent {
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
}

.badge-sep {
  opacity: 0.5;
  margin: 0 0.25rem;
}

.badge-ref {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.mt-1 { margin-top: 0.25rem; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
