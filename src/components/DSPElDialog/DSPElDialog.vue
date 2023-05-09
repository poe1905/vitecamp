<template>
  <div class="dsp-dialog">
    <el-dialog v-model="visible" @close="close">
      <div id="yin-yang">
        <div class="box-content">
          <h2 class="text-content pl-8 .text-xl font-black">添加目标参数</h2>
          <hr />
          <menu>
            <ul class="flex">
              <li
                :class="{ activate: typeNumber == key }"
                class="cursor-pointer select-none flex justify-center items-center"
                v-for="key in Object.keys(list)"
                :key="key"
                @click="typeNumber = key"
              >
                <ProductImg :imgKey="key" />
              </li>
            </ul>
          </menu>
          <hr />
          <div class="items p-4 pr-5">
            <template v-for="type in list[typeNumber]" :key="type">
              <template v-for="item in type">
                <!-- 没有的空位，不需要hover 样式 -->
                <div
                  class="inline-block select-none mb-2 rounded-2xl"
                  :class="{ activate: itemNumber == item.key, 'cursor-pointer': item.key !== 'none' }"
                  :data-type="{ noActivate: item.key !== 'none' }"
                  @click="
                    () => {
                      if (item.key == 'none') return;

                      props.clickSelect({
                        key: item.key,
                        num: num,
                      });
                    }
                  "
                >
                  <ProductImg :imgKey="item.key" />
                </div>
              </template>
            </template>
          </div>
          <hr />
          <div class="pt-3">
            <p class="pl-8 text-lg">
              设置当前产物效率
              <el-input-number class="ml-3" v-model="num" size="small" controls-position="right" />
            </p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import './index.sass';
const { t } = useI18n();
import DSP from '@/assets/data/DSP';
import list from '@/assets/data/list';

const props = defineProps({
  visible: Boolean,
  close: Function,
  clickSelect: Function,
});
watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      itemNumber.value = null;
      num.value = 60;
    }
  },
);

const typeNumber = ref('goods');
const itemNumber = ref(null);
const currentSelectedProduct = computed(() => {
  return itemNumber.value === null ? '请选择目标产物 ↓' : `目标物是 : ${DSP[itemNumber.value].name}, ${num.value}/min`;
});
const num = ref(60);

const closeDialog = () => {
  props.clone();
};
</script>
