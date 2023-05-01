<template>
  <div class="productImg">
    <div :style="imgStyle" alt="" />
  </div>
</template>

<script setup lang="ts">
import { isDark, toggleDark } from '@/utils/dark';
import useCounterStore from '@/store/theme';
import second from '@/assets/image/css_sprites.png';
import DSP from '../assets/data/DSP';
const { t, availableLocales, locale } = useI18n();
const props = defineProps({
  imgKey: String,
});
let imgStyle = computed(() => {
  let key = props.imgKey.value ? props.imgKey.value : props.imgKey;
  if (!DSP[key]) {
    console.error(key);
    return;
  }
  const { x, y } = DSP[key].path;
  //  设置缩放精灵图， 必须配置缩放图片的大小，并设置正确的 position
  return `
  width: 40px;
  height: 40px;
  background-image: url("${second}");
  background-repeat: no-repeat;
  background-position: ${x / 2}px ${y / 2}px;
  background-size: 650px  600px;
  `;
});
</script>

<style lang="scss">
.productImg {
  width: 40px;
  height: 40px;
}
</style>
