import Vue from 'vue'
import './core/regModule';
import config from '../public/static/config.json';

// import "@/plugins/antd"

config && config.module.forEach(item => {
  const _cp = () => import(/* webpackChunkName: "[request]" */ `./components/${item.className}.vue`)
  Vue.component(item.className+"@"+config.className+"-" +config.version, _cp)
})

Vue.config.productionTip = false
Vue.config.devtools = true