<template>
  <div class="productImg">
    <div :style="imgStyle" alt="" />
    <span v-if="num">{{ num }}</span>
  </div>
</template>

<script setup lang="ts">
import { isDark, toggleDark } from '@/utils/dark';
import useCounterStore from '@/store/theme';
import second from '@/assets/image/css_sprites.png';
import DSP from '../assets/data/DSP';
interface ProductImgType {
  imgKey: string | { value: string };
  width?: number | string;
  num?: number;
}
const { t, availableLocales, locale } = useI18n();
const props = withDefaults(defineProps<ProductImgType>(), {
  imgKey: '',
  width: '40',
});
const multiplier = Number(props.width) / 80;
let imgStyle = computed(() => {
  let key = props.imgKey?.value ? props.imgKey?.value : props.imgKey;
  if (!DSP[key]) {
    console.error(key);
    return;
  }
  const { x, y } = DSP[key].path;
  //  设置缩放精灵图， 必须配置缩放图片的大小，并设置正确的 position
  return `
  width: ${80 * multiplier}px;
  height:  ${80 * multiplier}px;
  background-image: url("${second}");
  background-repeat: no-repeat;
  background-position: ${x * multiplier}px ${y * multiplier}px;
  background-size: ${1300 * multiplier}px  ${1200 * multiplier}px;
  `;
});
</script>

<style lang="scss">
.productImg {
  position: relative;
}
.productImg span {
  font-size: 10px;
  position: absolute;
  display: block;
  width: 10px;
  height: 16px;
  line-height: 16px;
  bottom: -3px;
  right: -3px;
  color: #fff;
  transform: scale(0.8);
}
</style>
