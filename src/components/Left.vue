<template>
  <div class="container-left">
    <div class="title h-16">
      <h1 v-if="theme.compact" class="truncate pt-5 pb-5 text-center">戴森球计划量化计算器</h1>
    </div>
    <div class="nvmer overflow-y-auto">
      <!-- 采矿默认参数设置 -->
      <div class=" " v-if="theme.compact">
        <h2
          class="sticky bg-cyan-300 z-99 top-0 text-lg m-1 flex justify-center items-center"
          @click="showMiningConfig = !showMiningConfig"
        >
          配置当前工厂的默认参数
          <div class="pt-2 ml-5">
            <i-zondicons:arrow-thick-up v-if="showMiningConfig" />
            <i-zondicons:arrow-thick-down v-else />
            <i-ant-design:delete-filled class="ml-2" @click.stop="config.restoreMinings()" />
          </div>
        </h2>
        <hr style="border-top-width: 3px" />
        <ul class="m-3 overflow-y-auto" :style="{ height: showMiningConfig ? '430px' : '0px' }">
          <li>
            科技研究速度
            <el-input-number
              class="w-4"
              :min="1"
              size="small"
              v-model="config.scienceResearchSpeed"
              controls-position="right"
            />
            倍
          </li>
          <li class="flex">
            小型矿机默认覆盖矿脉的数量
            <el-input-number class="w-4" :min="1" size="small" v-model="config.miniCore" controls-position="right" />
            个
          </li>
          <li>
            大型矿机默认覆盖矿脉的数量
            <el-input-number class="w-4" :min="1" size="small" v-model="config.largeCore" controls-position="right" />
            个
          </li>
          <li>
            大型矿机默认开采倍率
            <el-input-number
              class="w-4"
              :min="1"
              size="small"
              v-model="config.largeCoreWorkingSpeed"
              controls-position="right"
            />
            倍
          </li>
          <li>
            油井默认开采速度
            <el-input-number
              class="w-4"
              :min="1"
              size="small"
              v-model="config.oilWellSpeed"
              controls-position="right"
            />
            /秒
          </li>
          <li>
            巨星-氢-开采速度
            <el-input-number
              class="w-4"
              :min="1"
              size="small"
              v-model="config.hydrogenCollectionRate"
              controls-position="right"
            />
          </li>
          <li>
            巨星-重氢-开采速度
            <el-input-number
              class="w-4"
              :min="1"
              size="small"
              v-model="config.heavyHydrogenCollectionRate"
              controls-position="right"
            />
          </li>
          <li>
            巨星-可燃冰-开采速度
            <el-input-number
              class="w-4"
              :min="1"
              size="small"
              v-model="config.combustibleIceCollectionRate"
              controls-position="right"
            />
          </li>

          <li>
            分馏塔过氢量
            <el-input-number
              class="w-4"
              :min="1"
              size="small"
              v-model="config.fractionatingColumnSpeed"
              controls-position="right"
            />
            /分钟
          </li>
          <li>
            伊卡洛斯手速-手动开采速度
            <el-input-number class="w-4" :min="1" size="small" v-model="config.shooter" controls-position="right" />
            /个
          </li>
        </ul>
      </div>
      <!-- 工厂默认参数设置 -->
      <div class=" " v-if="theme.compact">
        <h2
          class="sticky top-0 text-lg flex justify-center items-center"
          @click="showFactoryConfig = !showFactoryConfig"
        >
          批量配置工厂设置
          <div class="pt-2 ml-5">
            <i-zondicons:arrow-thick-up v-if="showFactoryConfig" />
            <i-zondicons:arrow-thick-down v-else />
            <i-ant-design:delete-filled class="ml-2" @click.stop="config.restoreFactory()" />
          </div>
        </h2>
        <hr style="border-top-width: 3px" />
        <ul class="m-3 overflow-y-auto" :style="{ height: showFactoryConfig ? '380px' : '0px' }">
          <li class="items-center">
            默认采矿设备
            <el-select v-model="config.defaultMining" class="m-2" placeholder="Select" size="small">
              <el-option
                v-for="option in config.miningOptions"
                :key="option"
                :label="labelHandel(option)"
                :value="option.key"
              />
            </el-select>
          </li>
          <li class="items-center">
            默认冶炼设备
            <el-select v-model="config.defaultSmelting" class="m-2" placeholder="Select" size="small">
              <el-option
                v-for="option in config.miningSmeltingOptions"
                :key="option"
                :label="labelHandel(option)"
                :value="option.key"
              />
            </el-select>
          </li>
          <li class="items-center">
            默认制造
            <el-select v-model="config.defaultProduction" class="m-2" placeholder="Select" size="small">
              <el-option
                v-for="option in config.miningProductionOptions"
                :key="option"
                :label="labelHandel(option)"
                :value="option.key"
              />
            </el-select>
          </li>
          <li class="items-center">
            默认化工
            <el-select v-model="config.defaultChemical" class="m-2" placeholder="Select" size="small">
              <el-option
                v-for="option in config.miningChemicalOptions"
                :key="option"
                :label="labelHandel(option)"
                :value="option.key"
              />
            </el-select>
          </li>
          <li class="items-center">
            默认充电
            <el-select v-model="config.defaultCharge" class="m-2" placeholder="Select" size="small">
              <el-option
                v-for="option in config.miningChargeOptions"
                :key="option"
                :label="labelHandel(option)"
                :value="option.key"
              />
            </el-select>
          </li>
          <li class="items-center">
            默认喷涂点数
            <el-select v-model="config.defaultSpraying" class="m-2" placeholder="Select" size="small">
              <el-option
                v-for="option in config.miningSprayingOptions"
                :key="option"
                :label="labelHandel(option)"
                :value="option.key"
              />
            </el-select>
          </li>
          <li class="items-center">
            默认增产模式 {{}}
            <el-select v-model="config.defaultInc" class="m-2" placeholder="Select" size="small">
              <el-option
                v-for="option in config.IncOptions"
                :key="option"
                :label="labelHandel(option)"
                :value="option.key"
              />
            </el-select>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isDark, toggleDark } from '@/utils/dark';
import useThemeStore from '@/store/theme';
import useConfigStore from '@/store/config';
import DSP from '@/assets/data/DSP';
const theme = useThemeStore();
const config = useConfigStore();
console.log('theme', theme);
console.log('config', config.miningOptions);
const { t, availableLocales, locale } = useI18n();
const widthOT = computed(() => {
  return theme.compact ? '420px' : '50px';
});
const restpredDefault = (type) => {
  console.log('type', type);
  if (type === 'mining') {
    config.restoreMinings();
  } else {
    config.restoreFactory();
  }
};
const labelHandel = (option) => {
  //如果设置name 属性， 则直接展示 设置的 name
  if (option.label) {
    return option.label;
  }
  if (option.name) {
    return option.name;
  }

  //如果 选项类型是数字 并没有name 属性， 则只展示数字
  if (/^[0-9]+.?[0-9]*$/.test(option.key) && !option.name) {
    return option.key;
  }

  // 如果key 不是数字， 则拿key去 数组里面找到相应的数据
  if (isProxy(option)) {
    console.log('option.value.key', DSP[option.key].name);

    return DSP[option.key].name;
  } else {
    return DSP[option.name];
  }
};

const showMiningConfig = ref(false);
const showFactoryConfig = ref(false);
</script>
<style lang="scss" scoped>
.container-left {
  height: 100vh;
  width: v-bind('widthOT');
  background-color: #eee;
  transition: width 0.3s;
}
.icon-footer {
  font-size: 1.3em;
}
.nvmer {
  height: calc(100vh - 65px);
  min-width: 323px;
}
.nvmer::-webkit-scrollbar {
  width: 5px;
  height: 8px;
  background-color: #bbbbbb; /* or add it to the track */
}
.nvmer::-webkit-scrollbar-thumb {
  background: #575757;
}
.nvmer li {
  margin: 0.75rem;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}
.nvmer li spinner {
  min-width: 30px;
  text-align: center;
  border: 1px solid #bbbbbb;
}
/* 设置数字输入框宽度 */
.el-input-number {
  width: 70px;
}
/* 设置下拉框框宽度 */
.el-select {
  width: 120px;
}
.nvmer .el-input-number .el-input__wrapper {
  padding-left: 2px;
  padding-right: 30px;
}
.nvmer svg {
  cursor: pointer;
}
</style>
