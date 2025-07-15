<script setup lang="ts">
import { VisXYContainer, VisLine, VisCrosshair, VisTooltip, VisAxis } from '@unovis/vue';

interface Item {
  day: number;
  value: number;
}
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const data = shallowRef<Item[]>(
  [200, 900, 400, 1200, 500, 1400, 900].map((val, i) => ({ day: i, value: val }))
);

const xAxis = (d: Item) => d.day;

const yAxis = (d: Item) => d.value;

const template = (d: Item) => `${days.at(d.day)}: ${d.value}`;
</script>

<template>
  <VisXYContainer
    :data="data"
    :height="240"
    :padding="{ top: 10 }"
  >
    <VisLine
      :x="xAxis"
      :y="yAxis"
      curve-type="basis"
      color="#ff6600"
    />

    <VisCrosshair
      :template="template"
      color="transparent"
    />

    <VisTooltip />

    <VisAxis
      type="x"
      :num-ticks="days.length"
      :tick-format="(_: number, i: number) => days.at(i)"
      :grid-line="false"
    />

    <VisAxis
      type="y"
      :domain-line="false"
    />
  </VisXYContainer>
</template>
