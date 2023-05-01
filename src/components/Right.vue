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

    <div class="container-right">
      <div class="add-items">
        选择目标物
        <ElButton @click="openSelect"> 添加一个新产物</ElButton>
        <div v-show="productList" class=" ">
          <div class="product flex items-center" v-for="product in productList">
            <el-button type="primary" :icon="Delete" @click="delProduct(product.key)" />
            <ProductImg :key="product.key" :imgKey="product.key" />
            <el-input-number v-model="product.num" controls-position="right" class="mx-4 h-8" />
            / 分钟
          </div>
        </div>
      </div>
      <DSPElDialog :visible="dialogFormVisible" :clone="cloneProduct" :clickSelect="selectProduct"></DSPElDialog>
      <div class="lists">主要列表内容</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isDark, toggleDark } from '@/utils/dark';
import { Delete } from '@element-plus/icons-vue';
import useCounterStore from '@/store/theme';
const theme = useCounterStore();
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
  console.log('name', name.value);
  productList.value.push(selectItem);
  dialogFormVisible.value = false;
};
const cloneProduct = (type) => {
  dialogFormVisible.value = false;
};

const productList = ref([]);
//点击删除产物
const delProduct = (key) => {
  console.log('11111', key);
  productList.value = productList.value.filter((item, index) => {
    return item.key !== key;
  });
};
</script>

<style lang="scss">
.top {
  height: 45px;
  background-color: #1111;
}
.container-right {
  background-color: #a7a4a4;
}
.lists {
  background-color: #a1c7bf;
  /* height: calc(100vh - 205px); */
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
</style>
