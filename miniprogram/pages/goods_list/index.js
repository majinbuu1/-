/* 
1  用户上滑页面  滚动条触底  开始加载下一页数据
      1  找到滚动条触底事件
            1  获取页面的总页数  （ network中显示总条数）
                          总页数 = Math.ceil (  总条数  /  页容量  ) 
            2  获取当前页数
            3  判断当前页数是否大于总页数
      2  判断还有没有下一页数据
      3   有下一页数据  继续加载
            1  当前的页数++
            2  重新发送请求
            3  数据请求回来  要对data中数组进行拼接  而不是替换！！
      4   没有下一页数据  弹出提示
2   下拉刷新页面
      1  触发下拉刷新事件    （需要在json文件中加入一个配置）
      2  重置  数据  数组
      3  重置页码  设置为1
*/

import {
  request
} from "../../request/index";

Page({
  data: {
    tabs: [{
        id: 0,
        value: "综合",
        isActive: true
      },
      {
        id: 1,
        value: "销量",
        isActive: false
      },
      {
        id: 2,
        value: "价格",
        isActive: false
      }
    ],
    goodsList: []
  },

  // 接口要的参数
  QueryParams: {
    query: "",
    cid: "",
    pagenum: 1,
    pagesize: 10
  },

  // 总页数
  totalPages: 1,

  onLoad: function (options) {
    this.QueryParams.cid = options.cid;
    this.getGoodsList();
  },

  // 获取商品列表数据
  async getGoodsList() {
    const result = await request({ url: "/goods/search",data:this.QueryParams});
    const total = result.data.message.total;
    this.totalPages = Math.ceil(total / this.QueryParams.pagesize);
    this.setData({
      goodsList: [...this.data.goodsList, ...result.data.message.goods]

    })
  },

  // 标题点击事件  从子组件传递过来
  handlerTapsItemChange(e) {
    // 1  获取被点击的索引
    const {
      index
    } = e.detail;
    // 2  修改源数组
    let {
      tabs
    } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    // 3  赋值到data中
    this.setData({
      tabs
    })
  },

  //  上滑页面  滚动条触底事件
  onReachBottom() {
    if (this.QueryParams.pagenum >= this.totalPages) {
      wx.showToast({
        title: '没有下一页数据',
      })
    } else {
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },

  // 下拉刷新函数
  onPullDownRefresh() {
    // 重置数组
    this.setData({
      goodsList: []
    })
    // 重置页码
    this.QueryParams.pagenum = 1;
    // 发送请求
    this.getGoodsList();
  }
})