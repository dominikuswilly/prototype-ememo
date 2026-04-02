<script setup>
import { 
  FileText, FileVideo, FileImage, MoreHorizontal,
  Eye, Download, Edit2, Share2, Info, Trash2
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
</script>

<template>
  <!-- Skeleton Loader (List) -->
  <div v-if="isLoading" class="presentation-row skeleton-row">
    <div class="col-check"></div>
    <div class="col-name">
      <div class="skeleton-box sm circle"></div>
      <div class="skeleton-line short"></div>
    </div>
    <div class="col-category"><div class="skeleton-line short"></div></div>
    <div class="col-author"><div class="skeleton-line short"></div></div>
    <div class="col-size"><div class="skeleton-line short"></div></div>
    <div class="col-actions"></div>
  </div>

  <!-- Actual Content (List) -->
  <div v-else
    :class="['presentation-row', { selected: isSelected }]"
    :data-meta="`${p.size} &bull; ${p.date}`">
    <div v-if="!isMobile || isSelectMode" class="col-check">
      <input type="checkbox" :checked="isSelected" @change="emit('toggle-selection', p.id)" />
    </div>
    <div class="col-name">
      <component :is="getFileIcon(p.fileType)" class="row-file-icon" />
      <span class="row-title" :title="p.title">{{ p.title }}</span>
    </div>
    <div class="col-category">
      <div class="flex-center gap-xs">
        <span class="category-tag ghost">{{ formatTagName(p.category) }}</span>
        <span class="file-type-badge">{{ p.fileType.toUpperCase() }}</span>
      </div>
    </div>
    <div class="col-author">
      <div class="row-info">
        <span class="row-author">{{ p.author }}</span>
        <span class="row-date">{{ p.date }}</span>
      </div>
    </div>
    <div class="col-size">{{ p.size }}</div>
    <div class="col-actions action-wrap-trigger">
      <button class="icon-action-btn secondary" title="View" v-if="!isMobile">
        <Eye class="icon-small" />
      </button>
      <button class="icon-action-btn secondary" title="Download" v-if="!isMobile">
        <Download class="icon-small" />
      </button>
      <div class="relative-inline">
        <button class="icon-action-btn" @click.stop="emit('open-menu', p.id)">
          <MoreHorizontal class="icon-small" />
        </button>
        
        <!-- Dropdown Menu List (Desktop) -->
        <div v-if="!isMobile && activeMenuId === p.id" class="dropdown-menu list-menu">
          <button @click.stop="emit('execute-action', 'rename', p)"><Edit2 class="icon-tiny" /> Rename</button>
          <button @click.stop="emit('execute-action', 'share', p)"><Share2 class="icon-tiny" /> Share</button>
          <button @click.stop="emit('execute-action', 'properties', p)"><Info class="icon-tiny" /> Properties</button>
          <div class="menu-divider"></div>
          <button class="danger" @click.stop="emit('execute-action', 'delete', p)"><Trash2 class="icon-tiny" /> Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.presentation-row {
  display: grid;
  grid-template-columns: 50px 1fr 180px 220px 100px 140px;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
  cursor: pointer;
}

.presentation-row:last-child { border-bottom: none; }
.presentation-row:hover { background: #f8fbff; }
.presentation-row.selected { background: #eff6ff; }

@media (max-width: 1024px) {
  .presentation-row {
    grid-template-columns: 48px 1fr auto;
    padding: 1.25rem 1rem;
    gap: 1rem;
  }
}

.col-check { display: flex; align-items: center; justify-content: center; }
.col-name { display: flex; align-items: center; gap: 1rem; font-weight: 700; color: #1e293b; }
.row-file-icon { width: 18px; height: 18px; color: var(--brand-primary); }
@media (max-width: 1024px) { .row-file-icon { width: 24px; height: 24px; } }

@media (max-width: 1024px) {
  .row-title { font-size: 1rem; font-weight: 600; color: #1e293b; display: block; margin-bottom: 0.25rem; }
  .presentation-row::after {
    content: attr(data-meta);
    font-size: 0.75rem;
    color: #64748b;
    display: block;
  }
  .col-category, .col-author, .col-size { display: none; }
}

.category-tag.ghost {
  font-size: 0.725rem;
  color: var(--brand-primary);
  background: rgba(59, 130, 246, 0.08);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
}

.file-type-badge {
  font-size: 0.65rem;
  font-weight: 900;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.row-info { display: flex; flex-direction: column; }
.row-author { font-size: 0.875rem; font-weight: 600; color: #475569; }
.row-date { font-size: 0.75rem; color: #94a3b8; }
.col-size { font-size: 0.875rem; color: #64748b; font-weight: 500; }
.col-actions { display: flex; justify-content: flex-end; gap: 0.25rem; }

.flex-center { display: flex; align-items: center; }
.gap-xs { gap: 0.35rem; }

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

.menu-divider { height: 1px; background: #f1f5f9; margin: 0.5rem 0; }
.relative-inline { position: relative; display: inline-flex; }
.list-menu { right: 100%; top: 50%; transform: translateY(-50%); margin-right: 0.5rem; margin-top: 0; }

.icon-small { width: 18px; height: 18px; }
.icon-tiny { width: 14px; height: 14px; }

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

/* Skeleton */
.skeleton-box, .skeleton-line {
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.skeleton-box::after, .skeleton-line::after {
  content: "";
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0));
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer { 100% { transform: translateX(100%); } }

.skeleton-box.circle { border-radius: 50%; width: 24px; height: 24px; }
.skeleton-box.sm { width: 24px; height: 24px; }
.skeleton-line { height: 12px; width: 100%; border-radius: 99px; }
.skeleton-line.short { width: 40%; }
</style>
