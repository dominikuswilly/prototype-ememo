<script setup>
import { 
  FileText, FileVideo, FileImage, MoreVertical,
  Eye, Download, User, Edit2, FolderInput, Copy, Share2, Link, Info, Archive, Trash2,
  Clock, CheckCircle, AlertCircle
} from 'lucide-vue-next';

const props = defineProps({
  p: { type: Object, default: () => ({}) },
  isLoading: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  isSelectMode: { type: Boolean, default: false },
  activeMenuId: { type: [Number, String], default: null }
});

const emit = defineEmits(['toggle-selection', 'open-menu', 'execute-action']);

// UI Helpers
const getFileIcon = (type) => {
  if (type === 'MP4') return FileVideo;
  if (type === 'PPTX') return FileImage;
  return FileText;
};

const formatTagName = (id) => {
  if (!id) return '';
  return id.replace(/_/g, ' ').toUpperCase();
};

const getStatusColorClass = (status) => {
  if (!status) return 'draft';
  switch (status.toLowerCase()) {
    case 'published': return 'published';
    case 'private': return 'private';
    case 'archived': return 'archived';
    case 'draft': return 'draft';
    default: return 'draft';
  }
};

const getStatusIcon = (status) => {
  if (!status) return Clock;
  switch (status.toLowerCase()) {
    case 'published': return CheckCircle;
    case 'private': return Clock;
    case 'archived': return Archive;
    case 'draft': return Clock;
    default: return Clock;
  }
};
</script>

<template>
  <!-- Skeleton Loader (Grid) -->
  <div v-if="isLoading" class="presentation-card skeleton-card">
    <div class="card-header">
      <div class="skeleton-box file-icon-box"></div>
      <div class="skeleton-actions">
        <div class="skeleton-btn"></div>
        <div class="skeleton-btn"></div>
      </div>
    </div>
    <div class="card-body">
      <div class="skeleton-line title"></div>
      <div class="skeleton-line small short"></div>
    </div>
    <div class="card-footer">
      <div class="skeleton-line small"></div>
    </div>
  </div>

  <!-- Actual Content (Grid) -->
  <div v-else
    :class="['presentation-card', getStatusColorClass(p.status), { selected: isSelected, 'menu-active': activeMenuId === p.id }]">
    
    <div v-if="!isMobile || isSelectMode" class="card-selection">
      <input type="checkbox" :checked="isSelected" @change="emit('toggle-selection', p.id)"
        class="card-checkbox" />
    </div>

    <div class="card-header">
      <div :class="['file-icon-box', p.fileType.toLowerCase()]">
        <component :is="getFileIcon(p.fileType)" class="file-icon" />
      </div>
      
      <div class="header-right-actions">
        <div :class="['status-indicator-box', getStatusColorClass(p.status)]" :title="p.status">
          <component :is="getStatusIcon(p.status)" class="status-icon-mid" />
        </div>
      </div>
    </div>

    <div class="card-body">
      <h4 class="presentation-title" :title="p.title">{{ p.title }}</h4>
      <div class="presentation-meta">
        <span class="category-tag">{{ formatTagName(p.category) }}</span>
        <span class="file-type-tag">{{ p.fileType.toUpperCase() }}</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="footer-info">
        <div class="info-row">
          <User class="icon-tiny" />
          <span>{{ p.author }} <span class="meta-dot">&bull;</span> {{ p.size }}</span>
        </div>
      </div>
      <div class="card-actions-mini">
        <button class="mini-action-btn view" title="View" v-if="!isMobile">
          <Eye class="icon-tiny" />
        </button>
        <button class="mini-action-btn download" title="Download" v-if="!isMobile">
          <Download class="icon-tiny" />
        </button>
        <div class="relative-inline action-wrap-trigger">
          <button class="mini-action-btn" @click.stop="emit('open-menu', p.id)">
            <MoreVertical class="icon-tiny" />
          </button>
          
          <!-- Dropdown Menu (Desktop) -->
          <div v-if="!isMobile && activeMenuId === p.id" class="dropdown-menu">
            <div class="menu-group">
              <button @click.stop="emit('execute-action', 'rename', p)"><Edit2 class="icon-tiny" /> Rename</button>
              <button @click.stop="emit('execute-action', 'move', p)"><FolderInput class="icon-tiny" /> Move to...</button>
              <button @click.stop="emit('execute-action', 'duplicate', p)"><Copy class="icon-tiny" /> Duplicate</button>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-group">
              <button @click.stop="emit('execute-action', 'share', p)"><Share2 class="icon-tiny" /> Share</button>
              <button @click.stop="emit('execute-action', 'copy-link', p)"><Link class="icon-tiny" /> Copy Link</button>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-group">
              <button @click.stop="emit('execute-action', 'properties', p)"><Info class="icon-tiny" /> Properties</button>
              <button @click.stop="emit('execute-action', 'archive', p)"><Archive class="icon-tiny" /> Archive</button>
              <button class="danger" @click.stop="emit('execute-action', 'delete', p)"><Trash2 class="icon-tiny" /> Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.presentation-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-left: 4px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  height: 100%;
}

.presentation-card.published { border-left-color: #10b981; }
.presentation-card.private { border-left-color: #f59e0b; }
.presentation-card.archived { border-left-color: #ef4444; }
.presentation-card.draft { border-left-color: #94a3b8; }

.presentation-card.menu-active {
  z-index: 100;
}

@media (max-width: 640px) {
  .presentation-card {
    padding: 1rem;
    border-radius: 16px;
  }
}

.presentation-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.12), 0 5px 15px -5px rgba(59, 130, 246, 0.1);
  border-color: var(--brand-primary);
}

.presentation-card.selected {
  border-color: var(--brand-primary);
  background: #f8fbff;
  box-shadow: 0 0 0 1px var(--brand-primary);
}

.card-selection {
  position: absolute;
  top: 1rem;
  left: 1rem;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 20;
}

.presentation-card:hover .card-selection,
.presentation-card.selected .card-selection {
  opacity: 1;
}

.card-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  min-height: 48px;
}

.header-right-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-indicator-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #94a3b8;
  border: 1px solid #f1f5f9;
}

.status-indicator-box.published { background: #ecfdf5; color: #10b981; border-color: #d1fae5; }
.status-indicator-box.private { background: #fffbeb; color: #f59e0b; border-color: #fef3c7; }
.status-indicator-box.archived { background: #fef2f2; color: #ef4444; border-color: #fee2e2; }
.status-indicator-box.draft { background: #f8fafc; color: #64748b; border-color: #e2e8f0; }

.status-icon-mid {
  width: 18px;
  height: 18px;
}

.card-action-cluster {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: -0.5rem;
}

.file-icon-box {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

@media (max-width: 640px) {
  .file-icon-box {
    width: 42px;
    height: 42px;
  }
}

.file-icon-box.pdf { background: #fee2e2; color: #ef4444; }
.file-icon-box.pptx { background: #ffedd5; color: #f97316; }
.file-icon-box.mp4 { background: #f0fdf4; color: #22c55e; }

.file-icon { width: 28px; height: 28px; }
@media (max-width: 640px) { .file-icon { width: 20px; height: 20px; } }

.presentation-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.75rem;
  line-height: 1.4rem;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8rem;
  max-height: 2.8rem;
}

@media (max-width: 640px) {
  .presentation-title {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.presentation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 640px) {
  .presentation-meta { margin-bottom: 1rem; flex-wrap: wrap; }
}

.category-tag {
  font-size: 0.725rem;
  color: var(--brand-primary);
  font-weight: 700;
  background: rgba(59, 130, 246, 0.08);
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
}

.presentation-card:hover .category-tag {
  background: rgba(59, 130, 246, 0.15);
}

@media (max-width: 640px) { .category-tag { padding: 0.15rem 0.5rem; font-size: 0.65rem; } }

.file-type-tag {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-actions-mini {
  display: flex;
  gap: 0.5rem;
}

.mini-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-action-btn:hover {
  background: #f8fafc;
  color: var(--brand-primary);
  border-color: #cbd5e1;
}

.mini-action-btn.view:hover { color: var(--brand-primary); background: #eff6ff; }
.mini-action-btn.download:hover { color: #10b981; background: #ecfdf5; }

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.meta-dot {
  margin: 0 0.5rem;
  opacity: 0.5;
}

/* Skeleton Animations */
.skeleton-box, .skeleton-line, .skeleton-btn {
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.skeleton-box::after, .skeleton-line::after, .skeleton-btn::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255,255,255,0) 0,
    rgba(255,255,255,0.4) 20%,
    rgba(255,255,255,0.6) 60%,
    rgba(255,255,255,0)
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-line { height: 12px; margin-bottom: 0.75rem; width: 100%; border-radius: 99px; }
.skeleton-line.title { height: 20px; width: 80%; margin-bottom: 1rem; }
.skeleton-line.small { height: 10px; width: 60%; }
.skeleton-line.short { width: 40%; }
.skeleton-btn { width: 32px; height: 32px; border-radius: 8px; }

/* Menus & Actions */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 220px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  z-index: 100;
  margin-top: 0.5rem;
  animation: dropdownIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.dropdown-menu button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: none;
  background: transparent;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.dropdown-menu button:hover { background: #f1f5f9; color: #1e293b; }
.dropdown-menu button.danger { color: #ef4444; }
.dropdown-menu button.danger:hover { background: #fef2f2; }

.menu-group { display: flex; flex-direction: column; gap: 2px; }
.menu-divider { height: 1px; background: #f1f5f9; margin: 0.5rem 0; }

.relative-inline { position: relative; display: inline-flex; }

.icon-tiny { width: 14px; height: 14px; }
.icon-small { width: 18px; height: 18px; }

.icon-action-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.icon-action-btn.secondary {
  color: #94a3b8;
}

.icon-action-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.icon-action-btn.secondary:hover {
  color: var(--brand-primary);
  background: #eff6ff;
}
</style>
