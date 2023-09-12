### 2023-09-12
- chore: 打包后增加idm zip压缩命令
### 2023-08-15
- perf: 优化
    - 去掉生产环境sourceMap
    - 打包使用内置MiniCssExtractPlugin，不再生成多余index.[hash].css， chunk.[hash].css

### 2023-05-18
- perf: 注册文件不再引入config.json，改为传参
