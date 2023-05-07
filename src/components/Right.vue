<template>
  <div class="">
    <div class="top pt-3 pl-3 pb-3 flex items-center">
      <el-icon :size="18" color="#222" class="mr-5">
        <button class="icon-btn mx-2 !outline-none" @click="click()">
          <i-zondicons:indent-decrease v-if="theme.compact" class="icon-footer" />
          <i-zondicons:indent-increase v-else class="icon-footer -rotate-x-180" />
        </button>
      </el-icon>
      <el-button type="warning" round @click="restorConfig">清除所有配置信息</el-button>
    </div>

    <div class="container-right overflow-y-auto">
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
        <div v-if="Object.keys(recipeList.mineralize_list).length > 0">
          原矿化的产物: (单击图标删除原矿化物品)
          <div class="flex">
            <div v-for="mineralize in Object.keys(recipeList.mineralize_list)" class="">
              <ProductImg :key="key" :imgKey="mineralize" class="mx-4" @click="del_mine(mineralize)" />
            </div>
          </div>
        </div>
      </div>
      <DSPElDialog :visible="dialogFormVisible" :clone="cloneProduct" :clickSelect="selectProduct"></DSPElDialog>
      <!-- 配方详情列表内容 -->
      <div class="lists min-h-35">
        <div class="sticky top-0 z-99">
          <ul class="flex text-center">
            <li class="btn-action">操作</li>
            <li class="target-product">目标产物</li>
            <li class="demand">需求量</li>
            <li class="plant">所需工厂</li>
            <li class="recipe">配方选择</li>
            <li class="production">增产剂等级</li>
            <li class="production-model">增产模式选择</li>
            <li class="plant-model">工厂类型选择</li>
          </ul>
        </div>
        <div v-show="recipeList.list_data.length === 0" class="flex justify-center items-center" style="height: 115px">
          展示产物信息
        </div>

        <!-- 循环列表开始 -->
        <div v-for="result in recipeList.list_data" :key="result" class="list-content flex text-center">
          <div class="btn-action btn flex justify-center items-center">
            <ElButton
              plain
              size="small"
              @click="set_mine(result.key)"
              color="recipeList.mineralize_list[result.key] ? '#626aef': '#222222' "
              >{{ recipeList.mineralize_list[result.key] ? '取消原矿' : '视为原矿' }}
            </ElButton>
          </div>
          <div class="target-product flex justify-center items-center">
            <ProductImg :imgKey="result.key" class="inline-block" />
          </div>
          <div class="demand">
            {{ result.efficiency }}
            <div v-if="Object.keys(recipeList.excessProduct).length > 0 && recipeList.excessProduct[result.key]">
              <div v-for="excessProduct in Object.keys(recipeList.excessProduct[result.key])">
                +来自 {{ DSP[excessProduct].name }} 的 {{ recipeList.excessProduct[result.key][excessProduct] }}
              </div>
            </div>
          </div>
          <div class="plant flex justify-center items-center">
            <ProductImg :imgKey="result.factoriesNum.key" class="inline-block" />
            {{ result.factoriesNum.num }}
          </div>
          <div class="recipe flex-col">
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
          <div class="production flex">
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
          <div class="production-model flex">
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
          <div class="flex plant-model">
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
          <div v-if="0 != Number(result.factoriesNum)"></div>
        </div>
      </div>

      <div class="h-[calc(100%-50rem)] pb-5 pl-20">
        <template v-if="Object.keys(recipeList.building_list).length > 0">
          <div>总计需要的建筑:</div>
          <div v-for="building in Object.keys(recipeList.building_list)">
            <ProductImg width="22" :imgKey="building" class="inline-block" />
            <!-- {{ building }} -->
            {{ DSP[building].name }} --- {{ recipeList.building_list[building] }} 个
          </div>
          <div>
            预估电力需求下限：{{ recipeList.energy_cost.toFixed(2) }} MW
            <el-button color="#626aef" :dark="isDark" @click="change_energy">
              {{ config.energy_contain_miner ? '考虑采集设备耗电' : '忽视采集设备耗电' }}</el-button
            >
          </div>
        </template>
      </div>
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
import {
  calculate,
  get_item_recipe_choices,
  set_item_recipe_choices,
  change_recipe_of,
  mineralize,
  unmineralize,
} from '@/utils/calculate';
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

const set_mine = (key) => {
  if (recipeList.value.mineralize_list[key]) {
    unmineralize(key);
  } else {
    mineralize(key);
  }
  config.changeConfig();
};
const del_mine = (key) => {
  unmineralize(key);
  config.changeConfig();
};
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
  const data = calculate(productList.value);

  console.log('obj', config.isChange);
  return data;
});

const changeRecipeOf = (key, index) => {
  change_recipe_of(key, index);
  config.changeConfig();
  // obj.value = !obj.value;
  // const data = calculate(productList.value);
};
const changeRecipeRecipeChoices = (key, type, index) => {
  set_item_recipe_choices(key, type, index);
  config.changeConfig();
};
const restorConfig = () => {
  config.restoreMinings();
  config.restoreFactory();
  productList.value = {};
};

const change_energy = () => {
  config.change_energy_contain_miner();
  config.changeConfig();
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

.btn-action {
  width: 6%;
}
.target-product {
  width: 6%;
}
.demand {
  width: 16%;
  display: flex;
  flex-direction: column;
}
.plant {
  width: 10%;
}
.list-content .plant {
  width: 10%;
  /* justify-content: space-evenly; */
}
/* 配方的宽度百分比 */
.recipe {
  width: 14%;
}
.production {
  width: 10%;
}
.production-model {
  width: 14%;
}
.plant-model {
  width: 10%;
}
</style>
