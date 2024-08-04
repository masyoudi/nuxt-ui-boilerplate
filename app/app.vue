<style>
:root {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 12px;
  height: 12px;
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #c7c8ca;
  border: 3px solid #fff;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
  background: #bbbcbd;
}

::-webkit-scrollbar-thumb:active {
  background: #a1a1a1;
}

::-webkit-scrollbar-track {
  background: #fff;
}

:root.dark ::-webkit-scrollbar-track {
  background: #121728;
}

:root.dark ::-webkit-scrollbar-thumb {
  background: #4b515c;
  border-color: #121728;
}

.scrollbar-mini::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.scrollbar-mini::-webkit-scrollbar-thumb {
  background: #c7c8ca;
  border: 1px solid #fff;
}

@media screen and (max-width: 600px) {
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar-thumb {
    border-width: 1px;
  }
}
</style>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <UNotifications></UNotifications>
  </NuxtLayout>
</template>

<script setup lang="ts"></script>
