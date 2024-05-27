const fs = require('fs');
const chalk = require('chalk')
function removeDirectory(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectory(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    });
    fs.rmdirSync(path)
  }
}
removeDirectory('dist')
console.log(chalk.green('Clean dist success!'))