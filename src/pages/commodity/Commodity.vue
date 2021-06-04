<template>
  <v-card>
    <v-data-table
      :headers="fields"
      :item-key="itemKey"
      :search="search"
      :items="tableDataProcessed"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>{{ TITLE }}</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="搜索"
            single-line
            hide-details
          ></v-text-field>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
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
                    <v-col :cols="col.cols?col.cols:6" v-for="col in fields" v-if="col.readonly!=true"
                           v-bind:key="col.value">
                      <v-text-field
                        v-if="!col.select"
                        v-model="editedItem[col.value]"
                        :label="col.text"
                      ></v-text-field>
                      <v-select v-else :items="col.selectItems"
                                :item-text="col.selectItemLabel?col.selectItemLabel:'name'"
                                :item-value="col.selectItemValue?col.selectItemValue:'id'"></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn
          color="primary"
          @click="initialize"
        >
          Reset
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
export default {
  data: () => ({
    TITLE: '商品管理',
    dialog: false,
    dialogDelete: false,
    itemKey: "commodityId",
    search: "",

    fields: [
      {
        text: '商品条形码',
        align: 'start',
        value: 'barcode',
        autoAdd: true,
        cols: 6
      },
      {text: '商品名称', value: 'name', cols: 6},
      {
        text: '商品种类',
        value: 'category.name',
        cols: 3,
        select: true,
        selectItemsURL: "/commodity/findCategoryByPage",
        selectItemLabel: "name",
        selectItemValue: "categoryId"
      },
      {text: '规格型号', value: 'format', cols: 3},
      {
        text: '单位',
        value: 'unit.unitName',
        select: true,
        selectItemsURL: "/commodity/findUnitByPage",
        selectItemLabel: "unitName",
        selectItemValue: "unitId"
      },
      {text: '售价', value: 'costPrice'},
      {text: '折扣率', value: 'discountRate'},
      {text: '库存下限', value: 'quantityUpperLimit', nullDisplay: "无"},
      {text: '库存上限', value: 'quantityLowerLimit', nullDisplay: "无"},
      {
        text: '供应商',
        value: 'provide.name',
        select: true,
        selectItemsURL: "/provide/findProvideByPage",
        selectItemLabel: "name",
        selectItemValue: "provideId"
      },
      {text: '创建日期', value: 'createDate', autoAdd: true},
      {text: '修改日期', value: 'updateDate', autoAdd: true},
      {text: '备注', value: 'remark'},


    ],
    tableData: [],
    editedIndex: -1,
    editedItem: {},
    defaultItem: {
      commodityId: "",
      name: '',
      barcode: '',
      category: {name: ''},
      format: '',
      unit: {unitName: ''},
      costPrice: 0,
      discountRate: 1,
      quantityUpperLimit: null,
      quantityLowerLimit: 0,
      provide: {name: ''},
      createDate: Date.now(),
      updateDate: Date.now(),
      remark: '',
    },
    async getSelectItemsByURL(url = undefined) {
      if (!url) return [];
      return
      return await this.$http.request({
        url: url,
        method: 'get',
      }).then(res => res.data.result);
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '新商品' : '编辑商品';
    },

    tableDataProcessed() {
      console.log(this.tableData)
      return this.tableData;
      console.log(this.tableData.map(el => {
        let e = el;
        e.quantityLowerLimit = e.quantityLowerLimit == 0 ? '无' : e.quantityLowerLimit;
        e.quantityUpperLimit = e.quantityUpperLimit ? e.quantityUpperLimit : '无';
        return e;
      }).filter(e => {
        e.Status != -1;
      }))
      return this.tableData.map(el => {
        let e = el;
        e.quantityLowerLimit = e.quantityLowerLimit == 0 ? '无' : e.quantityLowerLimit;
        e.quantityUpperLimit = e.quantityUpperLimit ? e.quantityUpperLimit : '无';
        return e;
      }).filter(e => {
        e.Status != -1;
      })
    },
    categoryNames() {
      catego
      return this.categorysAll.map(el => el.name);
    }
  },
  asyncComputed: {
    categorysAll() {
      return this.$http.request({
        url: "/commodity/findCategoryByPage",
        method: 'get',
        params: {findInfo: {}}
      }).then(res => res.data.result);
    },

  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.initialize();
  },
  mounted() {
    this.mountSelectItems();
  },
  methods: {
    hasError(res) {
      return res.data.errors && res.data.errors.length > 0;
    },
    initialize() {
      let self = this;
      this.$http.request({
        method: 'GET',
        url: '/commodity/findCommodityByPage',
        params: {},

      }).then(res => {
        if (this.hasError(res)) {
          this.$message.error('数据获取失败！请检查网络状态！');
        }
        self.tableData = res.data.result;
      });

    },
    mountSelectItems() {
      let self = this;
      for (let i in this.fields) {
        if (this.fields[i].select) {
          this.$http.request({
            url: self.fields[i].selectItemsURL,
            method: "get"
          }).then(res => {
            self.fields[i].selectItems = res.data.result;
          }).catch(err => {
            this.$message.error("选项数据获取失败！")
          })
          console.log(i)
        }

      }
      console.log(this.fields)
    },
    editItem(item) {
      this.editedIndex = this.tableData.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.tableData.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.$http.request({
        method: 'delete',
        url: '/comodity/deleteCommodityById',
        params: {commodityId: this.editedItem.commodityId},
      }).then(res => {
        if (this.hasError(res)) {
          this.$message.error('删除失败！该商品不存在或无法删除！');
        } else {
          this.$message.success('删除成功！');
        }
      });
      this.$emit("itemDeleted", Object.assign({}, this.tableData[this.editedIndex]));
      this.tableData.splice(this.editedIndex, 1);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.tableData[this.editedIndex], this.editedItem);
      } else {
        this.$emit("itemSaved", this.editedItem)
        this.$nextTick(() => {
          if (this.editedItem != undefined) {
            this.tableData.push(this.editedItem);
          }
        });
      }
      this.close();
    },
  },
};
</script>
