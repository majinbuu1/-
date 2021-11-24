/* 
1  页面加载
  1  从缓存中筛选商品  渲染到页面  
      这些数据  checked=true
2  微信支付 
  1  哪些人 哪些账号 可以实现微信支付
  2  企业账号的小程序后台中 必须 给开发者添加白名单
    1  一个appid  可以同时 绑定多个开发者
    2  这些开发者就可以公用这个appid  和  他的开发权限
3  支付按钮
  1  判断缓存中有咩有token
  2  没有  跳转到授权页面  进行获取token  
  3  创建订单  获取订单编号
  4  完成微信支付
  5  手动删除缓存中  已经被选中的商品
  6  删除后的购物车数据  填充回缓存
  7  再跳转页面
*/
import {
  chooseAddress,
  showModal,
  showToast,
  requestPayment
} from '../../utils/asyncWx'
import { request } from '../../request/index.js';
Page({
  data: {
    address: {},
    cart: [],
    totalPrice: 0,
    totalNum: 0
  },
    onShow() {
    // 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");
    // 获取缓存中的购物车数据
    let cart = wx.getStorageSync('cart') || [];
    // 过滤购物车数组
    cart=cart.filter(v=>v.checked);
    this.setData({address});

    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(v => {
      if (v.checked) {
        totalPrice += v.num * v.data.message.goods_price;
        totalNum += v.num;
      }
    })
    this.setData({
      cart,
      totalPrice,
      totalNum,
      address
    });
    
  },

  // 点击  支付
  async handleOrderPay(){
    try {
          // 判断缓存中有没有token
    const token=wx.getStorageSync("token");
    // 判断
    if(!token){
      wx.navigateTo({
        url: '../auth/index',
      });
      return;
    }
    // 创建订单 
    // 准备 请求头参数
    const header={Authorization:token};
    // 准备 请求体参数
    const order_price=this.data.totalPrice;
    const consignee_addr=this.data.address.all;
    const cart = this.data.cart;
    let goods=[];
    cart.forEach(v=>goods.push({
      goods_id:v.goods_id,
      goods_number:v.num,
      goods_price:v.goods_price
    }))
    const orderParams={order_price,consignee_addr,goods}
    // 准备发送请求  创建订单  获取订单编号
    const {order_number} =await request({url:"/my/orders/create",methods:"POST",data:orderParams,header});
    // 发起预支付接口
    const {pay} =await request({url:"/my/orders/req_unifiedorder",methods:"POST",header,data:{order_number}});
    // 发起微信支付
    await requestPayment(pay);
    // 查询后台 订单状态
    const res = await request({url:"/my/orders/chkOrder",header,method:"POST",data:{order_number}});
    await showToast({title:"支付成功"});
    // 支付成功后 跳转到订单页面
    wx.navigateTo({
      url: '../order/index', });
    //  手动删除选中的商品
    let newCart = wx.getStorageSync('cart')
    newCart=newCart.filter(v=>!v.checked)
    wx.setStorageSync('cart', newCart)
    } catch (error) {
    await showToast({title:"支付失败"});
    console.log(error);
    }
  }
})