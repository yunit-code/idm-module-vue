const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const resolve = (...file) => path.resolve(__dirname, ...file)
const log = (message) => console.log(chalk.green(`${message}`))
const successLog = (message) => console.log(chalk.blue(`${message}`))
const errorLog = (error) => console.log(chalk.red(`${error}`))
const jsonObj = require('../public/static/config.json')
const dayjs = require('dayjs')
// 导入模板
const { vueTemplate, jsonTemplate, configItem } = require('./template')
// 生成文件
const generateFile = (path, data, isExists = true) => {
    if (fs.existsSync(path) && isExists) {
        errorLog(`${path}文件已存在`)
        return
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, 'utf8', (err) => {
            if (err) {
                errorLog(err.message)
                reject(err)
            } else {
                resolve(true)
            }
        })
    })
}

log('请输入要生成IDM组件className/comName、会生成在 components目录下')
process.stdin.on('data', async (chunk) => {
    const inputStr = String(chunk).trim().toString()
    const dataArray = inputStr && inputStr.split('/')
    if(dataArray.length !== 2) {
        log('请输入正确的数据格式')
        return
    }
    // 组件类名
    const className = inputStr.split('/')[0]
    // 组件中文名
    const chineseName = inputStr.split('/')[1]
    // 组件路径
    const componentPath = resolve('../src/components')
    // vue文件
    const vueFile = resolve(componentPath, `${className}.vue`)
    // json文件
    const jsonFile = resolve('../public/static/attributes', `${className}.json`)
    // configJson文件
    const configJson = resolve('../public/static/config.json')
    // 判断组件文件夹是否存在
    let fileExists = fs.existsSync(vueFile)
    if (fileExists) {
        errorLog(`${className}vue组件已存在，请重新输入`)
        return
    }
    fileExists = fs.existsSync(jsonFile)
    if (fileExists) {
        errorLog(`${className}json已存在，请重新输入`)
        return
    }

    try {
        // 获取组件名
        log(`正在生成 vue 文件 ${vueFile}`)
        await generateFile(vueFile, vueTemplate(className))
        log(`正在生成 json 文件 ${jsonFile}`)
        await generateFile(jsonFile, jsonTemplate({comName: chineseName, className }))
        const packageName = jsonObj.className
        const configItemObj = configItem({comName: chineseName, className, packageName})
        jsonObj.module.push(configItemObj)
        jsonObj.lasttime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const jsonConfigStr = JSON.stringify(jsonObj)
        log(`正在添加 ${configJson}`)
        await generateFile(configJson, jsonConfigStr ,false)
        successLog('生成成功')

    } catch (e) {
        errorLog(e.message)
    }
    process.stdin.emit('end')
})
process.stdin.on('end', () => {
    log('exit')
    process.exit()
})
