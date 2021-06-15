<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap>
      <v-flex xs10 md6>
        <v-card>
          <v-card-text class="px2">
            <div ref="sale" style="width: 100%; height: 350px"></div>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs10 md6>
        <v-card>
          <v-card-text class="px2">
            <div ref="pie" style="width: 100%; height: 350px"></div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
// 引入 ECharts 主模块
var echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/bar");
require("echarts/lib/chart/pie");

export default {
  name: "Dashboard",
  data() {
    return {
      saleOption: {
        title: {
          text: "销售统计",
        },
        tooltip: {},
        legend: {
          data: ["销量", "销售额"],
        },
        xAxis: {
          data: [],
        },
        yAxis: [
          {
            type: "value",
            name: "销量",
            show: true,
            splitLine: { show: false },
            axisLine: {
              lineStyle: {
                color: "#5e859e",
                width: 2,
              },
            },
          },
          {
            type: "value",
            name: "销售额",
            min: 0,
            max: 1000,
            interval: 100,
            splitLine: { show: false },
            axisLabel: {
              formatter: "{value} ",
            },
            axisLine: {
              lineStyle: {
                color: "#5e859e", //纵坐标轴和字体颜色
                width: 2,
              },
            },
          },
        ],
        series: [
          {
            name: "销量",
            type: "bar",
            data: [],
          },
          {
            name: "销售额",
            type: "bar",

				yAxisIndex:1,
            data: [],
          },
        ],
      },
      pieOption: {
        roseType: "angle",
        title: {
          text: "访问来源",
        },
        series: [
          {
            name: "访问来源",
            type: "pie",
            radius: "55%",
            data: [
              { value: 235, name: "视频广告" },
              { value: 274, name: "联盟广告" },
              { value: 310, name: "邮件营销" },
              { value: 335, name: "直接访问" },
              { value: 400, name: "搜索引擎" },
            ],
          },
        ],
        itemStyle: {
          emphasis: {
            // 阴影的大小
            shadowBlur: 200,
            // 阴影水平方向上的偏移
            shadowOffsetX: 0,
            // 阴影垂直方向上的偏移
            shadowOffsetY: 0,
            // 阴影颜色
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    };
  },

  mounted() {
    let self = this;
    this.$http
      .request({
        method: "get",
        url: "/bill/findBillGroupByCategory",
        params: {},
      })
      .then((res) => {
        console.log(res.data.result.map((el) => el.categoryName));
        (self.saleOption.xAxis.data = res.data.result.map(
          (el) => el.categoryName
        )),
          (self.saleOption.series[0].data = res.data.result.map(
            (el) => el.num
          )),
          (self.saleOption.series[1].data = res.data.result.map(
            (el) => el.money
          ));
        self.pieOption.series[0].data = res.data.result.map((el) => {
          return { name: el.categoryName, value: el.money };
        });
        this.$nextTick(() => {
          var sale = echarts.init(this.$refs.sale);

          // 指定图表的配置项和数据
          //用刚指定的配置项和数据显示图表。
          sale.setOption(self.saleOption);

          const pie = echarts.init(self.$refs.pie);

          pie.setOption(self.pieOption);
        });
      });
  },
  computed: {},
};
</script>

<style scoped>
</style>
