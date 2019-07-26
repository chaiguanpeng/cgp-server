#! /usr/bin/env node
//1、执行命令后会执行 bin/www.js使用yargs命令行
const yargs = require('yargs');
let argv = yargs.option('port',{
    alias: 'p',
    default: 3000,
    description:'this is port',
    demand:false
}).option('hostname',{
    alias: 'h',
    default: 'localhost',
    description:'this is hostname',
    demand:false
}).option('dir',{
    alias: 'd',
    default: process.cwd(),
    description:'this is cwd',
    demand:false
}).usage('cgp-server  [options]' ).argv;

//开启服务
let Server = require('../src/app.js');
new Server(argv).start();

// 判断是win还是mac平台
let platform = require('os').platform();
//开启子进程
let {exec} = require('child_process');
//win系统   win32
if(platform==="win32"){
    exec(`start http://${argv.hostname}:${argv.port}`)
}else {
    exec(`open http://${argv.hostname}:${argv.port}`)
}





