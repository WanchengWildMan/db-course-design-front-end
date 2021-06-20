<template>
  <v-container>
    <v-data-table
      ref="myTable"
      :headers="headers"
      :search="search"
      :items="tableData"
      :sort-by="dateCol ? dateCol : fields[0].value"
      show-group-by
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="搜索"
            single-line
            hide-details
          ></v-text-field>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-if="!isreadonly"
                color="primary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                添加
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col :cols="6">
                      <v-text-field
                        v-model="editedItem['barcode']"
                        label="商品条形码"
                        counter="13"
                        :rules="[
                          (v) => !!v || '必须填写商品条形码!',
                          (v) => (v && v.length === 13) || '长度必须为13！',
                          (v) =>
                            (v && v.length === 13 && /^6[0-9]{12}$/.test(v)) ||
                            '格式错误',
                        ]"
                      >
                      </v-text-field>
                      <v-text-field
                        v-model="editedItem['name']"
                        label="商品名称"
                        readonly
                      >
                        {{ !editedItem.name ? "" : editedItem.name }}
                      </v-text-field>
                      <v-text-field
                        v-model="editedItem['commodityId']"
                        label="商品编号"
                        readonly
                      >
                        {{ editedItem.commodityId }}
                      </v-text-field>
                      <v-text-field
                        v-model="editedItem['discountRate']"
                        label="折扣率"
                        readonly
                      >
                        {{ editedItem.discountRate }}
                      </v-text-field>
                      <v-text-field
                        v-model="editedItem['costPrice']"
                        label="单价"
                        readonly
                      >
                        {{ editedItem.costPrice }}
                      </v-text-field>
                      <v-text-field
                        v-model="editedItem.commodityNum"
                        label="数量"
                        :rules="[
                          (v) =>
                            !v || Number.parseFloat(v) != NaN || '数量不合法！',
                        ]"
                      >
                        <!-- {{ inputCommodityNum + editeditem.unit.unitName }} -->
                      </v-text-field>
                      <v-text-field
                        v-model="editedItem.totalMoney"
                        label="商品总价/元"
                        readonly
                      >
                      </v-text-field>
                      <v-text-field
                        v-model="editedItem.category.name"
                        label="种类"
                        readonly
                      >
                      </v-text-field>

                      <v-text-field
                        v-model="editedItem.format"
                        label="规格型号"
                        readonly
                      >
                      </v-text-field>
                      <v-text-field
                        v-model="editedItem.inventoryInfo.inventoryNum"
                        label="库存量"
                        readonly
                      >
                      </v-text-field>
                      <v-text-field
                        v-model="editedItem.remark"
                        label="备注"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <!-- <v-row>
                    <v-col
                      :cols="col.cols ? col.cols : 6"
                      v-for="(col, i) in fields"
                      v-if="col.readonly != true && col.autoAdd != true"
                      v-bind:key="col.value"
                    >
                      <v-text-field
                        v-if="!col.select"
                        v-model="
                          col.value.includes('.')
                            ? editedItem[col.value.split('.')[0]][
                                col.value.split('.')[1]
                              ]
                            : editedItem[col.value]
                        "
                        :label="`${col.text}(${col.value})`"
                        :counter-value="col.length"
                        :rules="col.rules"
                      >
                      </v-text-field>
                      <v-select
                        v-else
                        v-model="editedItem[col.selectItemValue]"
                        :items="col.selectItems"
                        :item-text="
                          col.selectItemLabel ? col.selectItemLabel : 'name'
                        "
                        :item-value="
                          col.selectItemValue ? col.selectItemValue : 'id'
                        "
                        :label="`${col.text}(${col.value})`"
                      ></v-select>
                    </v-col>
                  </v-row> -->
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close"> 取消 </v-btn>
                <v-btn color="blue darken-1" text @click="save"> 保存 </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">确认删除？</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >取消</v-btn
                >
                <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                  >确认</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template
        v-if="selectEnabled"
        v-slot:header.data-table-select="{ on, props }"
      >
        <v-simple-checkbox
          color="purple"
          v-bind="props"
          v-on="on"
        ></v-simple-checkbox>
      </template>
      <template v-slot=""></template>
      <template v-slot:item.Status="{ item }">
        <v-chip
          :color="
            getStatusColor(
              item.inventoryInfo.inventoryNum,
              item.inventoryInfo.quantityLowerLimit,
              item.inventoryInfo.quantityUpperLimit,
              item.Status
            )
          "
        >
          {{
            getStatusName(
              item.inventoryInfo.inventoryNum,
              item.inventoryInfo.quantityLowerLimit,
              item.inventoryInfo.quantityUpperLimit,
              item.Status
            )
          }}
        </v-chip>
      </template>
      <template v-if="actions" v-slot:[`item.actions`]="{ item }">
        <v-icon
          v-if="actions.includes('edit')"
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          v-if="actions.includes('remove')"
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        没有数据
        <v-btn color="primary" @click="initialize()"> 刷新 </v-btn>
      </template>
      <template v-slot:footer>
        <v-card>
          <v-card-title>收银</v-card-title>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  outlined
                  label="应付金额"
                  v-model="sumTotalMoney"
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>

            <v-col>
              <v-text-field
                outlined
                label="实付金额"
                v-model="actualPaid"
              ></v-text-field>
            </v-col>
            <v-text-field
              outlined
              label="找零"
              disabled
              v-model="returnPrice"
            ></v-text-field>
            <v-text-field
              outlined
              label="顾客姓名或ID"
              v-model="customerId"
            ></v-text-field>
          </v-container>
          <v-btn fab absolute bottom right color="pink" @click="submitBills">
            GO
          </v-btn>
        </v-card>
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
import MyDataTable from "@/components/DataTable.vue";
import MyDatePicker from "@/components/MyDatePicker";

export default {
  name: "Cashier",
  components: { MyDatePicker },
  data: () => ({
    title: "收银台",
    dialog: false,
    dialogDelete: false,
    showDeleted: 0,
    totalDiscount: 1,
    customerId: "",
    selectEnabled: false,
    showAll: true,
    key1: "commodityId",
    isreadonly: false,
    search: "",
    inputCommodityNum: 0,
    actions: ["addInto", "remove", "edit"],
    filterBy: 0,
    dateColArr: [],
    headers: [], //!!!
    fields: [
      {
        text: "商品条形码",
        align: "start",
        value: "barcode",
        cols: 6,
        rules: [
          (v) => !!v || "必须填写商品条形码!",
          (v) => (v && v.length === 13) || "长度必须为13！",
          (v) => (v && v.length === 13 && /^6[0-9]{12}$/.test(v)) || "格式错误",
        ],
      },
      {
        text: "商品名称",
      },
      {
        text: "商品编号",
        value: "commodityId",
        ajax: true,
      },
      {
        text: "商品种类",
        value: "category.name",
        ajax: true,
      },
      { text: "规格型号", value: "format", cols: 3, ajax: true },
      {
        text: "商品数量",
        value: "commodityNum",
        ajax: true,
        rules: [
          (v) =>
            !v || Number.parseFloat(v) != undefined || "折扣率必须小于等于1",
        ],
      },
      {
        text: "单位",
        value: "unit.unitName",
        ajax: true,
      },
      { text: "售价", value: "costPrice" },
      {
        text: "折扣率",
        value: "discountRate",
        rules: [(v) => !v || v <= 1.0 || "折扣率必须小于等于1"],
      },
      {
        text: "总金额",
        value: "totalMoney",
      },
      { text: "库存量", value: "inventoryInfo.inventoryNum", ajax: true },
      { text: "备注", value: "remark" },
    ],
    tableData: [],
    editedIndex: -1,
    editedItem: {},
    actualPaid: 0,
    defaultItem: {
      //必须undefined
      commodityId: undefined,
      name: "",
      barcode: "",
      category: { name: "" },
      format: "",
      unit: { unitName: "" },
      costPrice: 0,
      discountRate: 1,
      inventoryInfo: {
        quantityUpperLimit: null,
        quantityLowerLimit: 0,
      },
      provide: { name: "" },
      Status: 1,
      createDate: new Date(),
      updateDate: new Date(),
      remark: "",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "新商品" : "编辑商品";
    },
    dateCol() {
      if (this.dateColArr.length == 0) return "";
      return this.dateColArr[this.filterBy];
      // return //"createdDate";
    },
    inputCommodityInfo() {
      return {
        barcode: this.editedItem.barcode,
        commodityNum: this.editedItem.commodityNum,
      };
    },
    inputTotalMoney() {
      console.log(
        this.editedItem.commodityNum,
        this.editedItem.costPrice,
        this.editedItem.discountRate,
        Number.parseFloat(this.editedItem.commodityNum),
        Number.parseFloat(this.editedItem.costPrice),
        Number.parseFloat(this.editedItem.discountRate)
      );
      return (
        Number.parseFloat(this.editedItem.commodityNum) *
        Number.parseFloat(this.editedItem.costPrice) *
        Number.parseFloat(this.editedItem.discountRate)
      );
    },
    tableTotalMoney() {
      let ans = 0;
      for (let t of this.tableData) {
        ans += this.tableData.totalMoney;
      }
      return ans;
    },
    sumTotalMoney() {
      let ans = 0;
      console.log(this.$refs.myTable, "tablw");
      // if(!this.$refs.table)return 0;
      for (let row of this.$refs.myTable.selectableItems) {
        console.log(row, "row!!!");
        ans += row["totalMoney"];
      }
      return ans;
    },
    returnPrice() {
      return this.actualPaid - this.sumTotalMoney;
    },
    user() {
      console.log(sessionStorage, "sessionStorage");
      return JSON.parse(sessionStorage.getItem("user"));
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    inputCommodityInfo: {
      handler(val, valOld) {
        console.log(val, valOld);
        if (val.barcode == valOld.barcode) {
          console.log(this.editedItem.totalMoney, this.inputTotalMoney);
          this.editedItem.totalMoney = this.inputTotalMoney;
        } else {
          if (this.commodityId == "") return;
          console.log("input", this.editedItem);
          if (!val.discountRate || val.discountRate == "")
            this.editedItem.discountRate = 1;
          // console.log(this.editedItem);
          console.log({ barcode: this.editedItem.barcode });
          this.$http
            .request({
              method: "get",
              url: "/commodity/findCommodityByPage",
              params: { findInfo: { barcode: this.editedItem.barcode } },
            })
            .then((res) => {
              // console.log(res.data.errors);
              if (this.$http.hasError(res)) {
                this.editedItem.name = "商品不存在！";
                throw new Error("商品不存在！");
              }
              if (res.data.result.length > 0) {
                Object.assign(this.editedItem, res.data.result[0]);
                this.editedItem.totalMoney = this.inputTotalMoney;
                console.log("has");
              } else {
                let inputKeys = ["commodityNum", "barcode"];
                for (let key of Object.keys(this.editedItem)) {
                  if (inputKeys.includes(key)) continue;

                  this.editedItem[key] = this.defaultItem[key];
                }
              }
              return;
            })
            .catch((e) => {
              let msg = e.message;
              this.$message.error(msg);
            });
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.mountSelectItems();
  },
  created() {
    this.initialize();
    for (let i in this.fields) {
      let field = this.fields[i];
      if (!field.groupable) this.fields[i].groupable = false;
      if (
        field.value.toLowerCase().includes("time") ||
        field.value.toLowerCase().includes("date")
      ) {
        this.dateColArr.push(field.value);
      }
    }
  },

  methods: {
    initialize() {
      let self = this;
      this.headers = [];
      Object.assign(this.headers, this.fields);
      if (this.actions != null) {
        this.headers.push({
          text: "操作",
          value: "actions",
          sortable: false,
          align: "start",
        });
      }

      this.editedItem = Object.assign({}, this.defaultItem);
    },
    mountSelectItems() {
      //---
      let self = this;
      for (let i in this.fields) {
        if (this.fields[i].select && !this.fields[i].selectItems) {
          this.$http
            .request({
              url: self.fields[i].selectItemsURL,
              method: "get",
            })
            .then((res) => {
              self.fields[i].selectItems = res.data.result;
            })
            .catch((err) => {
              this.$message.error("选项数据获取失败！");
            });
        }
      }
      console.log(this.fields);
    },
    close() {
      console.log(this.editedItem);
      this.dialog = false;
      this.$nextTick(() => {
        // this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
      // console.log(this.defaultItem)
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    editItem(item) {
      let criteria = {};
      criteria[this.key1] = item[this.key1];
      if (this.key2) criteria[this.key2] = item[this.key2];
      this.editedIndex = this.tableData.findIndex((e) => {
        return (
          e[this.key1] == criteria[this.key1] &&
          (!this.key2 || e[this.key2] == criteria[this.key2])
        );
      });
      this.editedItem = Object.assign({}, this.tableData[this.editedIndex]);
      this.dialog = true;
      console.log("editedItem", this.editedItem);
    },
    deleteItem(item) {
      let criteria = {};
      criteria[this.key1] = item[this.key1];
      if (this.key2) criteria[this.key2] = item[this.key2];
      this.editedIndex = this.tableData.findIndex((e) => {
        return (
          e[this.key1] == criteria[this.key1] &&
          (!this.key2 || e[this.key2] == criteria[this.key2])
        );
      });
      this.editedItem = Object.assign({}, this.tableData[this.editedIndex]);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      // console.log(this.tableData[this.editedIndex],this.editedIndex.toString())
      // this.$emit("itemDeleted", Object.assign({}, this.tableData[this.editedIndex]));
      this.afterDeleteItemConfirm(
        Object.assign({}, this.tableData[this.editedIndex]) //TODO
      );
      this.tableData.splice(this.editedIndex, 1);
      this.closeDelete();
    },
    afterDeleteItemConfirm(item) {
      if (this.editedIndex) this.$message.success("删除成功！");
    },
    save(isAdd) {
      console.log(this.editedItem);
      console.log(this);
      // this.$emit("itemSaved", this.editedItem)
      if (!this.editedItem.commodityId || this.editedItem.commodityId === "") {
        this.$message.error("找不到该商品！");
      } else if (!this.editedItem.commodityNum) {
        this.$message.error("请输入商品数量！");
      } else {
        if (this.editedIndex > -1) {
          this.$set(this.tableData, this.editedIndex, this.editedItem);
        } else {
          console.log(this.editedItem);
          this.$nextTick(() => {
            if (this.editedItem != undefined) {
              //!!!!!
              this.tableData.push(Object.assign({}, this.editedItem));
            }
          });
        }
        this.close();
      }
    },
    async submitBills() {
      console.log("submintBills");
      let billInfos = [];
      let bill = { billInfos: [] };
      if (this.tableData.length == 0) {
        this.$message.error("不能添加空账单！！！");
        return;
      }
      for (let billInfo of this.tableData) {
        billInfo = Object.assign({
          commodityId: billInfo.commodityId,
          commodityNum: billInfo.commodityNum,
          totalMoney: billInfo.totalMoney,
          remark: billInfo.remark,
        });
        bill.billInfos.push(Object.assign({}, billInfo));
      }
      bill.customerId = this.customerId;
      //TODO session!!!

      console.log("user", this.user.employeeId);
      bill.employeeId = this.user.employeeId;
      let res = await this.$http.request({
        method: "post",
        url: "/bill/saveBill",
        data: { bills: [bill] },
      });
      console.log(res);
      try {
        console.log("haserror", this.$http.hasError(res));
        if (this.$http.hasError(res)) {
          let msg = this.$http.getOneError(res).message;
          console.log("error", msg, this.$http.getOneError(res));
          if (msg.includes("Duplicate")) {
            msg = msg.split(" ")[3] + "重复！";
          }
          throw new Error(msg + "收银单保存失败！");
        } else {
          let ok = true;
          for (let i in res.data.result[0]) {
            let resultTemp = res.data.result[0][i];
            if (resultTemp.saveBillInfoResult.affected == 0) {
              this.$message.error(
                `第${i}条收银单${this.tableData[i].name}保存失败！`
              );
              ok = false;
            }
          }
          if (ok) this.$message.success("购买成功！！！");
        }
      } catch (e) {
        let msg = e.message;
        if (msg.includes("undefined") || msg.includes("null")) {
          msg = "信息填写不完整！";
        }
        this.$message.error(msg);
      }
    },
    getStatusColor(nowNum, lowLim, upLim, Status) {
      if (!lowLim) lowLim = 0;
      let upLim0 = upLim;
      if (!upLim) upLim = 10000000;
      if (Status == -1) return "purple";
      if (nowNum < lowLim) return "orange";
      else if (upLim0 && nowNum - lowLim < 0.1 * (upLim - lowLim))
        return "gray";
      //大于90%则接近上限，小于0.1售空
      else if (upLim - nowNum < 0.1 * upLim) return "red";
      else return "green";
    },
    getStatusName(nowNum, lowLim, upLim, Status) {
      if (!lowLim) lowLim = 0;
      let upLim0 = upLim;
      if (!upLim) upLim = 10000000;
      let ans = "";
      console.log(Status);
      if (Status == -1) ans += "已删除,";
      else if (nowNum < lowLim * 1.1) ans += "将要售空,";
      else if (upLim0 && nowNum - lowLim < 0.1 * (upLim - lowLim))
        ans += "缺货,";
      //大于90%则接近上限，小于0.1售空
      else if (upLim - nowNum < 0.1 * upLim) ans += "接近爆仓,";
      else ans += "正常,";
      ans += Status == -1 ? "下架" : "上架";
      return ans;
    },
  },
};
</script>

