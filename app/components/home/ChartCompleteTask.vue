<script setup lang="ts">
import { VisSingleContainer, VisDonut } from '@unovis/vue';
</script>

<template>
  <VisSingleContainer
    :data="[70, 30]"
    :width="192"
    :height="192"
  >
    <VisDonut
      :value="(d: number) => d"
      central-label="70%"
      :color="(_d: number, i: number) => ['#03c948', 'transparent'].at(i)"
      :corner-radius="50"
      :arc-width="12"
    />
  </VisSingleContainer>
</template>
