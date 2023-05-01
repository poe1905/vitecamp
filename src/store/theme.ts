import { defineStore } from 'pinia';

const theme = defineStore({
  // 这里的id必须为唯一ID
  id: 'theme',
  persist: true,
  state: () => {
    return {
      //左侧侧边栏是否是精简模式
      compact: false,
      constsooe: 0,
    };
  },
  // 等同于vuex的getter
  getters: {},
  // pinia 放弃了 mutations 只使用 actions
  actions: {
    changeCompact() {
      this.compact = !this.compact;
    },
    // actions可以用async做成异步形式
    setConstsooe(type: string) {
      this.constsooe += 1;
    },
  },
});

export default theme;
