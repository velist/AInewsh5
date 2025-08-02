<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 应用根组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}

/* 移动端适配 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
</style>