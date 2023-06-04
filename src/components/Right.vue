<template>
  <div :class="theme.compact ? 'container-right-show' : 'container-right-hide'">
    <div class="container-right overflow-y-auto">
      <div class="add-items min-h-20 max-h-95 overflow-y-auto">
        <div class="sticky top-0 z-99 p-5">
          选择目标物
          <ElButton @click="openSelect"> 添加一个新产物</ElButton>
          <ElButton v-show="Object.keys(productList).length > 0" @click="cloneSelect"> 清空产物列表</ElButton>

          <span v-if="devModel">
            {{ productList }}
          </span>
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
      <DSPElDialog :visible="dialogFormVisible" :close="closeProduct" :clickSelect="selectProduct"></DSPElDialog>
      <!-- 配方详情列表内容 -->
      <div>
        <div class="lists min-h-35">
          <div class="sticky top-0 z-99 list-title">
            <ul class="flex text-center">
              <li class="btn-action">操作</li>
              <li class="target-product">目标产物</li>
              <li class="demand">需求量</li>
              <li class="plant">所需工厂</li>
              <li class="recipe">配方选择</li>
              <li class="production">工厂类型选择</li>
              <li class="production-model">增产模式选择</li>
              <li class="plant-model">增产剂等级</li>
            </ul>
          </div>
          <div
            v-show="recipeList.list_data.length === 0"
            class="flex justify-center items-center"
            style="height: 115px"
          >
            展示产物信息
          </div>

          <!-- 循环列表开始 -->
          <div v-for="result in recipeList.list_data" :key="result" class="list-content flex text-center border-dashed">
            <div class="btn-action btn flex justify-center items-center">
              <el-Button plain size="small" @click="set_mine(result.key)"
                >{{ recipeList.mineralize_list[result.key] ? '取消原矿' : '视为原矿' }}
              </el-Button>
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
            <!-- 所需要的工厂 -->
            <div class="plant flex items-center">
              <ProductImg :imgKey="result.factoriesNum.key" class="inline-block" />
              {{ result.factoriesNum.num }}
            </div>
            <!-- 选择的配方 -->
            <div class="recipe flex-col" v-if="!result.factoriesNum.is_mineralized">
              <div v-for="(recipe, index) in recipeList.item_data[result.key]" :key="recipe">
                <!-- 配方的第0 个, 啥也不是, 冗余数据 ,需要跳出 -->
                <div
                  v-if="index != 0 && recipeList.item_recipe_choices[result.key] == index"
                  :class="{
                    active: recipeList.item_recipe_choices[result.key] == index,
                    'cursor-pointer': recipeList.item_data[result.key].length != 2,
                  }"
                  class="flex items-center m-2 w-85 pr-2 pl-2 rounded-lg bg-current"
                  @click="changeRecipeOf(result.key, index, recipeList, result.key)"
                >
                  <div v-for="material in Object.keys(recipeList.recipe_lists[recipe].in)">
                    <ProductImg
                      :imgKey="material"
                      class="inline-block mr-1"
                      :width="35"
                      :num="recipeList.recipe_lists[recipe].in[material]"
                    />
                  </div>

                  <div v-if="Object.keys(recipeList.recipe_lists[recipe].in).length > 0" class="text-cool-gray-50">
                    <i-zondicons:arrow-thin-right> </i-zondicons:arrow-thin-right>
                  </div>
                  <div v-for="product in Object.keys(recipeList.recipe_lists[recipe].out)">
                    <ProductImg
                      :imgKey="product"
                      class="inline-block mr-1"
                      :width="35"
                      :num="recipeList.recipe_lists[recipe].out[product]"
                    />
                  </div>
                  <span class="text-cool-gray-50" style="transform: scale(0.8)"
                    >({{ recipeList.recipe_lists[recipe].time }}s)
                    {{ recipeList.item_data[result.key].length == 2 ? '' : ' 点击选择配方' }}
                  </span>
                </div>
              </div>
            </div>
            <!-- 工厂选择 -->
            <div class="flex plant-model justify-start" v-if="!result.factoriesNum.is_mineralized">
              <div
                class="bg-current ml-4 p-1 rounded-lg cursor-pointer"
                :class="{ active: get_item_recipe_choices(result.key)['architecture'] == index }"
                v-for="(facility, index) in facilityLabel(
                  recipeList.item_data[result.key],
                  recipeList.item_recipe_choices[result.key],
                )"
                @click="changeRecipeRecipeChoices(result.key, 'architecture', index)"
              >
                <ProductImg width="35" :imgKey="facility.名称" class="inline-block" />
              </div>
            </div>
            <!-- 选择增产剂模式 -->
            <!-- && get_item_recipe_choices(result.key)['additional_level'] != 0 -->
            <div class="production-model flex" v-if="!result.factoriesNum.is_mineralized">
              <div
                v-for="option in config.miningIncOptions[get_item_recipe_choices(result.key)['additional_mode_index']]"
                class="ml-2 bg-current cursor-pointer miningInc rounded-lg"
                :class="{ active: get_item_recipe_choices(result.key)['additional_mode'] == option.key }"
                :key="option"
                @click="changeRecipeRecipeChoices(result.key, 'additional_mode', option.key)"
              >
                <span class="text-cool-gray-50"> {{ option.name }}</span>
              </div>
            </div>
            <!-- 增产剂等级 -->
            <div
              class="production flex"
              v-if="!result.factoriesNum.is_mineralized && get_item_recipe_choices(result.key)['additional_mode'] != 0"
            >
              {{ get_item_recipe_choices(result.key)['additional_level'] }}
              <div
                v-for="(sprayingOption, index) in config.miningSprayingOptions"
                key="sprayingOption.name"
                class="ml-2 bg-current cursor-pointer miningInc rounded-lg"
                @click="changeRecipeRecipeChoices(result.key, 'additional_level', sprayingOption.key)"
                :class="{ active: get_item_recipe_choices(result.key)['additional_level'] == sprayingOption.key }"
              >
                <!-- get_item_recipe_choices(result.key) -->
                <!-- <div v-if="sprayingOption.key == 0"> -->
                <!-- {{ sprayingOption.name }}-->
                <!-- 不使用 -->
                <!-- </div v-else> -->
                <div v-if="sprayingOption.key != 0">
                  <ProductImg width="35" :imgKey="sprayingOption.name" class="inline-block" />
                </div>
              </div>
            </div>

            <div v-if="0 != Number(result.factoriesNum)"></div>
          </div>
        </div>
      </div>

      <div class="h-[calc(100%-50rem)] pb-5 pl-20">
        <template v-if="Object.keys(recipeList.building_list).length > 0">
          <div>总计需要的建筑:</div>
          <div v-for="building in Object.keys(recipeList.building_list)">
            <ProductImg width="35" :imgKey="building" class="inline-block" />
            {{ DSP[building].name }} --- {{ recipeList.building_list[building] }} 个
          </div>
          <div>
            预估电力需求下限：{{ recipeList.energy_cost.toFixed(2) }} MW
            <el-button color="#626aef" :dark="isDark" @click="change_energy">
              {{ config.energy_contain_miner ? '忽视采集设备耗电' : '考虑采集设备耗电' }}</el-button
            >
          </div>
        </template>
        <EnReadme class=""></EnReadme>
      </div>
    </div>
    <FormulaSelectionDialog
      :visible="visibleFormulaDialog"
      :close="closeformuldialog"
      :date="FormulaDialogDate"
      :dateKey="FormulaDialogDateKey"
      :changeRecipeOf="changeRecipeOf"
    ></FormulaSelectionDialog>
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
  unMineralize,
  get_one_item_recipe_choices,
} from '@/utils/calculate';
const theme = useCounterStore();
const config = useConfigStore();
let dialogFormVisible = ref(false); //显示dialog 框
let devModel = ref(import.meta.env.DEV); //显示dialog 框

const visibleFormulaDialog = ref(false);
const FormulaDialogDate = ref([]);
const FormulaDialogDateKey = ref(0);
const click = () => {
  // 点击切换侧边栏状态;
  theme.changeCompact();
};

const { t, availableLocales, locale } = useI18n();
console.log();
const set_mine = (key) => {
  if (recipeList.value.mineralize_list[key]) {
    unMineralize(key);
  } else {
    mineralize(key);
  }
  config.changeConfig();
};
const del_mine = (key) => {
  unMineralize(key);
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
const closeProduct = () => {
  calculate();
  dialogFormVisible.value = false;
};
// 当前选中的目标产物列表
const productList = ref({});
const obj = ref(false);
//点击删除产物
const delProduct = (key: string) => {
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
  console.log('计算的需求信息', productList.value);

  const data = calculate(productList.value);
  // TODO 这个 console  帮定了依赖项， 如果删除，则丢失，不能相应批量改变
  console.log('数据发生改变，重新计算所有依赖', config.isChange);
  console.log('data', data);
  // data.list_data.sost((a) => a.factoriesNum.is_mineralized);

  return data;
});

const changeRecipeOf = (key, index, array, arrayKey) => {
  if (array.item_data[arrayKey].length != 2) {
    visibleFormulaDialog.value = true;
    FormulaDialogDate.value = array;
    FormulaDialogDateKey.value = arrayKey;
  } else {
    ElMessage({
      message: '此产物没有配方选择',
      type: 'warning',
    });
  }
  // change_recipe_of(key, index);

  // config.changeConfig();
};
const closeformuldialog = () => {
  visibleFormulaDialog.value = false;
  // FormulaDialogDate.value = [];
  // FormulaDialogDateKey.value = 0;
};
const changeRecipeRecipeChoices = (key, type, index) => {
  // 修改增产剂等级
  if (get_one_item_recipe_choices(key, type) === index) {
    console.log(key, type, index);
    set_item_recipe_choices(key, type, 0);
  } else {
    set_item_recipe_choices(key, type, index);
  }

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
.container-right-show {
  padding-left: 420px;
}
.container-right-show {
  margin-left: 0px;
}
.miningInc {
  font-size: 12px;
  padding: 4px 8px;
}
// 未选择的背景色
.bg-current {
  background-color: #878787;
}
.top {
  background-color: red;
}

.container-right {
  border-bottom: #8c949c solid 2px;
}

.lists {
  border-bottom: #8c949c solid 2px;
}
.lists > div {
}
.list-title {
  position: sticky;
  top: 0;
  border-bottom: #42586c solid 2px;
}
.list-content {
  border-bottom: dashed 2px #7386aa;
}

.list-content:nth-last-child(1) {
  border: none;
}
.list-content {
  display: flex;
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
  background-color: #42586c;
}

.btn-action {
  width: 6%;
}
.target-product {
  width: 6%;
}
.demand {
  width: 10%;
  display: flex;
  flex-direction: column;
}
.plant {
  width: 6%;
}
.list-content .plant {
  /* justify-content: space-evenly; */
}
/* 配方的宽度百分比 */
.recipe {
  min-width: 356px;
}
.plant-model {
  min-width: 190px;
}
.production {
  min-width: 200px;
}
.production-model {
  min-width: 120px;
}
</style>
