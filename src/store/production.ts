import { defineStore } from 'pinia';

const production = defineStore({
  // 这里的id必须为唯一ID
  id: 'production',
  persist: true,
  state: () => {
    return {};
  },
  // 等同于vuex的getter
  getters: {},
  // pinia 放弃了 mutations 只使用 actions
  actions: {},
});

export default production;
