<template>
  <div class="container-left">
    <div class="title flex justify-between items-center">
      <span></span>
      <h1 v-if="theme.compact" class="bg-light-50">更多设置</h1>

      <el-tooltip class="box-item" effect="dark" show-after="300" content="点击展开更多设置" placement="right">
        <el-icon :size="18" color="#222" class="mr-3">
          <button class="icon-btn mx-2 !outline-none" @click="click()">
            <i-zondicons:indent-decrease v-if="theme.compact" class="icon-footer" />
            <i-zondicons:indent-increase v-else class="icon-footer -rotate-x-180" />
          </button>
        </el-icon>
      </el-tooltip>
    </div>
    <div class="nvmer overflow-y-auto" v-if="theme.compact">
      <!-- 采矿默认参数设置 -->
      <div class=" ">
        <h2
          class="sticky z-99 top-0 text-lg flex justify-center items-center bg-light-50"
          @click="showMiningConfig = !showMiningConfig"
        >
          配置当前工厂的默认参数
          <div class="pt-2 ml-5">
            <el-tooltip
              show-after="300"
              class="box-item"
              effect="dark"
              :content="showMiningConfig ? '点击收起' : '点击展开'"
              placement="top"
            >
              <i-zondicons:arrow-thick-up v-if="showMiningConfig" />
              <i-zondicons:arrow-thick-down v-else />
            </el-tooltip>
            <el-tooltip show-after="300" class="box-item" effect="dark" content="删除恢复默认" placement="top">
              <i-ant-design:delete-filled class="ml-2" @click.stop="config.restoreMinings()" />
            </el-tooltip>
          </div>
        </h2>
        <ul class="m-3 overflow-y-auto" :style="{ height: showMiningConfig ? '430px' : '0px' }">
          <li>
            采矿科技面板倍率
            <el-input-number
              @change="changeConfig"
              class="w-7"
              :min="0.0001"
              :max="99999"
              size="small"
              v-model="config.scienceResearchSpeed"
              controls-position="right"
            />
            倍
          </li>
          <li class="flex">
            小型矿机默认覆盖矿脉的数量
            <el-input-number
              class="w-7"
              @change="changeConfig"
              :min="1"
              :max="28"
              size="small"
              v-model="config.miniCore"
              controls-position="right"
            />
            个
          </li>
          <li>
            大型矿机默认覆盖矿脉的数量
            <el-input-number
              class="w-7"
              @change="changeConfig"
              :min="1"
              :max="10"
              size="small"
              v-model="config.largeCore"
              controls-position="right"
            />
            个
          </li>
          <li>
            大型矿机默认开采倍率
            <el-input-number
              @change="changeConfig"
              class="w-7"
              :min="1"
              :max="9"
              size="small"
              v-model="config.largeCoreWorkingSpeed"
              controls-position="right"
            />
            倍
          </li>
          <li>
            油井默认开采速度
            <el-input-number
              @change="changeConfig"
              class="w-7"
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
              @change="changeConfig"
              class="w-7"
              :min="0.0001"
              :step="0.1"
              size="small"
              v-model="config.hydrogenCollectionRate"
              controls-position="right"
            />
          </li>
          <li>
            巨星-重氢-开采速度
            <el-input-number
              @change="changeConfig"
              class="w-7"
              :min="0.0001"
              :step="0.1"
              size="small"
              v-model="config.heavyHydrogenCollectionRate"
              controls-position="right"
            />
          </li>
          <li>
            巨星-可燃冰-开采速度
            <el-input-number
              @change="changeConfig"
              class="w-7"
              :min="0.0001"
              :step="0.1"
              size="small"
              v-model="config.combustibleIceCollectionRate"
              controls-position="right"
            />
          </li>

          <li>
            分馏塔过氢量
            <el-input-number
              @change="changeConfig"
              class="w-7"
              :min="1"
              size="small"
              v-model="config.fractionatingColumnSpeed"
              controls-position="right"
            />
            /分钟
          </li>
          <li>
            伊卡洛斯手速-手动开采速度
            <el-input-number
              class="w-7"
              @change="changeConfig"
              :min="1"
              size="small"
              v-model="config.shooter"
              controls-position="right"
            />
            /个
          </li>
        </ul>
      </div>
      <!-- 工厂默认参数设置 -->
      <div class=" ">
        <h2
          class="sticky top-0 text-lg flex justify-center items-center bg-light-50"
          @click="showFactoryConfig = !showFactoryConfig"
        >
          批量配置工厂设置
          <div class="pt-2 ml-5">
            <el-tooltip
              show-after="300"
              class="box-item"
              effect="dark"
              :content="showFactoryConfig ? '点击收起' : '点击展开'"
              placement="top"
            >
              <i-zondicons:arrow-thick-up v-if="showFactoryConfig" />
              <i-zondicons:arrow-thick-down v-else />
            </el-tooltip>
            <el-tooltip show-after="300" class="box-item" effect="dark" content="删除恢复默认" placement="top">
              <i-ant-design:delete-filled class="ml-2" @click.stop="config.restoreFactory()" />
            </el-tooltip>
          </div>
        </h2>
        <ul class="m-3 overflow-y-auto" :style="{ height: showFactoryConfig ? '380px' : '0px' }">
          <li class="items-center">
            默认采矿设备1
            <el-select
              v-model="config.defaultMining"
              @change="changeMiningConfig"
              class="m-2"
              placeholder="Select"
              size="small"
            >
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
            <el-select
              v-model="config.defaultSmelting"
              @change="changeSmeltingConfig"
              class="m-2"
              placeholder="Select"
              size="small"
            >
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
            <el-select
              v-model="config.defaultProduction"
              @change="changeProductionConfig"
              class="m-2"
              placeholder="Select"
              size="small"
            >
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
            <el-select
              v-model="config.defaultChemical"
              @change="changeChemicalConfig"
              class="m-2"
              placeholder="Select"
              size="small"
            >
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
            <el-select
              v-model="config.defaultCharge"
              @change="changeChargeConfig"
              class="m-2"
              placeholder="Select"
              size="small"
            >
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
            <el-select
              v-model="config.defaultSpraying"
              @change="changeSprayingConfig"
              class="m-2"
              placeholder="Select"
              size="small"
            >
              <el-option
                v-for="option in config.miningSprayingOptions"
                :key="option"
                :label="labelHandel(option)"
                :value="option.key"
              />
            </el-select>
          </li>
          <li class="items-center">
            默认增产模式
            <el-select
              v-model="config.defaultInc"
              @change="changeIncConfig"
              class="m-2"
              placeholder="Select"
              size="small"
            >
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
      <!-- 操作按钮区 -->
      <div class="flex justify-center items-center">
        <el-button type="warning" round @click="restorConfig">清除所有配置信息</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isDark, toggleDark } from '@/utils/dark';
import useThemeStore from '@/store/theme';
import useConfigStore from '@/store/config';
import DSP from '@/assets/data/DSP';
import {
  calculate,
  get_item_recipe_choices,
  set_item_recipe_choices,
  change_recipe_of,
  batchChangeFactoryOf,
  batchChangeProMode,
  batchChangeProNum,
} from '@/utils/calculate';
const theme = useThemeStore();
const config = useConfigStore();

const { t, availableLocales, locale } = useI18n();
const widthOT = computed(() => {
  return theme.compact ? '420px' : '0px';
});

const click = () => {
  // 点击切换侧边栏状态;
  theme.changeCompact();
};

const restpredDefault = (type) => {
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
    return DSP[option.key].name;
  } else {
    return DSP[option.name];
  }
};
const changeConfig = () => {
  config.changeConfig();
};
const changeMiningConfig = (item: any) => {
  batchChangeFactoryOf('采矿设备', item);
  config.changeConfig();
};
const changeSmeltingConfig = (item) => {
  batchChangeFactoryOf('冶炼设备', item);
  config.changeConfig();
};
const changeProductionConfig = (item) => {
  batchChangeFactoryOf('production_platform', item);
  config.changeConfig();
};
const changeChemicalConfig = (item) => {
  batchChangeFactoryOf('化工设备', item);
  config.changeConfig();
};
const changeChargeConfig = (item) => {
  batchChangeFactoryOf('充电设备', item);
  config.changeConfig();
};
const changeIncConfig = (pro_mode) => {
  batchChangeProMode(pro_mode);
  config.changeConfig();
};
const changeSprayingConfig = (pro_mode) => {
  batchChangeProNum(pro_mode);
  config.changeConfig();
};

const showMiningConfig = ref(true);
const showFactoryConfig = ref(true);
</script>
<style lang="scss" scoped>
.title {
  height: 45px;
  border-bottom: #575757 solid 2px;
}
.title h1 {
  font-weight: 700;
}
.container-left {
  background-color: #fff;
  border-right: 2px solid #eee;
  z-index: 100;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  width: v-bind('widthOT');
}
.icon-footer {
  font-size: 1.3em;
}
.nvmer {
  height: calc(100vh - 45px);
  min-width: 323px;
}
.nvmer::-webkit-scrollbar {
  width: 5px;
  height: 8px;
  background-color: #bbbbbb; /* or add it to the track */
}
.nvmer::-webkit-scrollbar-thumb {
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
.el-input__wrapper {
  padding-right: 0;
  background-color: red;
}
.nvme .el-input-number .is-controls-right .el-input__wrapper {
  background-color: red;
  padding-right: 0;
}
.nvmer .el-input-number .el-input__wrapper {
  padding-left: 2px;
  background-color: red;
  padding-right: 30px;
}
.nvmer svg {
  cursor: pointer;
}
</style>
