import { defineStore } from 'pinia';
//整个跟游戏相关的配置在这里统一读取和修改

const config = defineStore({
  // 这里的id必须为唯一ID
  id: 'config',
  persist: true,
  state: () => {
    return {
      isChange: false, // 检测是否数据发生变化, 发生变化的时候就重新计算公式参数
      scienceResearchSpeed: 1, //科技研究速度
      miniCore: 8, //小型矿机默认覆盖矿脉的数量
      largeCore: 16, //大型矿机默认覆盖矿脉的数量
      largeCoreWorkingSpeed: 3, //大型矿机默认开采倍率
      oilWellSpeed: 3, //油井默认开采速度
      hydrogenCollectionRate: 3, //巨星-氢-开采速度
      heavyHydrogenCollectionRate: 0.2, //巨星-重氢-开采速度
      combustibleIceCollectionRate: 0.5, //巨星-可燃冰-开采速度
      shooter: 1, //伊卡洛斯手速-手动开采速度
      fractionatingColumnSpeed: 60, //分馏塔过氢量
      energy_contain_miner: 0,
      defaultMining: '0', //默认采矿设备 采矿机
      miningOptions: [
        {
          key: '0',
          name: '采矿机',
        },
        {
          key: '1',
          name: '大型采矿机',
        },
      ],
      defaultSmelting: '0', // 默认冶炼设备 电弧熔炉
      miningSmeltingOptions: [
        {
          key: '0',
          name: '电弧熔炉',
        },
        {
          key: '1',
          name: '位面熔炉',
        },
      ],
      defaultProduction: '0', // 默认制造台 制作台1
      miningProductionOptions: [
        {
          key: '0',
          name: '制造台 MK.Ⅰ',
        },
        {
          key: '1',
          name: '制造台 MK.Ⅱ',
        },
        {
          key: '2',
          name: '制造台 MK.Ⅲ',
        },
      ],
      defaultChemical: '0', // 默认化工厂 化工厂
      miningChemicalOptions: [
        {
          key: '0',
          name: '化工厂',
        },
        {
          key: '1',
          name: '量子化工厂',
        },
      ],
      defaultCharge: '0', // 默认充电设备
      miningChargeOptions: [
        {
          key: '0',
          name: '能量枢纽',
        },
        {
          key: '1',
          name: '蓄电器',
        },
      ],
      defaultSpraying: '0', // 默认喷涂点数
      miningSprayingOptions: [
        {
          key: '1',
          name: 'accelerator_1',
          label: '增产剂MK.Ⅰ',
        },
        {
          key: '2',
          name: 'accelerator_2',
          label: '增产剂MK.Ⅱ',
        },
        {
          key: '4',
          name: 'accelerator_3',
          label: '增产剂MK.Ⅲ',
        },
      ],
      defaultInc: '0', // 默认增产模式 0 不适用增产剂 1 使用增产， 2 使用加速
      miningIncOptions: [
        [
          {
            key: '0',
            name: '该产物不支持使用增产剂',
          },
        ],
        [
          {
            key: '0',
            name: '不使用',
          },
          {
            key: '1',
            name: '增产模式',
          },
        ],
        [
          {
            key: '0',
            name: '不使用',
          },
          {
            key: '2',
            name: '加速模式',
          },
        ],
        [
          {
            key: '1',
            name: '增产模式',
          },
          {
            key: '2',
            name: '加速模式',
          },
        ],
        [
          {
            key: '0',
            name: '不使用',
          },
          {
            key: '4',
            name: '接收站透镜喷涂',
          },
        ],
      ],
      IncOptions: [
        {
          key: '1',
          name: '增产模式',
        },
        {
          key: '2',
          name: '加速模式',
        },
      ],
    };
  },
  // 等同于vuex的getter
  getters: {},
  // pinia 放弃了 mutations 只使用 actions
  actions: {
    changeConfig() {
      console.error('      this.isChange', this.isChange);

      this.isChange = !this.isChange;
    },
    restoreMinings() {
      // 恢复默认设置参数
      this.scienceResearchSpeed = 1;
      this.miniCore = 8;
      this.largeCore = 16;
      this.largeCoreWorkingSpeed = 3;
      this.oilWellSpeed = 3;
      this.hydrogenCollectionRate = 3;
      this.heavyHydrogenCollectionRate = 0.2;
      this.combustibleIceCollectionRate = 0.5;
      this.shooter = 1;
      this.fractionatingColumnSpeed = 60;
    },
    restoreFactory() {
      //恢复默认工厂配置参数
      this.defaultMining = '0';
      this.defaultSmelting = '0';
      this.defaultProduction = '0';
      this.defaultChemical = '0';
      this.defaultCharge = '0';
      this.defaultSpraying = '0';
      this.defaultInc = '0';
      this.energy_contain_miner = 0;
    },
    change_energy_contain_miner() {
      this.changeConfig();
      this.energy_contain_miner = this.energy_contain_miner ? 0 : 1;
    },
  },
});

export default config;
