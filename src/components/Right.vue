<template>
  <div class="">
    <div class="top pt-3 pl-3">
      <el-icon :size="18" color="#222" class="mr-5">
        <button class="icon-btn mx-2 !outline-none" @click="click()">
          <i-zondicons:indent-decrease v-if="theme.compact" class="icon-footer" />
          <i-zondicons:indent-increase v-else class="icon-footer -rotate-x-180" />
        </button>
      </el-icon>
    </div>

    <div class="container-right overflow-y-scroll">
      <div class="add-items min-h-20 max-h-95 overflow-y-auto">
        <div class="sticky top-0 bg-cyan-600 z-99 pt-5 pl-5">
          选择目标物
          <ElButton @click="openSelect"> 添加一个新产物</ElButton>
          <ElButton v-show="Object.keys(productList).length > 0" @click="cloneSelect"> 清空产物列表</ElButton>
          {{ productList }}
        </div>

        <div v-show="productList" class=" ">
          <div class="product flex items-center" v-for="key in Object.keys(productList)">
            <el-button type="primary" :icon="Delete" @click="delProduct(key)" />
            <ProductImg :key="key" :imgKey="key" class="mx-4" />
            <div class="mx-4 w-35 text-center">{{ DSP[key].name }}</div>
            <el-input-number v-model="productList[key]" controls-position="right" :min="0" class="mx-4 h-8" />
            / 分钟
          </div>
        </div>
      </div>
      <DSPElDialog :visible="dialogFormVisible" :clone="cloneProduct" :clickSelect="selectProduct"></DSPElDialog>
      <!-- 配方详情列表内容 -->
      <div class="lists min-h-35">
        <div class="sticky top-0 z-99">
          <ul class="flex text-center">
            <li class="w-25">操作</li>
            <li class="w-25">目标产物</li>
            <li class="w-25">需求量</li>
            <li class="w-40">所需工厂</li>
            <li class="w-90">配方选择</li>
            <li class="w-30">增产剂等级</li>
            <li class="w-110">增产模式选择</li>
            <li class="w-40">工厂类型选择</li>
          </ul>
        </div>
        <div v-show="recipeList.list_data.length === 0" class="flex justify-center items-center" style="height: 115px">
          展示产物信息
        </div>

        <!-- 循环列表开始 -->
        <div v-for="result in recipeList.list_data" :key="result" class="list-content flex text-center">
          <div v-if="0 != Number(result.factoriesNum)">
            <div class="btn w-25 flex justify-center items-center">
              <ElButton type="warning" plain size="small">视为原矿 </ElButton>
            </div>
            <div class="w-25 flex justify-center items-center">
              <ProductImg :imgKey="result.key" class="inline-block" />
            </div>
            <div class="w-25">
              {{ result.efficiency }}
            </div>
            <div class="w-45 flex justify-center items-center">
              <ProductImg :imgKey="result.factoriesNum.key" class="inline-block" />
              {{ result.factoriesNum.num }}
            </div>
            <div class="w-80">
              <div v-for="(recipe, index) in recipeList.item_data[result.key]" :key="recipe">
                <div
                  v-if="index != 0"
                  :class="{ active: recipeList.item_recipe_choices[result.key] == index }"
                  class="flex items-center m-3 w-60 bg-current cursor-pointer"
                  @click="changeRecipeOf(result.key, index)"
                >
                  <div v-for="material in Object.keys(recipeList.recipe_lists[recipe].in)">
                    <ProductImg
                      :imgKey="material"
                      class="inline-block"
                      :width="25"
                      :num="recipeList.recipe_lists[recipe].in[material]"
                    />
                  </div>

                  <div v-if="Object.keys(recipeList.recipe_lists[recipe].in).length > 0" class="text-cool-gray-50">
                    ==>
                  </div>
                  <div v-for="product in Object.keys(recipeList.recipe_lists[recipe].out)">
                    <ProductImg
                      :imgKey="product"
                      class="inline-block"
                      :width="25"
                      :num="recipeList.recipe_lists[recipe].out[product]"
                    />
                  </div>
                  <span class="text-cool-gray-50" style="transform: scale(0.8)"
                    >({{ recipeList.recipe_lists[recipe].time }}s)</span
                  >
                </div>
              </div>
            </div>
            <!-- 增产剂等级 -->
            <div class="w-60 flex">
              <div
                v-for="(sprayingOption, index) in config.miningSprayingOptions"
                key="sprayingOption.name"
                class="ml-2 bg-current cursor-pointer"
                @click="changeRecipeRecipeChoices(result.key, 'additional_level', sprayingOption.key)"
                :class="{ active: get_item_recipe_choices(result.key)['additional_level'] == sprayingOption.key }"
              >
                <!-- get_item_recipe_choices(result.key) -->
                <div v-if="sprayingOption.key == 0" class="text-cool-gray-50 text-xs text-center leading-loose">
                  {{ sprayingOption.name }}
                </div>
                <div v-else>
                  <ProductImg width="22" :imgKey="sprayingOption.name" class="inline-block" />
                </div>
              </div>
            </div>
            <!-- 选择增产剂模式 -->
            <div class="w-90 flex">
              <div
                v-for="(option, index) in config.miningIncOptions[
                  get_item_recipe_choices(result.key)['additional_mode_index']
                ]"
                class="ml-2 bg-current cursor-pointer"
                :class="{ active: get_item_recipe_choices(result.key)['additional_mode'] == option.key }"
                :key="option"
                @click="changeRecipeRecipeChoices(result.key, 'additional_mode', option.key)"
              >
                <span class="text-cool-gray-50"> {{ option.name }}</span>
              </div>
            </div>
            <div class="w-40 flex">
              <div
                class="bg-current ml-4 p-1"
                :class="{ active: get_item_recipe_choices(result.key)['architecture'] == index }"
                v-for="(facility, index) in facilityLabel(
                  recipeList.item_data[result.key],
                  recipeList.item_recipe_choices[result.key],
                )"
                @click="changeRecipeRecipeChoices(result.key, 'architecture', index)"
              >
                <ProductImg width="22" :imgKey="facility.名称" class="inline-block" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="h-[calc(100%-50rem)]">bottn</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isDark, toggleDark } from '@/utils/dark';
import { Delete } from '@element-plus/icons-vue';
import useCounterStore from '@/store/theme';
import useConfigStore from '@/store/config';
import DSP from '@/assets/data/DSP.json';
import game_data from '@/assets/data/game_data.json';
import { calculate, get_item_recipe_choices, set_item_recipe_choices, change_recipe_of } from '@/utils/calculate';
const theme = useCounterStore();
const config = useConfigStore();
let showleft = ref(false);
let productKey = ref('circuit_board');
let dialogFormVisible = ref(false); //显示dialog 框
const click = () => {
  // 点击切换侧边栏状态;
  theme.changeCompact();
  console.log('theme', theme.compact);
};

const { t, availableLocales, locale } = useI18n();
const openSelect = () => {
  console.log('dialogFormVisible', dialogFormVisible.value);
  dialogFormVisible.value = !dialogFormVisible.value;
};
const selectProduct = (selectItem) => {
  if (selectItem.key in productList.value) {
    productList.value[selectItem.key] += selectItem.num;
  } else {
    productList.value[selectItem.key] = selectItem.num;
  }

  dialogFormVisible.value = false;
};
const cloneProduct = (type) => {
  calculate();
  dialogFormVisible.value = false;
};
// 当前选中的目标产物列表
const productList = ref({
  e_matrix: 60,
});
const obj = ref(false);
//点击删除产物
const delProduct = (key) => {
  if (productList.value[key]) {
    delete productList.value[key];
  }
};
const cloneSelect = () => {
  productList.value = {};
};
const facilityLabel = (list, key) => {
  return game_data['factory_data'][recipeList.value.recipe_lists[list[key]]['facility']];
};
const recipeList = computed(() => {
  console.log('recipeList', productList);
  // calculate({ needs_list: productList });
  const data = calculate(productList.value);

  //默认产物中有 氢存在  但产出是0  所以忽略掉所有 产出是0 的 产物
  // data.list_data = data.list_data.filter((item) => {
  //   return Number(item.efficiency) !== 0;
  // });
  console.log('obj', obj.value);
  return data;
});

const changeRecipeOf = (key, index) => {
  change_recipe_of(key, index);
  obj.value = !obj.value;
  // const data = calculate(productList.value);
};
const changeRecipeRecipeChoices = (key, type, index) => {
  set_item_recipe_choices(key, type, index);
  obj.value = !obj.value;
  // const data = calculate(productList.value);
};
</script>

<style lang="scss">
.top {
  height: 45px;
  background-color: #1111;
}

.container-right {
  background-color: #a7a4a4;
  height: calc(100vh - 45px);
}

.lists {
  background-color: #a1c7bf;
  /* height: calc(100vh - 138px); */
}
.lists > div {
  background-color: #a1c7bf;
}

.lists li {
}
.list-content {
  border-bottom: solid 2px #444;
}

.list-content:nth-last-child(1) {
  border: none;
}
.list-content > div {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-footer {
  font-size: 1.3em;
}

.product {
  border-bottom: 2px solid #222;
}

.product:nth-last-child(1) {
  border: none;
}
.active {
  background-color: #7386aa;
}
</style>
