#!/usr/bin/env node

/**
 * @description 新建页面脚本
 * @example
 * ```bash
 * # npm run page:add `dir` [`pageName`]
 * 
 * npm run page:add order orderDetail
 * # 此命令将会在/config/page.json中添加 orderDetail 的配置
 * # 且新增 /src/pages/order/orderDetial.vue 文件
 * 
 * 
 * # 若不指定 pageName, 则默认为 pageName 和 dir 相同
 * 
 * npm run page:add order
 * # 此命令将会在/config/page.json中添加 order 的配置
 * # 且新增 /src/pages/order/order.vue 文件
 * 
 * ```
 */

const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')

let [dir, pageName] = process.argv.slice(2, 4)
let pageTitle = pageName

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

    console.log(
      chalk.white.bold.bgGreen(' SUCCESS '),
      chalk.green(`成功创建页面：${pageTitle} !`)
    )
  } catch (err) {
    console.error(
      chalk.white.bold.bgRed(' ERROR \n'),
      chalk.red(`${err}\n`)
    )
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
  
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'title',
    message: "输入页面title: ",
    default: function () {
      return pageTitle
    },
  }])
  if (answers.title) pageTitle = answers.title
  
  Object.assign(pages, { [name]: { title: pageTitle } })
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
