/*
 * @Author: JackLiR8
 * @Date: 2021-05-14 16:20:07
 * @LastEditTime: 2021-05-14 16:22:02
 * @LastEditors: JackLiR8
 * @Description: 新建页面
 */

const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')

let [dir, pageName] = process.argv.slice(2, 4)
if (!dir) {
  console.log(
    chalk.red('invalid args: \n')
  )
  process.exit(1)
} else if (dir && !pageName) {
  pageName = dir
}


createPage(dir, pageName)

async function createPage(dir ,name) {
  try {
    await checkExist(name)
    await createComponent(dir, name)

    console.log(chalk.green(`成功创建 page: ${name} !`))
  } catch (err) {
    console.error(chalk.red(`${err}\n`))
    // 创建不成功，需要删除json文件中的配置
    await resetJson(name)
    process.exit(1)
  }
}

async function checkExist(name) {
  let pages = require('../config/page.json')
  if (pages.hasOwnProperty(name)) {
    throw new Error(`同名页面(${name})已经存在`)
  }
  
  let title = name
  // TODO ask for title
  
  Object.assign(pages, { [name]: { title } })
  return rewritePageConfig(pages)
}

async function resetJson(name) {
  let pages = require('../config/page.json')
  Reflect.deleteProperty(pages, name)
  return rewritePageConfig(pages)
}

function rewritePageConfig(data) {
  return fs.writeFile(
    path.resolve(__dirname, '../config/page.json'),
    JSON.stringify(data, null, 2)
  )
}


async function createComponent(dir, name) {
  const dirname = path.resolve(__dirname, '../src/pages', dir)
  
  await fs.mkdir(dirname)
    .catch(err => { /* ignore */})
  
  const componentFile = `${dirname}/${name}.vue`
  const content = 
    `<template>\n` +
    `<div>\n` +
    `  <h1>${name}</h1>\n` +
    `  <a href="index.html">jump to index.html</a>\n` +
    `</div>\n` +
    `</template>\n` +
    `\n` +
    `<script>\n`+
    `export default {\n` +
    `  name: '${name}'\n` +  
    `}\n` +
    `</script>`
  
  await fs.writeFile(componentFile, content)
}
