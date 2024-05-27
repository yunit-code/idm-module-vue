<template>
    <component :is="`${componentName}`" @hook:mounted="handleComponentMounted" :ref="`${componentName}`"/>
</template>

<script>

export default {
  name: 'Main',
  components: {
    
  },
  data(){
    return {
      componentName: this.$root.componentName
    }
  },
  props: {
    
  },
  created() {
  },
  mounted() {
    //这里需要把属性传递，并且把组件注册到核心框架提供的方法，然后这里接收固定的平台提供的几个方法，从而实现双向绑定刷新
    // alert(`${process.env.CodeVar}`)
    // this.componentName = this.$root.componentName;
    // console.log(this.componentName)
  },
  methods: {
    handleComponentMounted(){
      const that = this;
      this.$refs[this.componentName].$nextTick(()=>{
        that.$root.moduleObject.mountComplete && that.$root.moduleObject.mountComplete(that.$root.moduleObject);
      })
    }
  },
}
</script>

<style lang="scss">
#app{
}
</style>
