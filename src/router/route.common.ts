// 不需要鉴权的业务路由
import { RouteRecordRaw } from 'vue-router';

const commonRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: '戴森求计划量化计算器',
      icon: '',
    },
    component: () => import('@/views/home/index.vue'),
  },
];

export default commonRoutes;
