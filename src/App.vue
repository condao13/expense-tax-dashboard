<script setup lang="ts"></script>

<template>
  <header class="topbar">
    <span class="brand">Expense &amp; Tax Dashboard</span>
    <nav>
      <RouterLink to="/">Dashboard</RouterLink>
      <RouterLink to="/expenses">Expenses</RouterLink>
      <RouterLink to="/settings">Settings</RouterLink>
    </nav>
  </header>
  <main class="content">
    <RouterView />
  </main>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.9rem 1.5rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.brand {
  font-weight: 700;
}
nav {
  display: flex;
  gap: 1rem;
}
nav a {
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
}
/* RouterLink adds this class to the link of the current route. */
nav a.router-link-exact-active {
  color: var(--accent);
}
.content {
  max-width: 1040px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
