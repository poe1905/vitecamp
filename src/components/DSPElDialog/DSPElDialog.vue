<template>
  <div class="dsp-dialog">
    <el-dialog v-model="visible" @close="clone">
      <div id="yin-yang">
        <div class="box-content">
          <h2 class="text-content pl-8 .text-xl font-black">添加目标参数</h2>
          <hr />
          <menu>
            <ul class="flex">
              <li
                :class="{ activate: typeNumber == key }"
                class="cursor-pointer select-none"
                v-for="key in Object.keys(lsit)"
                :key="key"
                @click="typeNumber = key"
              >
                {{ t(key) }}
              </li>
            </ul>
          </menu>
          <hr />
          <h2 class="text-content pl-8 text-3xl font-black">{{ currentSelectedProduct }}</h2>
          <hr />
          <div class="items p-4 pr-5">
            <template v-for="type in lsit[typeNumber]" :key="type">
              <template v-for="item in type">
                <!-- 没有的空位，不需要hover 样式 -->
                <div
                  class="inline-block select-none mb-2 rounded-2xl"
                  :class="{ activate: itemNumber == item.key, 'cursor-pointer': item.key !== 'none' }"
                  :data-type="{ noActivate: item.key !== 'none' }"
                  @click="
                    () => {
                      if (item.key == 'none') return;
                      itemNumber = item.key;
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
              <el-input-number class="ml-3" v-model="num" size="small" controls-position="right" @change="numChange" />
            </p>
          </div>
          <el-button class="float-right mr-8" type="success" @click="selectProduct">添加产物</el-button>
        </div>
      </div>

      <!-- <el-button type="success" @click="selectProduct">选择</el-button> -->
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import './index.sass';
const { t } = useI18n();
import DSP from '@/assets/data/DSP';
import lsit from '@/assets/data/list';

const props = defineProps({
  visible: Boolean,
  clone: Function,
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

console.log('DSP', Object.keys(lsit));
const typeNumber = ref('goods');
const itemNumber = ref(null);
const currentSelectedProduct = computed(() => {
  return itemNumber.value === null ? '请选择目标产物 ↓' : `目标物是 : ${DSP[itemNumber.value].name}, ${num.value}/min`;
});
const selectProduct = () => {
  props.clickSelect({
    key: itemNumber.value,
    num: num.value,
  });
};

const num = ref(60);
const numChange = (num) => {
  console.log(num);
};
const closeDialog = () => {
  props.clone();
};
</script>
