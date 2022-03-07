export default {
    //开发工具的组件市场数据
    fetchData(){
        return IDM.http.get("/ctrl/api/frame/getMenuInfo");
    }
}