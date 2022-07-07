module.exports = {
    vueTemplate: (className) => {
        return `<template>
        <div idm-ctrl="idm_module"
        :id="moduleObject.id" 
        :idm-ctrl-id="moduleObject.id" 
        :title="propData.htmlTitle?propData.fontContent:''" 
        v-show="propData.defaultStatus!='hidden'" 
        @click="textClickHandle">
         <!--
           组件内部容器
           增加class="drag_container" 必选
           idm-ctrl-id：组件的id，这个必须不能为空
           idm-container-index  组件的内部容器索引，不重复唯一且不变，必选
         -->
         {{propData.fontContent}}
       </div>
</template>
<script>
export default {
    name: '${className}',
    data() {
        return {
            moduleObject:{},
            propData:this.$root.propData.compositeAttr||{
                fontContent:"Hello Word"
            }
        }
    },
    created() {
        this.moduleObject = this.$root.moduleObject
        this.convertAttrToStyleObject();
    },
    methods: {
        propDataWatchHandle(propData){
            this.propData = propData.compositeAttr||{};
            this.convertAttrToStyleObject();
        },
        convertAttrToStyleObject(){
            var styleObject = {};
            if(this.propData.bgSize&&this.propData.bgSize=="custom"){
              styleObject["background-size"]=(this.propData.bgSizeWidth?this.propData.bgSizeWidth.inputVal+this.propData.bgSizeWidth.selectVal:"auto")+" "+(this.propData.bgSizeHeight?this.propData.bgSizeHeight.inputVal+this.propData.bgSizeHeight.selectVal:"auto")
            }else if(this.propData.bgSize){
              styleObject["background-size"]=this.propData.bgSize;
            }
            if(this.propData.positionX&&this.propData.positionX.inputVal){
              styleObject["background-position-x"]=this.propData.positionX.inputVal+this.propData.positionX.selectVal;
            }
            if(this.propData.positionY&&this.propData.positionY.inputVal){
              styleObject["background-position-y"]=this.propData.positionY.inputVal+this.propData.positionY.selectVal;
            }
            for (const key in this.propData) {
              if (this.propData.hasOwnProperty.call(this.propData, key)) {
                const element = this.propData[key];
                if(!element&&element!==false&&element!=0){
                  continue;
                }
                switch (key) {
                  case "width":
                  case "height":
                    styleObject[key]=element;
                    break;
                }
              }
            }
            window.IDM.setStyleToPageHead(this.moduleObject.id,styleObject);
            this.initData();
        },
        reload(){
            //请求数据源
            this.initData();
        },
        initData(){
            let that = this;
            //所有地址的url参数转换
            var params = that.commonParam();
            switch (this.propData.dataSourceType) {
              case "customInterface":
                this.propData.customInterfaceUrl&&window.IDM.http.get(this.propData.customInterfaceUrl,params)
                .then((res) => {
                  //res.data
                  that.$set(that.propData,"fontContent",that.getExpressData("resultData",that.propData.dataFiled,res.data));
                  // that.propData.fontContent = ;
                })
                .catch(function (error) {});
                break;
              case "pageCommonInterface":
                //使用通用接口直接跳过，在setContextValue执行
                break;
              case "customFunction":
                if(this.propData.customFunction&&this.propData.customFunction.length>0){
                  var resValue = "";
                  try {
                    resValue = window[this.propData.customFunction[0].name]&&window[this.propData.customFunction[0].name].call(this,{...params,...this.propData.customFunction[0].param,moduleObject:this.moduleObject});
                  } catch (error) {
                  }
                  that.propData.fontContent = resValue;
                }
                break;
            }
          },
          receiveBroadcastMessage(object){
            console.log("组件收到消息",object)
            if(object.type&&object.type=="linkageShowModule"){
              this.showThisModuleHandle();
            }else if(object.type&&object.type=="linkageHideModule"){
              this.hideThisModuleHandle();
            }
          },
          setContextValue(object) {
            console.log("统一接口设置的值", object);
            if (object.type != "pageCommonInterface") {
              return;
            }
            //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
            if (object.key == this.propData.dataName) {
              // this.propData.fontContent = this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data);
              this.$set(this.propData,"fontContent",this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data));
            }
          },
          sendBroadcastMessage(object){
            window.IDM.broadcast&&window.IDM.broadcast.send(object);
        },
    }
};
</script>`
    },
    jsonTemplate: (componentInfo) => {
        return `{
    "classId": "idm.componet.${componentInfo.packageName}.${componentInfo.className.toLowerCase()}",
    "comName": "${componentInfo.comName}",
    "className": "${componentInfo.className}",
    "comType": "common",
    "comLangue": "vue",
    "compositeAttr": [
        {
            "type": "input",
            "layoutType": "inline",
            "text": "唯一标识",
            "bindKey": "ctrlId",
            "disabled": true,
            "default": "@[packageid]",
            "desc": "",
            "helpUrl": ""
        },
        {
            "type": "group",
            "text": "基本属性",
            "desc": "提供设置组件能达到展示效果的基本属性设置信息",
            "children": [
                {
                    "type": "textarea",
                    "layoutType": "inline",
                    "text": "文本内容",
                    "bindKey": "fontContent",
                    "default": "文本内容"
                },
                {
                    "type": "switch",
                    "layoutType": "inline",
                    "text": "title",
                    "bindKey": "htmlTitle",
                    "desc": "将内容显示为html标签的title，也就是鼠标放上去会有显示文本内容的文字",
                    "disabled": false
                },
                {
                    "type": "radio",
                    "layoutType": "inline",
                    "text": "默认状态",
                    "bindKey": "defaultStatus",
                    "dictionary": [
                        {
                            "label": "普通",
                            "value": "default"
                        },
                        {
                            "label": "隐藏",
                            "value": "hidden"
                        }
                    ],
                    "default": "default"
                }
            ]
        },
        {
            "type": "group",
            "text": "样式设置",
            "desc": "点击？查看样式设置用法指南",
            "helpUrl": "",
            "children": [
                {
                    "type": "box",
                    "layoutType": "block",
                    "text": "内外边距",
                    "bindKey": "box"
                },
                {
                    "type": "inlineGroup",
                    "text": "宽高",
                    "children": [
                        {
                            "type": "input",
                            "layoutType": "block",
                            "text": "宽",
                            "desc": "填写auto则为自适应，或者使用px、%、vw等单位，比如100%、100px、100vw等等",
                            "bindKey": "width",
                            "width": "60px",
                            "default": "100%"
                        },
                        {
                            "type": "input",
                            "layoutType": "block",
                            "text": "高",
                            "desc": "填写auto则为自适应，或者使用px、%、vh等单位，比如100%、100px、100vh等等",
                            "bindKey": "height",
                            "width": "60px",
                            "default": "auto"
                        }
                    ]
                },
                {
                    "type": "group",
                    "text": "背景设置",
                    "desc": "点击？查看背景设置用法指南",
                    "helpUrl": "",
                    "children": [
                        {
                            "type": "colorPicker",
                            "layoutType": "inline",
                            "text": "背景色",
                            "bindKey": "bgColor",
                            "placeholder": "请选择颜色",
                            "default": {}
                        },
                        {
                            "type": "uploadImage",
                            "layoutType": "inline",
                            "text": "背景图片",
                            "bindKey": "bgImgUrl",
                            "placeholder": "可输入图片地址或直接上传"
                        },
                        {
                            "type": "inputNumberUnit",
                            "layoutType": "inline",
                            "text": "横向偏移",
                            "bindKey": "positionX",
                            "dictionary": [
                                {
                                    "label": "px",
                                    "value": "px"
                                },
                                {
                                    "label": "%",
                                    "value": "%"
                                },
                                {
                                    "label": "em",
                                    "value": "em"
                                }
                            ],
                            "display": "@[bgImgUrl]"
                        },
                        {
                            "type": "inputNumberUnit",
                            "layoutType": "inline",
                            "text": "纵向偏移",
                            "bindKey": "positionY",
                            "dictionary": [
                                {
                                    "label": "px",
                                    "value": "px"
                                },
                                {
                                    "label": "%",
                                    "value": "%"
                                },
                                {
                                    "label": "em",
                                    "value": "em"
                                }
                            ],
                            "display": "@[bgImgUrl]"
                        },
                        {
                            "type": "radio",
                            "layoutType": "block",
                            "text": "背景大小",
                            "bindKey": "bgSize",
                            "dictionary": [
                                {
                                    "label": "裁切显示",
                                    "value": "cover"
                                },
                                {
                                    "label": "完全显示",
                                    "value": "contain"
                                },
                                {
                                    "label": "自定义",
                                    "value": "custom"
                                }
                            ],
                            "display": "@[bgImgUrl]"
                        },
                        {
                            "type": "inputNumberUnit",
                            "layoutType": "inline",
                            "text": "宽度",
                            "bindKey": "bgSizeWidth",
                            "dictionary": [
                                {
                                    "label": "px",
                                    "value": "px"
                                },
                                {
                                    "label": "%",
                                    "value": "%"
                                },
                                {
                                    "label": "em",
                                    "value": "em"
                                }
                            ],
                            "display": "@[bgSize=='custom']"
                        },
                        {
                            "type": "inputNumberUnit",
                            "layoutType": "inline",
                            "text": "高度",
                            "bindKey": "bgSizeHeight",
                            "dictionary": [
                                {
                                    "label": "px",
                                    "value": "px"
                                },
                                {
                                    "label": "%",
                                    "value": "%"
                                },
                                {
                                    "label": "em",
                                    "value": "em"
                                }
                            ],
                            "display": "@[bgSize=='custom']"
                        },
                        {
                            "type": "radio",
                            "layoutType": "block",
                            "text": "平铺模式",
                            "bindKey": "bgRepeat",
                            "dictionary": [
                                {
                                    "label": "双向重复",
                                    "value": "repeat"
                                },
                                {
                                    "label": "水平重复",
                                    "value": "repeat-x"
                                },
                                {
                                    "label": "垂直重复",
                                    "value": "repeat-y"
                                },
                                {
                                    "label": "不重复",
                                    "value": "no-repeat"
                                },
                                {
                                    "label": "继承",
                                    "value": "inherit"
                                }
                            ],
                            "display": "@[bgImgUrl]"
                        },
                        {
                            "type": "radio",
                            "layoutType": "inline",
                            "text": "背景模式",
                            "bindKey": "bgAttachment",
                            "dictionary": [
                                {
                                    "label": "固定",
                                    "value": "fixed"
                                },
                                {
                                    "label": "滚动",
                                    "value": "scroll"
                                },
                                {
                                    "label": "继承",
                                    "value": "inherit"
                                }
                            ],
                            "display": "@[bgImgUrl]"
                        }
                    ]
                },
                {
                    "type": "border",
                    "layoutType": "block",
                    "text": "边框",
                    "bindKey": "border"
                },
                {
                    "type": "font",
                    "layoutType": "block",
                    "text": "文字",
                    "bindKey": "font"
                }
            ]
        }
    ]
}
      `
    },
    configItem: (componentInfo) => {
        return {
            classId: `idm.componet.${componentInfo.packageName}.${componentInfo.className.toLowerCase()}`,
            comName: `${componentInfo.comName}`,
            className: `${componentInfo.className}`,
            comType: 'common',
            comLangue: 'vue'
        }
    }
}
