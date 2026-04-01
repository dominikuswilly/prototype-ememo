<script setup>
import { ref, computed } from 'vue';
import { 
  Search, Filter, Plus, FileText, Layout, 
  MoreVertical, Download, Eye, Clock, User,
  CheckCircle, AlertCircle, Trash2, X, UploadCloud,
  Monitor, Briefcase, Globe, TrendingUp, Cpu
} from 'lucide-vue-next';

const categories = [
  { id: 'all', label: 'All Categories', icon: Layout },
  { id: 'IT', label: 'IT', icon: Cpu },
  { id: 'Finance', label: 'Finance', icon: TrendingUp },
  { id: 'Marketing', label: 'Marketing', icon: Globe },
  { id: 'Sales', label: 'Sales', icon: Briefcase },
  { id: 'HR', label: 'HR', icon: User },
  { id: 'Product', label: 'Product', icon: Monitor }
];

const selectedCategory = ref('all');
const searchQuery = ref('');
const isUploadModalOpen = ref(false);

const mockPresentations = ref([
  { id: 1, title: 'Quarterly Security Audit', category: 'IT', author: 'Elliot Alderson', date: '2026-03-15', size: '4.2 MB' },
  { id: 2, title: 'Financial Projection 2026', category: 'Finance', author: 'Angela Moss', date: '2026-03-20', size: '2.8 MB' },
  { id: 3, title: 'Global Brand Strategy', category: 'Marketing', author: 'Phillip Price', date: '2026-03-22', size: '12.5 MB' },
  { id: 4, title: 'Sales Performance Q1', category: 'Sales', author: 'Susan Jacobs', date: '2026-03-25', size: '5.1 MB' },
  { id: 5, title: 'Employee Benefits Policy', category: 'HR', author: 'Gideon Goddard', date: '2026-03-28', size: '3.4 MB' },
  { id: 6, title: 'Product Roadmap V2', category: 'Product', author: 'Willy', date: '2026-03-30', size: '8.9 MB' },
  { id: 7, title: 'Network Infrastructure Upgrade', category: 'IT', author: 'Elliot Alderson', date: '2026-03-31', size: '6.7 MB' },
  { id: 8, title: 'Market Expansion Plan', category: 'Marketing', author: 'Phillip Price', date: '2026-04-01', size: '15.2 MB' }
]);

const filteredPresentations = computed(() => {
  return mockPresentations.value.filter(p => {
    const matchesCategory = selectedCategory.value === 'all' || p.category === selectedCategory.value;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         p.author.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

const handleUpload = () => {
  alert('Upload feature simulated. File added to the list.');
  mockPresentations.value.unshift({
    id: Date.now(),
    title: 'New Presentation ' + (mockPresentations.value.length + 1),
    category: selectedCategory.value === 'all' ? 'Product' : selectedCategory.value,
    author: 'Willy',
    date: new Date().toISOString().split('T')[0],
    size: '1.5 MB'
  });
  isUploadModalOpen.value = false;
};
</script>

<template>
  <div class="presentations-page">
    <!-- Header Actions -->
    <div class="page-actions">
      <div class="search-box">
        <Search class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Search presentations..." />
      </div>
      <button class="btn-primary" @click="isUploadModalOpen = true">
        <Plus class="icon-small" />
        <span>Upload Presentation</span>
      </button>
    </div>

    <div class="main-layout">
      <!-- Categories Sidebar -->
      <aside class="categories-sidebar">
        <h3 class="sidebar-title">Categories</h3>
        <div class="category-list">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            :class="['category-item', { active: selectedCategory === cat.id }]"
            @click="selectedCategory = cat.id"
          >
            <component :is="cat.icon" class="category-icon" />
            <span>{{ cat.label }}</span>
          </button>
        </div>
      </aside>

      <!-- Presentations Grid -->
      <section class="content-section">
        <div v-if="filteredPresentations.length > 0" class="presentation-grid">
          <div v-for="p in filteredPresentations" :key="p.id" class="presentation-card">
            <div class="card-header">
              <div class="file-icon-box">
                <FileText class="file-icon" />
              </div>
              <div class="card-actions">
                <button class="action-btn" title="More options">
                  <MoreVertical class="icon-small" />
                </button>
              </div>
            </div>
            <div class="card-body">
              <h4 class="presentation-title" :title="p.title">{{ p.title }}</h4>
              <div class="presentation-meta">
                <span class="category-tag">{{ p.category }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-info">
                <div class="info-row">
                  <User class="icon-tiny" />
                  <span>{{ p.author }}</span>
                </div>
                <div class="info-row">
                  <Clock class="icon-tiny" />
                  <span>{{ p.date }}</span>
                </div>
              </div>
              <div class="footer-actions">
                <button class="icon-action-btn" title="View">
                  <Eye class="icon-small" />
                </button>
                <button class="icon-action-btn" title="Download">
                  <Download class="icon-small" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon-wrap">
            <Search class="empty-icon" />
          </div>
          <h3>No presentations found</h3>
          <p>Try adjusting your search or category filter.</p>
          <button class="btn-secondary" @click="selectedCategory = 'all'; searchQuery = ''">
            Clear Filters
          </button>
        </div>
      </section>
    </div>

    <!-- Upload Modal (Simplified) -->
    <div v-if="isUploadModalOpen" class="modal-overlay" @click.self="isUploadModalOpen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Upload Presentation</h3>
          <button class="btn-close" @click="isUploadModalOpen = false">
            <X class="icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="upload-dropzone">
            <UploadCloud class="upload-icon" />
            <h4>Drop files here or click to upload</h4>
            <p>Maximum file size: 50MB (PDF, PPTX, MP4)</p>
            <input type="file" class="hidden-input" id="fileUpload" @change="handleUpload" />
            <label for="fileUpload" class="btn-upload-trigger">Select File</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.presentations-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.main-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.categories-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  position: sticky;
  top: 100px;
}

.sidebar-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 1.25rem;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.category-item:hover {
  background: #f8fafc;
  color: #1e293b;
}

.category-item.active {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 600;
}

.category-icon {
  width: 18px;
  height: 18px;
}

.content-section {
  flex: 1;
  min-width: 0;
}

.presentation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.presentation-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.presentation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.file-icon-box {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  transition: all 0.3s;
}

.presentation-card:hover .file-icon-box {
  background: #3b82f6;
  color: white;
}

.file-icon {
  width: 24px;
  height: 24px;
}

.action-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
}

.presentation-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.presentation-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.category-tag {
  font-size: 0.85rem;
  color: #3b82f6;
  font-weight: 600;
  background: #eff6ff;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.card-footer {
  margin-top: auto;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.footer-actions {
  display: flex;
  gap: 0.25rem;
}

.icon-action-btn {
  background: #f8fafc;
  border: none;
  color: #64748b;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-action-btn:hover {
  background: #eff6ff;
  color: #3b82f6;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  text-align: center;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon {
  width: 32px;
  height: 32px;
  color: #cbd5e1;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.modal-body {
  padding: 2rem;
}

.upload-dropzone {
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.upload-dropzone:hover {
  border-color: #3b82f6;
  background: #f8fbff;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.btn-upload-trigger {
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.hidden-input {
  display: none;
}

@media (max-width: 1024px) {
  .categories-sidebar {
    display: none; /* In a real app, convert to a horizontal scroll or dropdown */
  }
}

@media (max-width: 640px) {
  .page-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
