<script setup>
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>eMemo</h2>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="nav-link active">Memo List</a>
      <a href="#" class="nav-link">Settings</a>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-header {
  padding: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  border-bottom: 1px solid #334155;
  text-align: center;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.nav-link {
  padding: 1rem 1.5rem;
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #334155;
  color: white;
}

.nav-link.active {
  background-color: #3b82f6;
  color: white;
}
</style>
