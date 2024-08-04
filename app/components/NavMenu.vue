<template>
  <component :is="hasLink ? NuxtLink : 'div'" :class="navMenuClass" :to="props.to">
    <span v-if="props.icon" :class="ui.icon.wrapper">
      <UIcon :name="props.icon" :class="ui.icon.size"></UIcon>
    </span>
    <span :class="ui.text">
      <slot>
        {{ props.label }}
      </slot>
    </span>
    <slot name="trailing"></slot>
  </component>
</template>

<script setup lang="ts">
import { twMerge, twJoin, type ClassNameValue } from 'tailwind-merge';
import { mergeConfig } from '#ui/utils';
import appConfig from '#build/app.config.mjs';

interface Props {
  label?: string;
  icon?: string;
  active?: boolean;
  to?: string;
  class?: string | object | any[];
  ui?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  class: ''
});

const configNavMenu = mergeConfig<typeof appConfig.ui.navMenu>(appConfig.ui.strategy, appConfig.ui.navMenu, {});
const { ui } = useUI('navMenu', toRef(props, 'ui'), configNavMenu);

const navMenuClass = computed(() =>
  twMerge(
    twJoin(
      ui.value.base,
      ui.value.color,
      ui.value.rounded,
      ui.value.padding,
      props.active ? [ui.value.active.background, ui.value.active.color] : [ui.value.inactive]
    ),
    props.class as ClassNameValue
  )
);

const NuxtLink = resolveComponent('NuxtLink');
const hasLink = computed(() => typeof props.to === 'string' && props.to.trim() !== '');
</script>
