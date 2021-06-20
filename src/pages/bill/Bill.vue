<template>
  <v-data-table
    :headers="headers"
    :search="search"
    :items="displayTableData"
    :show-select="selectEnabled"
    :sort-by="dateCol ? dateCol : headers[0].value"
    show-group-by
    color="#4FC3F7"
    class="elevation-1"
    ref="table"
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
              v-if="!isreadonly && actions.includes('addInto')"
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
                  <v-col
                    :cols="col.cols ? col.cols : 6"
                    v-for="(col, i) in fields"
                    v-if="
                      col.readonly != true &&
                      col.autoAdd != true &&
                      !col.value.includes('.')
                    "
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
                      :label="col.text"
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
                      :label="col.text"
                    ></v-select>
                  </v-col>
                  <!-- <v-col>
                    <v-text-field
                      v-model="
                     
                      "
                      :label="col.text"
                      :counter-value="col.length"
                      :rules="col.rules"
                    >
                    </v-text-field
                  ></v-col> -->
                </v-row>
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
        v-if="actions.includes('remove') != undefined"
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
    <template v-slot:footer style="display: flex">
      <v-toolbar>
        <my-date-picker
          menu-ref-name="datePickerMenu"
          ref="datePicker"
          v-if="dateCol.length > 0"
        >
        </my-date-picker>
        <v-card
          color="green"
          min-height="30px"
          min-width="120px"
          style="
            margin: 5px;
            padding: 5px;
            text-align: center;
            line-height: 30px;
          "
        >
          总金额：{{ sumTotalMoney }}元
        </v-card>

        <v-card
          color="blue"
          min-height="30px"
          min-width="120px"
          style="
            margin: 5px;
            padding: 5px;
            text-align: center;
            line-height: 30px;
          "
        >
          总数量{{ sumTotalNum }}
        </v-card>
      </v-toolbar>
    </template>
  </v-data-table>
</template>


<script>
import MyDatePicker from "@/components/MyDatePicker";

export default {
  name: "Bill",
  components: { MyDatePicker },
  props: {
    dataURL: String,
    showSelect: Object,
    readonly: Boolean,
  },
  data: () => ({
    title: "收银单管理",
    dialog: false,
    dialogDelete: false,
    search: "",
    key1: "billId", //!!!
    key2: "commodityId",
    actions: ["addInto", "remove", "edit"],
    filterBy: 0,
    dateColArr: [],
    isreadonly: false,
    selectEnabled: false,
    editedIndex: -1,

    editedItemPrefix: "editedItem.",
    tableData: [],
    editedItem: {
      billId: undefined,
      commodityId: undefined,
    },
    headers: [],
    defaultItem: {
      //必须undefined
      billId: undefined,
    },
    fields: [
      //!!!
      //只允许修改外键而非对象，对象必须后端清空
      {
        text: "收银单编号",
        value: "billId",
        groupable: true,
      },
      {
        text: "收银员",
        value: "employee.name",
        readonly: true,
      },
      {
        text: "收银员编号",
        value: "billUser.employeeId",
        cols: 12,
      },
      {
        text: "顾客编号或姓名",
        value: "billUser.customerId",
        groupable: true,

      },
      {
        text: "商品名称",
        value: "commodity.name",
        readonly: true,
      },
      {
        text: "商品编号",
        value: "commodityId",
        groupable: true,

        cols: 12,
      },
      {
        text: "商品条形码",
        value: "commodity.barcode",
        readonly: true,
        groupable: true,

      },
      {
        text: "商品数量",
        value: "commodityNum",
      },
      {
        text: "商品类别",
        value: "category.name",
        readonly: true,
        groupable: true,
      },
      {
        text: "总金额",
        value: "totalMoney",
      },
      {
        text: "收银时间",
        value: "createDate",
        readonly: true,
      },
    ],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "新建条目" : "编辑条目";
    },
    dateCol() {
      if (this.dateColArr.length == 0) return "";
      return this.dateColArr[this.filterBy];
    },
    sumTotalMoney() {
      let ans = 0;
      for (let row of this.$refs.table.selectableItems) {
        ans += row["totalMoney"];
      }
      return ans;
    },
    sumTotalNum() {
      let ans = 0;
      for (let row of this.$refs.table.selectableItems) {
        ans += row["commodityNum"];
      }
      return ans;
    },
    tableDataFiltered() {
      console.log(this.tableData, "preFilter");
      let self = this;
      let dateRangeFilter = (el) => {
        try {
          let dateRange = self.$refs.datePicker.dateRange;
          let d = new Date(el[this.dateCol]);
          //!!!
          if (!dateRange || dateRange.length < 2) dateRange = [0, Date.now()];
          // console.log(dateRange, el[this.dateCol])
          if (dateRange[0] <= d && d <= dateRange[1]) {
            return true;
          }
          return false;
        } catch (e) {
          console.log(e);
          return true;
        }
      };
      return this.tableData.filter(dateRangeFilter).map((el) => {
        // console.log(el[this.dateCol])

        // console.log(new Date(el[this.dateCol]).toLocaleDateString());
        el[this.dateCol] = new Date(el[this.dateCol]).format(
          "yyyy/MM/dd hh:mm:ss"
        );
        // console.log(el[this.dateCol])
        return el;
      });
    },
    displayTableData() {
      console.log(this.tableDataFiltered, "tableDataFiltered");
      return this.tableDataFiltered.map((e, i) => {
        let el = {};
        console.log(el, e);
        Object.assign(el, {});
        Object.assign(el, e);
        for (let h of this.fields) {
          if (h.displayVal) {
            let path = h.value;

            // let o=path.split(".");
            // let l=o.length;
            // let obj=o.splice(l-1,1);
            // console.log(el,path)
            //TODO lodash的原理
            let originVal = _.get(e, path); ///？？？？
            // let originVal = _.get(this.tableDataFiltered[i].path)
            console.log(path, originVal, "origin");
            // console.log(eval(path),h.displayVal[originVal])
            let mappedVal = h.displayVal[originVal];
            console.log(mappedVal);
            // Object.assign(eval(path), mappedVal);
            if (mappedVal) _.set(el, path, mappedVal);
          }
          // el.Status=el.Status=1?"正常":"删除"
        }
        return el;
      });
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    searchCriteria(val) {
      if (!val) return;
      for (let field of this.fields) {
        if (field.fil) this.tableDataFiltered = this.tableData.filter();
      }
    },
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
    this.key1 = this.key1 ? this.key1 : "id";
    if (this.readonly) this.isreadonly = true;
  },
  mounted() {
    this.mountSelectItems();
  },
  methods: {
    hasError(res) {
      return res.data.errors && res.data.errors.length > 0;
    },

    initialize() {
      this.headers = [];
      Object.assign(this.headers, this.fields);
      let self = this;
      //单组件权限------------------
      for (let i in this.actions) {
        let a = this.actions[i];
        this.$http
          .request({
            method: "get",
            url: "/user/role/findRoleByPage",
            params: {
              // findInfo: `where roleId=${sessionStorage.roleId} AND ${a}=1`,
              findInfo: `where roleId=${JSON.parse(sessionStorage.getItem('user')).roleId} AND ${a}=1`,

            },
          })
          .then((res) => {
            if (this.$http.hasError(res)) {
              this.$message.error(this.$http.getOneError(res).message);
            } else if (res.data.result.length == 0) {
              self.actions.splice(i);
            }
          });
      }
      if (this.actions != null || this.actions.length > 0) {
        this.headers.push({
          text: "操作",
          value: "actions",
          sortable: false,
          align: "start",
        });
      }
      console.log(this.actions);
      this.editedItem = Object.assign({}, this.defaultItem);

      this.$http
        .request({
          method: "GET",
          url: "/bill/findBillByPage",
          params: { notGroup: true },
        })
        .then(async (res) => {
          if (this.$http.hasError(res)) {
            this.$message.error("数据获取失败！请检查网络状态！");
            return; //!!!
          }
          self.tableData = res.data.result;
          for (let i in self.tableData) {
            for (let j in self.tableData[i].commodityInfos) {
              let commodityId = self.tableData[i].commodityInfos[j].commodityId;
            }
          }
        })
        .catch((e) => {
          console.log(e);
          this.$message.error("数据获取失败！请检查网络状态！");
        });
    },
    mountSelectItems() {
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
      // console.log(this.fields)
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
        Object.assign({}, this.tableData[this.editedIndex])
      );
      this.tableData.splice(this.editedIndex, 1);
      this.closeDelete();
    },
    afterDeleteItemConfirm(item) {
      console.log(item);
      this.$http
        .request({
          method: "delete",
          url: "/bill/deleteBillByBillId",
          params: { billId: item.billId, commodityId: item.commodityId },
        })
        .then((res) => {
          if (this.$http.hasError(res)) {
            this.$message.error("删除失败！该收银单不存在或无法删除！");
          } else {
            this.$message.success("删除成功！");
          }
        });
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

    save(isAdd) {
      console.log("editedItem", this.editedItem.commodityId);
      console.log(this);
      // this.$emit("itemSaved", this.editedItem)
      //!!!!!!!!!!!!!!!!!!!!防止浅复制！！！
      this.saveItem(Object.assign({}, this.editedItem));
      if (this.editedIndex > -1) {
        Object.assign(this.tableData[this.editedIndex], this.editedItem);
      } else {
        this.editedItem[this.key1] = undefined;
        if (this.key2) this.editedItem[this.key2] = undefined;
        console.log(this.editedItem);
        this.$nextTick(() => {
          if (this.editedItem != undefined) {
            this.tableData.push(this.editedItem);
          }
        });
      }
      this.close();
    },
    async saveItem(item) {
      console.log("item!!!!!!!!", item);
      try {
        let res = await this.$http.post("/bill/saveOneBillInfo", {
          billInfo: item,
        }); //!!!
        console.log(res);
        console.log(this.$http.hasError(res));
        if (this.$http.hasError(res)) {
          let msg = this.$http.getOneError(res).message;
          if (msg.includes("Duplicate")) {
            msg = msg.split(" ")[3] + "重复！";
          }
          throw new Error("收银单" + msg + "收银单保存失败！");
        } else {
          if (!item.billId) {
            item.billId = res.data.result.billId;
            this.$message.success("收银单添加成功！");
          } else {
            this.$message.success("收银单保存成功！");
            this.initialize();
          }
        }
      } catch (e) {
        console.log(e);
        let msg = e.message;
        if (msg.includes("undefined") || msg.includes("null")) {
          msg = "信息填写不完整！";
        }
        this.$message.error(msg + "请检查输入！");
      }
    },
    pak(path) {
      return "editedItem." + path;
    },
  },
};
</script>
