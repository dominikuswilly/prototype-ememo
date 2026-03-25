<script setup>
import { ref } from 'vue';
import { 
  BarChart2, Settings, ChevronLeft, ChevronRight, 
  FileText, LayoutGrid, Bell, User
} from 'lucide-vue-next';

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  },
  activeView: {
    type: String,
    default: 'summary'
  }
});

const isCollapsed = ref(false);
const emit = defineEmits(['collapse', 'close', 'change-view']);

const toggleCollapse = () => {
  if (props.isMobile) return;
  isCollapsed.value = !isCollapsed.value;
  emit('collapse', isCollapsed.value);
};

const handleNavClick = (view) => {
  emit('change-view', view);
  if (props.isMobile) {
    emit('close');
  }
};
</script>

<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-header">
      <h2 v-if="!isCollapsed" @click="handleNavClick('summary')" style="cursor: pointer;">eMemo</h2>
      <div v-else class="logo-collapsed" @click="handleNavClick('summary')" style="cursor: pointer;">eM</div>
      
      <!-- Desktop Collapse Toggle -->
      <button v-if="!isMobile" class="collapse-toggle" @click="toggleCollapse">
        <ChevronLeft v-if="!isCollapsed" class="icon-small" />
        <ChevronRight v-else class="icon-small" />
      </button>

      <!-- Mobile Close Button -->
      <button v-else class="mobile-close-btn" @click="$emit('close')">
        <X class="icon-small" />
      </button>
    </div>
    <nav class="sidebar-nav">
      <a href="#" :class="['nav-link', { active: activeView === 'summary' }]" title="Summary" @click.prevent="handleNavClick('summary')">
        <BarChart2 class="nav-icon" />
        <span v-if="!isCollapsed">Summary</span>
      </a>
      <a href="#" :class="['nav-link', { active: activeView === 'list' }]" title="Memo List" @click.prevent="handleNavClick('list')">
        <LayoutGrid class="nav-icon" />
        <span v-if="!isCollapsed">Memo List</span>
      </a>
      <div class="nav-divider"></div>
      <a href="#" class="nav-link" title="Notifications" @click.prevent="handleNavClick('notifications')">
        <Bell class="nav-icon" />
        <span v-if="!isCollapsed">Notifications</span>
      </a>
      <a href="#" class="nav-link" title="Settings" @click.prevent="handleNavClick('settings')">
        <Settings class="nav-icon" />
        <span v-if="!isCollapsed">Settings</span>
      </a>
    </nav>
    <div class="sidebar-user" v-if="!isCollapsed">
      <div class="user-avatar">
        <User class="avatar-icon" />
      </div>
      <div class="user-info">
        <div class="user-name">Willy</div>
        <div class="user-role">CTO</div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background-color: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: white;
}

.logo-collapsed {
  font-size: 1.25rem;
  font-weight: 800;
  color: #3b82f6;
  width: 100%;
  text-align: center;
}

.collapse-toggle {
  position: absolute;
  right: -12px;
  top: 75px;
  width: 24px;
  height: 24px;
  background: #3b82f6;
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
  transition: transform 0.2s;
}

.collapse-toggle:hover {
  transform: scale(1.1);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0.75rem;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  padding: 0.8rem 1rem;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 1rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-link.active {
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 1rem 0.5rem;
}

.sidebar-user {
  margin-top: auto;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.avatar-icon {
  width: 20px;
  height: 20px;
}

.user-info {
  overflow: hidden;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: #94a3b8;
}

.mobile-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.mobile-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.icon-small {
  width: 14px;
  height: 14px;
}
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    box-shadow: 20px 0 50px rgba(0, 0, 0, 0.3);
  }
}
</style>
