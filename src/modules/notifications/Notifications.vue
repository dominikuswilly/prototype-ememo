<script setup>
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-vue-next';

const props = defineProps({
  notifications: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['mark-as-read']);

const getIcon = (title) => {
  if (title.toLowerCase().includes('approved')) return CheckCircle;
  if (title.toLowerCase().includes('reminder')) return AlertTriangle;
  return Info;
};

const getIconClass = (title) => {
  if (title.toLowerCase().includes('approved')) return 'icon-success';
  if (title.toLowerCase().includes('reminder')) return 'icon-warning';
  return 'icon-info';
};
</script>

<template>
  <div class="notifications-container">
    <div v-if="notifications.length === 0" class="empty-state">
      <Bell class="empty-icon" />
      <h3>No new notifications</h3>
      <p>We'll notify you when something important happens.</p>
    </div>

    <div v-else class="notifications-list">
      <div v-for="notif in notifications" :key="notif.id" :class="['notif-item', { unread: !notif.read }]"
        @click="$emit('mark-as-read', notif.id)">
        <div class="notif-icon-box" :class="getIconClass(notif.title)">
          <component :is="getIcon(notif.title)" class="notif-item-icon" />
        </div>
        <div class="notif-content">
          <div class="notif-header">
            <h4 class="notif-title">{{ notif.title }}</h4>
            <span v-if="!notif.read" class="unread-dot"></span>
          </div>
          <p class="notif-time">Just now</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 20px;
  border: 1px dashed #e2e8f0;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-muted);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.25rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.notif-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
  border-color: #e2e8f0;
}

.notif-item.unread {
  background: linear-gradient(to right, rgba(225, 29, 46, 0.02), white);
  border-left: 4px solid var(--brand-primary);
}

.notif-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-success {
  background: #ecfdf5;
  color: #10b981;
}

.icon-warning {
  background: #fffbeb;
  color: #f59e0b;
}

.icon-info {
  background: #eff6ff;
  color: #3b82f6;
}

.notif-item-icon {
  width: 20px;
  height: 20px;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.notif-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: var(--brand-primary);
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.1);
}

.notif-time {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 768px) {
  .notifications-container {
    padding: 0;
  }

  .notif-item {
    border-radius: 12px;
    padding: 1rem;
  }
}
</style>
