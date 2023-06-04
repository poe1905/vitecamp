<template>
  <el-dialog
    v-model="props.visible"
    @close="close"
    :title="`请选择 ${DSP[props.dateKey]?.name} 的配方`"
    width="30%"
    align-center
  >
    <div>
      <div v-for="(recipe, index) in props?.date.item_data[props.dateKey]" :key="recipe">
        <div
          v-if="index != 0"
          :class="{ active: props.date.item_recipe_choices[props.dateKey] == index }"
          class="flex items-center m-2 w-85 pr-2 pl-2 rounded-lg bg-current cursor-pointer"
          @click="changeRecipeOf(props.dateKey, index)"
        >
          <div v-for="material in Object.keys(props?.date.recipe_lists[recipe].in)">
            <ProductImg
              :imgKey="material"
              class="inline-block mr-1"
              :width="35"
              :num="props?.date.recipe_lists[recipe].in[material]"
            />
          </div>

          <div v-if="Object.keys(props.date.recipe_lists[recipe].in).length > 0" class="text-cool-gray-50">
            <i-zondicons:arrow-thin-right> </i-zondicons:arrow-thin-right>
          </div>
          <div v-for="product in Object.keys(props.date.recipe_lists[recipe].out)">
            <ProductImg
              :imgKey="product"
              class="inline-block mr-1"
              :width="35"
              :num="props.date.recipe_lists[recipe].out[product]"
            />
          </div>
          <span class="text-cool-gray-50" style="transform: scale(0.8)"
            >({{ props.date.recipe_lists[recipe].time }}s)</span
          >
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import useConfigStore from '@/store/config';
import {
  calculate,
  get_item_recipe_choices,
  set_item_recipe_choices,
  change_recipe_of,
  mineralize,
  unMineralize,
  get_one_item_recipe_choices,
} from '@/utils/calculate';
import DSP from '@/assets/data/DSP.json';
const config = useConfigStore();
const props = defineProps({
  visible: Boolean,
  close: Function,
  clickSelect: Function,
  date: Array,
  dateKey: String,
  content: Element,
});
const close = () => {
  console.log('1111关闭');
  if (props.close) {
    props.close();
  }
};
const changeRecipeOf = (key, index) => {
  console.log('key, index', key, index);
  change_recipe_of(key, index);
  config.changeConfig();
  if (props.close) {
    props.close();
  }
};
</script>
<style lang="scss">
.active {
  background-color: #42586c;
}
</style>
