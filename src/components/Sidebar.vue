<script setup>
import { ref } from 'vue';
import {
  BarChart2, Settings, ChevronLeft, ChevronRight,
  FileText, LayoutGrid, Bell, User, X,
  LayoutDashboard, CalendarCheck, Presentation,
  GraduationCap, Shield, ClipboardList, Newspaper,
  UserCheck, Globe, Users, Network, Building2,
  ChevronDown
} from 'lucide-vue-next';

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  },
  activeView: {
    type: String,
    default: 'ememo-summary'
  },
  activeTab: {
    type: String,
    default: 'all'
  },
  pendingCount: {
    type: Number,
    default: 0
  }
});

const isCollapsed = ref(false);
const expandedGroups = ref(['application']); // Default open Application

const emit = defineEmits(['collapse', 'close', 'change-view']);

const menuData = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    view: 'dashboard'
  },
  {
    id: 'application',
    label: 'Application',
    isGroup: true,
    children: [
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck, view: 'attendance' },
      {
        id: 'ememo',
        label: 'EMemo',
        icon: FileText,
        isSubGroup: true,
        children: [
          { id: 'ememo-summary', label: 'Summary', icon: BarChart2, view: 'ememo-summary' },
          {
            id: 'ememo-list-group',
            label: 'Memo List',
            icon: LayoutGrid,
            isSubSubGroup: true,
            view: 'ememo-list',
            children: [
              { id: 'memo-all', label: 'All Memos', icon: LayoutGrid, view: 'ememo-list', tab: 'all' },
              { id: 'memo-my', label: 'My Memos', icon: User, view: 'ememo-list', tab: 'my_memos' },
              { id: 'memo-pending', label: 'Needs My Approval', icon: CalendarCheck, view: 'ememo-list', tab: 'pending_approval', hasBadge: true }
            ]
          }
        ]
      },
      { id: 'presentations', label: 'Presentations', icon: Presentation, view: 'presentations' },
      { id: 'training', label: 'Training', icon: GraduationCap, view: 'training' },
      { id: 'insurance-policy', label: 'Insurance Policy', icon: Shield, view: 'insurance-policy' },
      { id: 'policy-claims', label: 'Policy Claims', icon: ClipboardList, view: 'policy-claims' },
      { id: 'corporate-news', label: 'Corporate News', icon: Newspaper, view: 'corporate-news' },
      { id: 'employee-requests', label: 'Employee Requests', icon: UserCheck, view: 'employee-requests' },
      { id: 'brokerage', label: 'Brokerage', icon: Globe, view: 'brokerage' },
      { id: 'guest-management', label: 'Guest Management', icon: Users, view: 'guest-management' }
    ]
  },
  {
    id: 'administration',
    label: 'Administration',
    isGroup: true,
    children: [
      { id: 'user-management', label: 'User Management', icon: Users, view: 'user-management' },
      { id: 'division', label: 'Division', icon: Network, view: 'division' },
      { id: 'department', label: 'Department', icon: Building2, view: 'department' }
    ]
  }
];

const toggleCollapse = () => {
  if (props.isMobile) return;
  isCollapsed.value = !isCollapsed.value;
  emit('collapse', isCollapsed.value);
};

const toggleGroup = (groupId) => {
  if (isCollapsed.value && !props.isMobile) {
    isCollapsed.value = false;
    emit('collapse', false);
  }
  const index = expandedGroups.value.indexOf(groupId);
  if (index > -1) {
    expandedGroups.value.splice(index, 1);
  } else {
    expandedGroups.value.push(groupId);
  }
};

const handleNavClick = (view, tab = null) => {
  if (!view) return;
  emit('change-view', { view, tab });
  if (props.isMobile) {
    emit('close');
  }
};

const isGroupExpanded = (groupId) => expandedGroups.value.includes(groupId);
</script>

<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-header">
      <div v-if="!isCollapsed" class="branding" @click="handleNavClick('dashboard')">
        <h2 class="brand-name">KBRU</h2>
        <span class="brand-subtitle">Insurance Brokers</span>
      </div>
      <div v-else class="logo-collapsed" @click="handleNavClick('dashboard')">KB</div>

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

    <nav class="sidebar-nav custom-scrollbar">
      <div v-for="item in menuData" :key="item.id" class="nav-item-container">

        <!-- Group Header -->
        <template v-if="item.isGroup">
          <div :class="['nav-group-header', { expanded: isGroupExpanded(item.id) }]" @click="toggleGroup(item.id)">
            <span v-if="!isCollapsed" class="group-label">{{ item.label }}</span>
            <div v-else class="group-divider"></div>
            <ChevronDown v-if="!isCollapsed" :class="['chevron-icon', { rotated: isGroupExpanded(item.id) }]" />
          </div>

          <!-- Group Children -->
          <div v-if="isGroupExpanded(item.id) || isCollapsed" class="nav-group-content">
            <template v-for="child in item.children" :key="child.id">

              <!-- SubGroup (Nested) -->
              <template v-if="child.isSubGroup">
                <div :class="['nav-link sub-group-toggle', { active: child.children.some(c => c.view === activeView) }]"
                  @click="toggleGroup(child.id)" :title="child.label">
                  <div class="sub-group-info">
                    <component :is="child.icon" class="nav-icon" />
                    <span v-if="!isCollapsed">{{ child.label }}</span>
                  </div>
                  <ChevronDown v-if="!isCollapsed"
                    :class="['chevron-icon-sm', { rotated: isGroupExpanded(child.id) }]" />
                </div>

                <div v-if="isGroupExpanded(child.id) && !isCollapsed" class="sub-group-content">
                  <template v-for="subChild in child.children" :key="subChild.id">

                    <!-- SubSubGroup Toggle (Recursive-lite) -->
                    <template v-if="subChild.isSubSubGroup">
                      <div @click="toggleGroup(subChild.id)"
                        :class="['nav-link sub-link sub-group-toggle', { active: subChild.view === activeView }]">
                        <div class="sub-group-info">
                          <component :is="subChild.icon" class="nav-icon-xs" />
                          <span>{{ subChild.label }}</span>
                        </div>
                        <ChevronDown :class="['chevron-icon-sm', { rotated: isGroupExpanded(subChild.id) }]" />
                      </div>

                      <div v-if="isGroupExpanded(subChild.id)" class="sub-sub-group-content">
                        <a v-for="grandChild in subChild.children" :key="grandChild.id" href="#"
                          :class="['nav-link sub-sub-link', { active: activeView === grandChild.view && activeTab === grandChild.tab }]"
                          @click.prevent="handleNavClick(grandChild.view, grandChild.tab)">
                          <component :is="grandChild.icon" class="nav-icon-xs" />
                          <span>{{ grandChild.label }}</span>
                          <span v-if="grandChild.hasBadge && pendingCount > 0" class="sidebar-badge">{{ pendingCount
                            }}</span>
                        </a>
                      </div>
                    </template>

                    <!-- Regular SubLink -->
                    <a v-else href="#" :class="['nav-link sub-link', { active: activeView === subChild.view }]"
                      @click.prevent="handleNavClick(subChild.view)">
                      <component :is="subChild.icon" class="nav-icon-xs" />
                      <span>{{ subChild.label }}</span>
                    </a>
                  </template>
                </div>
              </template>

              <!-- Standard Link -->
              <a v-else href="#" :class="['nav-link', { active: activeView === child.view }]" :title="child.label"
                @click.prevent="handleNavClick(child.view)">
                <component :is="child.icon" class="nav-icon" />
                <span v-if="!isCollapsed">{{ child.label }}</span>
              </a>
            </template>
          </div>
        </template>

        <!-- Direct Link (e.g. Dashboard) -->
        <a v-else href="#" :class="['nav-link root-link', { active: activeView === item.view }]" :title="item.label"
          @click.prevent="handleNavClick(item.view)">
          <component :is="item.icon" class="nav-icon" />
          <span v-if="!isCollapsed">{{ item.label }}</span>
        </a>
      </div>

      <div class="nav-divider"></div>

      <!-- Existing / Bottom items -->
      <a href="#" :class="['nav-link', { active: activeView === 'notifications' }]" title="Notifications"
        @click.prevent="handleNavClick('notifications')">
        <Bell class="nav-icon" />
        <span v-if="!isCollapsed">Notifications</span>
      </a>
      <a href="#" :class="['nav-link', { active: activeView === 'settings' }]" title="Settings"
        @click.prevent="handleNavClick('settings')">
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
  background-color: var(--brand-dark);
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
  padding: 1rem 1.5rem;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.branding {
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: white;
  line-height: 1;
  text-shadow: 2px 2px 0 var(--brand-primary);
}

.brand-subtitle {
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 700;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.logo-collapsed {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--brand-primary);
  width: 100%;
  text-align: center;
  cursor: pointer;
}

.collapse-toggle {
  position: absolute;
  right: -12px;
  top: 70px;
  width: 24px;
  height: 24px;
  background: var(--brand-primary);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: transform 0.2s;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  gap: 0.25rem;
  flex: 1;
  overflow-y: auto;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.nav-item-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
  cursor: pointer;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.nav-group-header:hover {
  color: #94a3b8;
}

.group-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  width: 100%;
}

.nav-link {
  padding: 0.7rem 1rem;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  font-size: 0.9rem;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.8rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-link.active {
  background-color: var(--brand-primary-light);
  color: var(--brand-primary);
  font-weight: 600;
}

.root-link.active {
  background-color: var(--brand-primary);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(225, 29, 46, 0.2);
}

.sub-group-toggle {
  cursor: pointer;
  justify-content: space-between !important;
}

.sub-group-info {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.sub-group-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 1.25rem;
  padding-left: 0.75rem;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0.5rem;
}

.sub-sub-group-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 1rem;
  padding-left: 0.5rem;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0.25rem;
}

.sub-sub-link {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
}

.sidebar-badge {
  margin-left: auto;
  background: var(--brand-primary);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 99px;
  box-shadow: 0 2px 4px rgba(225, 29, 46, 0.3);
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-icon-xs {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.chevron-icon,
.chevron-icon-sm {
  width: 14px;
  height: 14px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.5;
}

.rotated {
  transform: rotate(180deg);
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 1rem 0.5rem;
}

.sidebar-user {
  margin-top: auto;
  padding: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.avatar-icon {
  width: 18px;
  height: 18px;
}

.user-info {
  overflow: hidden;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
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
