<script setup>
import { computed } from 'vue';
import { 
  BarChart2, CheckCircle, Clock, XCircle, FileText, 
  TrendingUp, Users, Calendar, ArrowRight
} from 'lucide-vue-next';

const props = defineProps({
  memos: {
    type: Array,
    required: true
  },
  members: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['view-list']);

const stats = computed(() => {
  const total = props.memos.length;
  const approved = props.memos.filter(m => m.status === 'Approved').length;
  const pending = props.memos.filter(m => m.status === 'Pending').length;
  const rejected = props.memos.filter(m => m.status === 'Rejected').length;
  const requestedChanges = props.memos.filter(m => m.status === 'Requested Changes').length;
  
  return {
    total,
    approved,
    pending,
    rejected,
    requestedChanges,
    completionRate: total > 0 ? Math.round((approved / total) * 100) : 0
  };
});

const categoryStats = computed(() => {
  const counts = {};
  props.memos.forEach(m => {
    counts[m.category] = (counts[m.category] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
});

const recentMemos = computed(() => {
  return [...props.memos]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);
});

const memberStats = computed(() => {
  if (!props.members || props.members.length === 0) return [];
  
  return props.members.map(member => {
    const memberMemos = props.memos.filter(m => m.requester === member.name);
    const approved = memberMemos.filter(m => m.status === 'Approved').length;
    const pending = memberMemos.filter(m => m.status === 'Pending').length;
    
    return {
      ...member,
      total: memberMemos.length,
      approved,
      pending,
      completionRate: memberMemos.length > 0 ? Math.round((approved / memberMemos.length) * 100) : 0
    };
  }).sort((a, b) => b.total - a.total);
});

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusColorClass = (status) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'requested changes': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};
</script>

<template>
  <div class="summary-container">
    <!-- Grid Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrap total">
          <FileText class="stat-icon" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Memos</span>
          <h2 class="stat-value">{{ stats.total }}</h2>
        </div>
        <div class="stat-trending up">
          <TrendingUp class="trending-icon" />
          <span>+12%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrap pending">
          <Clock class="stat-icon" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Pending</span>
          <h2 class="stat-value">{{ stats.pending }}</h2>
        </div>
        <div class="stat-sublabel">Needs Action</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrap approved">
          <CheckCircle class="stat-icon" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Approved</span>
          <h2 class="stat-value">{{ stats.approved }}</h2>
        </div>
        <div class="stat-progress">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: stats.completionRate + '%' }"></div>
          </div>
          <span>{{ stats.completionRate }}% Rate</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrap rejected">
          <XCircle class="stat-icon" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Rejected</span>
          <h2 class="stat-value">{{ stats.rejected }}</h2>
        </div>
        <div class="stat-sublabel text-red-500">Requires Review</div>
      </div>
    </div>

    <div class="summary-main-content">
      <!-- Category Breakdown -->
      <div class="summary-section category-breakdown">
        <div class="section-header">
          <h3>Category Distribution</h3>
          <BarChart2 class="icon-muted" />
        </div>
        <div class="category-list">
          <div v-for="cat in categoryStats" :key="cat.name" class="category-item">
            <div class="category-info">
              <span class="category-name">{{ cat.name }}</span>
              <span class="category-count">{{ cat.count }}</span>
            </div>
            <div class="category-progress-bar">
              <div class="bar-fill" :style="{ width: (cat.count / stats.total * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Member Statistics (Team Overview) -->
      <div v-if="memberStats.length > 0" class="summary-section team-overview">
        <div class="section-header">
          <h3>Team Overview</h3>
          <Users class="icon-muted" />
        </div>
        <div class="member-list">
          <div v-for="member in memberStats.slice(0, 5)" :key="member.name" class="member-stat-item">
            <div class="member-header">
              <div class="member-avatar-sm">
                {{ member.name.substring(0, 1) }}
              </div>
              <div class="member-name-wrap">
                <span class="member-name-text">{{ member.name }}</span>
                <span class="member-role-text">{{ member.role }}</span>
              </div>
              <div class="member-total-badge">
                {{ member.total }} Memos
              </div>
            </div>
            <div class="member-progress-row">
              <div class="member-progress-bar">
                <div class="member-bar-fill" :style="{ width: member.completionRate + '%' }"></div>
              </div>
              <span class="member-rate">{{ member.completionRate }}%</span>
            </div>
            <div class="member-footer-stats">
              <span class="stat-mini"><span class="dot-green"></span> {{ member.approved }} Approved</span>
              <span class="stat-mini"><span class="dot-amber"></span> {{ member.pending }} Pending</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="summary-section recent-activity">
        <div class="section-header">
          <h3>Recent Memos</h3>
          <button class="btn-text-link" @click="emit('view-list')">
            View All <ArrowRight class="icon-tiny" />
          </button>
        </div>
        <div class="recent-list">
          <div v-for="memo in recentMemos" :key="memo.id" class="recent-memo-item" @click="emit('view-list')">
            <div class="memo-avatar">
              <span class="initials">{{ memo.requester.substring(0, 1) }}</span>
            </div>
            <div class="memo-content">
              <div class="memo-top">
                <span class="memo-title-sm">{{ memo.title }}</span>
                <span :class="['status-pill', getStatusColorClass(memo.status)]">{{ memo.status }}</span>
              </div>
              <div class="memo-meta">
                <span class="memo-author">{{ memo.requester }}</span>
                <span class="dot">•</span>
                <span class="memo-date">{{ formatDate(memo.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 540px) {
  .stats-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f1f5f9;
}

@media (max-width: 640px) {
  .stat-card {
    padding: 1rem;
    border-radius: 12px;
  }
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.08);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 24px;
  height: 24px;
}

@media (max-width: 640px) {
  .stat-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    margin-bottom: 0.75rem;
  }
  .stat-icon {
    width: 18px;
    height: 18px;
  }
}

.stat-icon-wrap.total { background: #eff6ff; color: #2563eb; }
.stat-icon-wrap.pending { background: #fffbeb; color: #d97706; }
.stat-icon-wrap.approved { background: #f0fdf4; color: #16a34a; }
.stat-icon-wrap.rejected { background: #fef2f2; color: #dc2626; }

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0.25rem 0;
}

@media (max-width: 640px) {
  .stat-value {
    font-size: 1.5rem;
  }
  .stat-label {
    font-size: 0.75rem;
  }
}

.stat-trending {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 99px;
}

.stat-trending.up { background: #ecfdf5; color: #059669; }

.stat-sublabel {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #16a34a;
  border-radius: 2px;
}

.stat-progress span {
  font-size: 0.75rem;
  font-weight: 600;
  color: #16a34a;
  white-space: nowrap;
}

.summary-main-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .summary-main-content {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .summary-container {
    gap: 1rem;
  }
  .summary-section {
    padding: 1.25rem;
  }
}

.summary-section {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.category-name {
  font-weight: 600;
  color: #475569;
}

.category-count {
  font-weight: 700;
  color: #0f172a;
}

.category-progress-bar {
  height: 8px;
  background: #f8fafc;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 4px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recent-memo-item {
  padding: 1rem;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.recent-memo-item:hover {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateX(4px);
}

.memo-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.initials {
  font-weight: 700;
  color: #475569;
}

.memo-content {
  flex: 1;
  min-width: 0;
}

.memo-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  gap: 0.5rem;
  min-width: 0; /* Allow container to shrink for children truncation */
}

.memo-title-sm {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0; /* Allow child to be smaller than its content */
}

.status-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0; /* Prevent pill from shrinking */
}

.memo-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.dot {
  color: #cbd5e1;
}

.btn-text-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-text-link:hover {
  background: #eff6ff;
  text-decoration: underline;
}

.icon-muted {
  color: #94a3b8;
  width: 20px;
  height: 20px;
}

.icon-tiny {
  width: 14px;
  height: 14px;
}

/* Team Overview Styles */
.member-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.member-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.member-stat-item:hover {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);
  transform: translateX(4px);
}

.member-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: #475569;
}

.member-name-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.member-name-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role-text {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-total-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.2rem 0.5rem;
  border-radius: 99px;
  white-space: nowrap;
}

.member-progress-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.member-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 3px;
}

.member-rate {
  font-size: 0.75rem;
  font-weight: 700;
  color: #10b981;
  min-width: 32px;
  text-align: right;
}

.member-footer-stats {
  display: flex;
  gap: 1rem;
}

.stat-mini {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dot-green { width: 6px; height: 6px; background: #10b981; border-radius: 50%; }
.dot-amber { width: 6px; height: 6px; background: #f59e0b; border-radius: 50%; }
</style>
