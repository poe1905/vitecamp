<template>
  <div class="flex">
    <left />
    <right class="w-full" />
  </div>
</template>

<script setup lang="ts">
import './index.scss';
import vitecamp from '@/assets/svg/vitecamp.svg?component';
import useThemeStore from '@/store/theme';
const theme = useThemeStore();
const { t } = useI18n();
// ElMessage.success({ message: 'welcome', duration: 1000 });
// ElNotification({
//   title: 'Issue',
//   message: 'If you encounter problems in using the template, please raise them in the issue',
//   duration: 0,
// });
</script>

<style lang="scss" scoped>
a {
  @apply text-sky-400 hover:(text-sky-600) transition-all ease-out duration-100;
}
</style>
