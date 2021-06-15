// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import config from './config'
import MyComponent from './components/MyComponent'
import './http';
import 'vuetify/dist/vuetify.min.css'
import qs from 'qs'
import 'element-ui/lib/theme-chalk/index.css';
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
import './assets/material.css'
import AsyncComputed from "vue-async-computed";
import _ from "lodash"
import VueSession from "vue-session"
Vue.use(Vuetify, { theme: config.theme })
Vue.use(MyComponent)
Vue.use(AsyncComputed)
Vue.prototype._ = _
Vue.prototype.$qs = qs;
Vue.use(VueSession);
Vue.config.productionTip = false
Date.prototype.format = function (format) {
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(), //day
    "h+": this.getHours(), //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
    "S": this.getMilliseconds() //millisecond
  }
  if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
    (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o) if (new RegExp("(" + k + ")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length == 1 ? o[k] :
        ("00" + o[k]).substr(("" + o[k]).length));
  return format;
}
let myIsEmpty = (obj) => {
  return !obj || obj == "";
}



/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  vuetify: new Vuetify({ theme: config.theme }),
  components: { App, MyComponent },
  template: '<App/>'
})
