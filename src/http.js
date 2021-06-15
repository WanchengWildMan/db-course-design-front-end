import Vue from 'vue'
import axios from 'axios'
import config from './config'

axios.defaults.baseURL = config.api; // 设置axios的基础请求路径
axios.defaults.timeout = 30000; // 设置axios的请求时间
axios.defaults.withCredentials = false
// axios.interceptors.request.use(function (config) {
//   // console.log(config);
//   return config;
// })

axios.loadData = async function (url) {
  const resp = await axios.get(url);
  return resp.data;
}
axios.hasError = (res) => {
  console.log(res, "hasErrorRes"); console.log(res.data.errors == [])
  if (res.data.code && res.data.code == false) return true;

  if (!res.data.errors) return false;
  if (res.data.errors.length == 0) return false;
  console.log("true!!!")
  return true;

}
axios.getOneError = (res) => {
  if (res.data.code == false) {
    return res.data.msg;
  } else {
    //优先判断！！
    if (res.data.errors instanceof Array) return res.data.errors[0];
    else if (res.data.errors instanceof Object) return res.data.errors;

    else return res.data.errors;
  }
}
axios.validateRole=(roleRequired, roleHas)=>{
  if (roleHas instanceof String) roleHas = Number.parseInt(roleHas);
  return roleHas >= roleRequired;
}

Vue.prototype.$http = axios;// 将axios添加到 Vue的原型，这样一切vue实例都可以使用该对象

