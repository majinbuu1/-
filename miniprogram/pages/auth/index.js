import {
  request
} from "../../request/index";
import {login} from '../../utils/asyncWx.js';


Page({
  // 获取用户信息
  async handlegetUserProfile(e){
    try {
      const {encryptedData,iv,rawData,signature}=e.detail;
      // 获取小程序登录成功后的code
      const {code}=await login();
      const loginParams={encryptedData,iv,rawData,signature,code}
      // 发送请求  获取用户的token
      const {token}=await request({url:"/users/wxlogin",data:loginParams,method:"post"});
      // 把token存入缓存中  同时跳转回上一个页面
      wx.setStorageSync('token',token);
      wx.navigateBack({
        // 1 表示返回上一层
        delta:1  
      });
    } catch (error) {
      console.log(error);
    }
  }
})