import { request } from "../../request/index";
Page({

  data: {
    // 左边数据
    leftMenuList: [],
    // 右边内容
    rightContent: [],
    currentIndex: 0,
    // 右侧内容切换自动置顶显示
    scroolTop:0
  },
  // 接口数据存放
  Cates: [],

  onLoad: function (options) {
    /* 
        1 先判断本地存储中是否有数据
            ｛time:Data.now(,data:[...]｝
        2 没有就发送请求获取数据
        3 有旧的数据   同时   旧的数据也没有过期   就使用   本地旧数据
    */
    // 获取本地数据
    const Cates = wx.getStorageSync("cates");
    // 判断
    if (!Cates) {
      // 不存在  发送请求
      this.getCates();
     } else {
      // 有旧的数据  定义过期时间  
      if (Date.now() - Cates.time > 1000 * 10) {
        // 重新发送请求
        this.getCates();
      } else {
        // 可以使用旧数据
        this.Cates = Cates.data;
        let leftMenuList = this.Cates.map(v => v.cat_name);
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  },
  async getCates() {
     const result=await request({url:"/categories"});
          this.Cates = result.data.message;
        // 缓存接口数据到本地
        wx.setStorageSync('cates', {
          time: Date.now(),
          data: this.Cates
        });

        // 拆分上面接口数据，构造成左右两部分
        // 左边菜单数据
        let leftMenuList = this.Cates.map(v => v.cat_name);
        // 右边内容栏
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightContent
        })
  },
  // 左侧标签添加点击事件 
  handlerItemTap(e) {
    /* 
      1  获取点击事件的索引
      2  给data中的currentIndex赋值
    */
    const { index } = e.currentTarget.dataset;
    let rightContent = this.Cates[index].children;
    this.setData({
      currentIndex: index,
      rightContent,
      // 重新设置scrollview距离顶部的高度
      scroolTop:0
    })
  }
})