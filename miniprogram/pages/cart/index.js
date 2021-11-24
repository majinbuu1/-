/* 
1  获取用户收货地址
2  页面加载完成后  onLoad  onShow
    1  获取本地存储中的地址数据  
    2  把数据 设置给data中的一个变量 
3  onShow 获取缓存
4  全选的实现  数据的展示
    1  onShow  获取缓存中的购物车数组
    2  根据购物车中的商品进行计算  所有商品都被选中 checked=true
5  总价格  总数量
    1  都需要商品被选中  我们才拿他来计算
    2  获取购物车数组
    3  遍历
    4  判断商品是否被选中
    5  总价格 += 商品的单价  *  商品的数量
    6  总数量 += 商品的数量
    7  把计算后的价格和数量  设置回data中即可
6  商品选中
    1  绑定change事件
    2  获取到被修改的商品对象
    3  商品对象的选中状态  取反
    4  重新填充回data中和缓存中
    5  重新计算全选  总价格  总数量
7  全选和反选
    1  全选复选框绑定事件  change
    2  获取data中的全选变量 allChecked
    3  直接取反 
    4  遍历购物车数组  让里面商品选中状态跟随allchecked 
    5  把购物车数组  和  allchecked  重新设置回data  把购物车重新设置回缓存
8  商品数量的编辑
    1  “+” “-” 按钮 绑定同一个点击事件  自定义属性
    2  传递被点击的商品id
    3  直接修改商品对象的数量 num
    4  当购物车数量=0时  跳出弹窗是否删除商品
        1 确定 直接删除
        2 取消 保留
    4  把cart数组  重新设置回  缓存  data  setCart 中 
9  点击结算
    1  判断有没有收货地址
    2  判断有没有商品信息
    3  进入支付页面
*/
import {
  chooseAddress,
  showModal,
  showToast
} from '../../utils/asyncWx'
Page({

  data: {
    address: {},
    cart: [],
    allChecked: false,
    totalPrice: 0,
    totalNum: 0
  },
  onShow() {
    // 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");
    // 获取缓存中的购物车数据
    const cart = wx.getStorageSync('cart') || [];
    this.setData({
      address
    });
    this.setCart(cart);
  },

  //  点击  收货地址
  async handleChooseAddress() {
    try {
      //  调用获取收货地址的api
      let address = await chooseAddress();
      address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;
      // 存入缓存中
      wx.setStorageSync('address', address);
    } catch (error) {
      console.log(error);
    }
  },

  // 商品的选中 
  handleItemChange(e) {
    // 获取修改的商品index
    const index = e.currentTarget.dataset.index;
    // 获取购物车数组
    let {
      cart
    } = this.data;
    // 找到被修改的商品对象
    // let index = cart.findIndex((v)=> v.goods_id === goods_id.id);
    // 选中状态取反
    cart[index].checked = !cart[index].checked;
    // 把购物车数据重新设置回data中
    this.setCart(cart);
  },

  // 设置购物车状态同时  重新计算 底部工具栏数据 
  setCart(cart) {
    // const allChecked = cart.length != 0 ? cart.every(v => v.checked) : false;
    let allChecked=true;
    // 总价格 总数量
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(v => {
      if (v.checked) {
        totalPrice += v.num * v.data.message.goods_price;
        totalNum += v.num;
      }else{
        allChecked=false;
      }
    })
    // 判断购物车是否为空数组
    allChecked = cart.length != 0 ? allChecked : false;
    this.setData({
      cart,
      totalPrice,
      totalNum,
      allChecked
    });
    wx.setStorageSync('cart', cart);
  },

  // 全选 反选
  handleItemCheck() {
    // 获取data数组
    let {
      cart,
      allChecked
    } = this.data;
    // 修改数值
    allChecked = !allChecked;
    // 重新遍历购物车数组  让商品选中状态跟随allchecked
    cart.forEach(v => v.checked = allChecked);
    // 把数组 和 allchecked 重新设置回data 并设置缓存
    this.setCart(cart);
  },

  // 商品数量的编辑功能
  async  handleItemNumEdit(e) {
    const { operation, id } = e.currentTarget.dataset;
    // 获取购物车数组
    let {cart} = this.data;
    // 找到需要修改的商品索引
    const index = cart.findIndex(v => v.goods_id === id.id);
    // 判断是否要执行删除、
    if (cart[index].num === 1 && operation === -1) {
      const res = await showModal({content: "您是否要删除？"})
      if (res.confirm) {
        cart.splice(index, 1);
        this.setCart(cart);
      } 
    } else {
      // 修改数量
      cart[index].num += operation;
      this.setCart(cart);
    }
  },

  // 点击结算
 async handlePay(){
   // 判断收货地址
    const {address,totalNum}=this.data;
    if(!address.userName){
    await showToast({title:"您还没有选择收货地址"})
    return;
    }
    // 判断商品信息
    if(totalNum===0){
    await showToast({title:"您还没有选择商品"})
    return;
    }
    // 跳转支付页面
    wx.navigateTo({
    url: '../pay/index',
    })
  }
})