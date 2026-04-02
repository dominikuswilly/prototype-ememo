<script setup>
import { 
  FileText, FileVideo, FileImage, MoreVertical, MoreHorizontal,
  Eye, Download, User, Edit2, FolderInput, Copy, Share2, Link, Info, Archive, Trash2,
  Search
} from 'lucide-vue-next';

const props = defineProps({
  items: { type: Array, required: true },
  viewMode: { type: String, default: 'grid' },
  selectedIds: { type: Array, default: () => [] },
  activeMenuId: { type: [Number, String], default: null },
  isMobile: { type: Boolean, default: false },
  isSelectMode: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
});

const emit = defineEmits([
  'toggle-selection', 
  'open-menu', 
  'execute-action', 
  'select-all', 
  'clear-selection',
  'clear-filters'
]);

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

const isFileSelected = (id) => props.selectedIds.includes(id);
</script>

<template>
  <section class="content-section">
    <div v-if="items.length > 0">
      <!-- Grid View -->
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="presentation-grid">
        <!-- Skeleton Loader (Grid) -->
        <template v-if="isLoading">
          <div v-for="i in 6" :key="'skeleton-g-'+i" class="presentation-card skeleton-card">
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
        </template>

        <!-- Actual Content (Grid) -->
        <template v-else>
          <div v-for="p in items" :key="p.id"
            :class="['presentation-card', { selected: isFileSelected(p.id), 'menu-active': activeMenuId === p.id }]">
            
            <div v-if="!isMobile || isSelectMode" class="card-selection">
              <input type="checkbox" :checked="isFileSelected(p.id)" @change="emit('toggle-selection', p.id)"
                class="card-checkbox" />
            </div>

            <div class="card-header">
              <div :class="['file-icon-box', p.fileType.toLowerCase()]">
                <component :is="getFileIcon(p.fileType)" class="file-icon" />
              </div>
              
              <div class="card-action-cluster action-wrap-trigger">
                <!-- Grouped Actions in Top Right -->
                <button class="icon-action-btn secondary" title="View" v-if="!isMobile">
                  <Eye class="icon-small" />
                </button>
                <button class="icon-action-btn secondary" title="Download" v-if="!isMobile">
                  <Download class="icon-small" />
                </button>
                <div class="relative-inline">
                  <button class="icon-action-btn" @click.stop="emit('open-menu', p.id)">
                    <MoreVertical class="icon-small" />
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
                  <span>{{ p.author }} <span class="meta-dot">&bull;</span> {{ p.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- List View -->
      <div v-else class="presentation-list">
        <div class="list-header desktop-only">
          <div class="col-check">
            <input type="checkbox" :checked="selectedIds.length === items.length && items.length > 0" 
              @change="selectedIds.length === items.length ? emit('clear-selection') : emit('select-all')" />
          </div>
          <div class="col-name">Name</div>
          <div class="col-category">Category</div>
          <div class="col-author">Author & Date</div>
          <div class="col-size">Size</div>
          <div class="col-actions"></div>
        </div>

        <!-- Skeleton Loader (List) -->
        <template v-if="isLoading">
          <div v-for="i in 8" :key="'skeleton-l-'+i" class="presentation-row skeleton-row">
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
        </template>

        <!-- Actual Content (List) -->
        <template v-else>
          <div v-for="p in items" :key="p.id"
            :class="['presentation-row', { selected: isFileSelected(p.id) }]"
            :data-meta="`${p.size} &bull; ${p.date}`">
            <div v-if="!isMobile || isSelectMode" class="col-check">
              <input type="checkbox" :checked="isFileSelected(p.id)" @change="emit('toggle-selection', p.id)" />
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
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon-wrap">
        <div class="icon-pulse"></div>
        <Search class="empty-icon" />
      </div>
      <h3 class="em-title">No presentations found</h3>
      <p class="em-text">Try adjusting your search or category filter to find what you're looking for.</p>
      <button class="btn-clear-filters" @click="emit('clear-filters')">
        <X class="icon-tiny" />
        <span>Clear Filters</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.content-section {
  flex: 1;
  min-width: 0;
}

.presentation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 640px) {
  .presentation-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-top: 1rem;
  }
}

.presentation-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

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
  border-color: #3b82f6;
}

.presentation-card.selected {
  border-color: #3b82f6;
  background: #f8fbff;
  box-shadow: 0 0 0 1px #3b82f6;
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
  align-items: center;
  margin-bottom: 1.5rem;
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
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
  line-height: 1.4;
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
  color: #1e40af;
  font-weight: 700;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
}

/* Ghost Tag Style */
.category-tag {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
  border: none;
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

.file-type-badge {
  font-size: 0.65rem;
  font-weight: 900;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.flex-center {
  display: flex;
  align-items: center;
}

.gap-xs {
  gap: 0.35rem;
}

.card-footer {
  margin-top: auto;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 640px) { .card-footer { display: none; } }

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* List View Style */
.presentation-list {
  background: white;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  margin-top: 1.5rem;
}

.list-header {
  display: grid;
  grid-template-columns: 50px 1fr 180px 220px 100px 140px;
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

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

.col-name { display: flex; align-items: center; gap: 1rem; font-weight: 700; color: #1e293b; }
.row-file-icon { width: 18px; height: 18px; color: #3b82f6; }
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

.row-info { display: flex; flex-direction: column; }
.row-author { font-size: 0.875rem; font-weight: 600; color: #475569; }
.row-date { font-size: 0.75rem; color: #94a3b8; }
.col-size { font-size: 0.875rem; color: #64748b; font-weight: 500; }
.col-actions { display: flex; justify-content: flex-end; gap: 0.25rem; }

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
.list-menu { right: 100%; top: 50%; transform: translateY(-50%); margin-right: 0.5rem; margin-top: 0; }

/* Common UI */
.icon-tiny { width: 14px; height: 14px; }
.icon-small { width: 18px; height: 18px; }

.action-btn, .icon-action-btn {
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
  color: #3b82f6;
  background: #eff6ff;
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

.skeleton-box.circle { border-radius: 50%; }
.skeleton-line { height: 12px; margin-bottom: 0.75rem; width: 100%; border-radius: 99px; }
.skeleton-line.title { height: 20px; width: 80%; margin-bottom: 1rem; }
.skeleton-line.small { height: 10px; width: 60%; }
.skeleton-line.short { width: 40%; }
.skeleton-btn { width: 32px; height: 32px; border-radius: 8px; }

.meta-dot {
  margin: 0 0.5rem;
  opacity: 0.5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
  background: white;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.empty-icon-wrap {
  width: 96px;
  height: 96px;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  position: relative;
}

.icon-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #3b82f6;
  border-radius: 50%;
  opacity: 0.1;
  animation: pulse 2s infinite ease-out;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.empty-icon {
  width: 44px;
  height: 44px;
  color: #3b82f6;
  position: relative;
  z-index: 2;
}

.em-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.em-text {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 2.5rem;
  max-width: 320px;
  line-height: 1.6;
}

.btn-clear-filters {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-clear-filters:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.35);
}

.btn-clear-filters:active {
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .desktop-only { display: none; }
}
</style>
