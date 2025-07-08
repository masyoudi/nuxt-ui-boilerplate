<script setup lang="ts">
import { VisXYContainer, VisGroupedBar, VisTooltip, VisAxis } from '@unovis/vue';
import { GroupedBar } from '@unovis/ts';

interface Item {
  category: number;
  value: number;
}
const categories = ['UI Design', 'Frontend', 'SEO'];
const colors = ['#0084ff', '#03c948', '#ffbb00'];

const data = shallowRef<Item[]>(
  [26, 30, 12].map((val, i) => ({ category: i, value: val }))
);

const xAxis = (d: Item) => d.category;

const yAxis = [
  (d: Item) => d.value
];

const template = (d: Item) => `${categories.at(d.category)}: ${d.value}`;
</script>

<template>
  <VisXYContainer
    :data="data"
    :height="176"
    :padding="{ top: 10 }"
  >
    <VisGroupedBar
      :x="xAxis"
      :y="yAxis"
      orientation="horizontal"
      :color="(d: Item) => colors.at(d.category)"
      :rounded-corners="7"
    />

    <VisTooltip
      :triggers="{
        [GroupedBar.selectors.bar]: template
      }"
    />

    <VisAxis
      type="x"
      :num-ticks="categories.length"
      :domain-line="false"
    />

    <VisAxis
      type="y"
      :grid-line="false"
      :tick-format="(_: number, i: number) => categories.at(i)"
    />
  </VisXYContainer>
</template>
