<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

<template>
  <div :class="cn('font-semibold leading-none tracking-tight', $attrs.class ?? '')">
    <slot />
  </div>
</template>
