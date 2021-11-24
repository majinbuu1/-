//  引用 发送的异步请求
import {
  request
} from "../../request/index";

//Page Object
Page({
  data: {
    // 轮播图数组
    swiperList: [],
    // 导航栏数组
    catesList: [],
    // 楼层数组
    floorList: []
  },
  //options(Object)
  onLoad: function (options) {

    this.getSwiperList();
    this.getCatesList();
    this.getFloorList();
  },

  //  获取轮播图数据
  async getSwiperList() {
    const res=await request({url:"/home/swiperdata"});
        this.setData({
          swiperList: res.data.message
        })
  },
  // 获取导航数组
  async getCatesList() {
    const res=await request({url:"/home/catitems"});
    this.setData({
      catesList: res.data.message
    })

  },
  // 获取楼层数据
  async getFloorList() {
    const res=await request({url:"/home/floordata"});
    this.setData({
      floorList: res.data.message
    })
  }
})