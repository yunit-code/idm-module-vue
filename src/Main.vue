<template>
    <component :is="`${componentName}`" :ref="`${componentName}`"/>
</template>

<script>

export default {
  name: 'Main',
  components: {
    
  },
  data(){
    return {
      componentName:""
    }
  },
  props: {
    
  },
  created() {
  },
  mounted() {
    //这里需要把属性传递，并且把组件注册到核心框架提供的方法，然后这里接收固定的平台提供的几个方法，从而实现双向绑定刷新
    // alert(`${process.env.CodeVar}`)
    this.componentName = this.$root.componentName;
    console.log(this.componentName)
  }
}
</script>

<style lang="scss">
#app{
}
</style>
