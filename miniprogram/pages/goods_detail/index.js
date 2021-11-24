/* 
1  发送请求获取数据
2  点击轮播图  预览大图
    1  给轮播图绑定点击事件
    2  调用小程序api   previewImage
3  点击  加入购物车
    1  先绑定点击事件
    2  获取缓存中的购物车数据  
    3  先判断  是否已经存在于购物车
        1  已经存在  修改商品数据    执行购物车数据++
            重新把购物车数组  填充回缓存中
        2  不存在于购物车的数组中  直接给购物车添加
            一个新元素  新元素带上属性num  再填充回缓存中 
     4  弹出提示    
*/

import {
  request
} from "../../request/index";

Page({
  data: {
    goodsObj: { },
  },
  // 商品预览对象
  GoodsInfo:{ },


  onLoad: function (options) {
    const {goods_id} = options;
    this.getGoodsDetail(goods_id)

  },
  async getGoodsDetail(goods_id) {
    const goodsObj=await request({url:"/goods/detail",data:{goods_id}})
    this.GoodsInfo=goodsObj;
    this.setData({
      goodsObj:{
        goods_price:goodsObj.data.message.goods_price,
        goods_name:goodsObj.data.message.goods_name,
        //  ios部分手机不识别webp图片  临时自己修改   最好的解决方式是通过后台修改
        goods_introduce:goodsObj.data.message.goods_introduce.replace(/\.webp/g,'.jpg'),
        pics:goodsObj.data.message.pics
      }
    })
  },
  // 点击轮播图放大预览
  handlePreviewImage(e) {
    // 先构造要预览的图片数组
    const urls=this.GoodsInfo.pics.map(v=>v.pics_mid)
    wx.previewImage({
      // 接受传递过来的url
      current:urls[index],
      urls: urls,
    })
  },
//   点击加入购物车
handleCart() {
    // 获取缓存中的购物车 数组
    let cart=wx.getStorageSync('cart') || [ ];
    // 判断 商品对象是否存在于购物车数组中
    let index=cart.findIndex(v=>v.data.message.goods_id===this.GoodsInfo.data.message.goods_id);
    if(index===-1){
      // 不存在  第一次添加
      this.GoodsInfo.num=1;
      this.GoodsInfo.checked=true;
      cart.push(this.GoodsInfo);
    }else{
      //  已经存在购物车数据  执行 num++
      cart[index].num++;
    }
      //  把购物车重新添加回缓存中
      wx.setStorageSync('cart', cart);
      //  弹窗提示
      wx.showToast({
        title: '添加成功',
        icon:'success',
        mask:'true'
      })
  }

})