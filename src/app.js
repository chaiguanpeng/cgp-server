let http = require('http');
let url = require('url');
let path = require('path');
let util = require('util');
let fs = require('fs');
let zlib = require('zlib');
let mime = require('mime'); // 得到内容类型,响应头类型
let debug = require('debug')('*'); // 打印输出 会根据环境变量控制输出
let chalk = require('chalk'); // 粉笔
let ejs = require('ejs'); // 模板引擎



/*运行的条件 指定主机名
* 指定启动的端口号
* 指定运行的目录
 */
let config = require('./config');
let stat = util.promisify(fs.stat);//promise化 fs.stat方法
let readdir = util.promisify(fs.readdir);
let template = fs.readFileSync(path.join(__dirname,'tmpl.html'),'utf8'); //读取ejs的模板文件
class Server {
    constructor(args) {
        this.config = {...config,...args}; //讲配置挂载再我们的实例上
        this.template = template //讲模板文件绑定this实例
    }
  async  handleRequest(req,res){ //确保这里的this都是实例
        let {pathname} = url.parse(req.url,true); //获取url的路径 /
        let p = path.join(this.config.dir,pathname); // 可能是G:/cgp-server/public 可能是G://cgp-server/public/index.html
        //1、根据路径 返回不同结果 如果是文件夹 显示文件夹里的内容
        //2、如果是文件 显示文件的内容
      // console.log(p);
      try{
            let statObj=await stat(p);
            if(statObj.isDirectory()){
                //如果是目录 列出目录内容可以点击
                let dirs = await readdir(p); //[index.html,style.css]
                dirs =dirs.map(dir=>{
                    return {
                        filename:dir,
                        path:path.join(pathname,dir)
                    }
                });
                //dirs就是要渲染的数据
                //格式如下[{filename:index.html,path:'/index.html'},{{filename:style.css,path:''/style.css}}]
                let str =ejs.render(this.template,{dirs}); //ejs渲染方法
                // console.log(str);
                res.setHeader('Content-Type', 'text/html;charset=utf-8');
                res.end(str);
            }else {
                //如果是文件
                this.sendFile(req,res,p,statObj)

            }
        }catch (e) {
            //文件不存在情况
            this.sendError(req,res,e)
        }
    }


    /*
    *
    *
    *1、实现缓存
    *2、实现服务端压缩
    *3、实现范围请求
    *
    * */
    range(req, res,p,statObj) {
        //客户端 Range:bytes=0-3
        //服务端 Accept-Range:bytes Content-Range:bytes 0-3/8777

        let range = req.headers['range'];
        if (range) {
            let [, start, end] = range.match(/(\d*)-(\d*)/);
            console.log("stat",statObj.size);
            start = start ? Number(start) : 0;
            end = end ? Number(end) : statObj.size - 1;
            res.statusCode = 206;
            res.setHeader('Accept-Ranges',"bytes");
            res.setHeader('Content-Length',end-start+1);
            res.setHeader('Content-Range',`bytes ${start}-${end}/${statObj.size}`);
            return {start,end};
        }else {
            return {start:0, end:statObj.size};
        }

    }
    gzip(req,res,p,statObj){
        // 客户端 Accept-Encoding: gzip, deflate, br
        // 服务端 Content-Encoding: gzip
        let encoding = req.headers['accept-encoding'];
        if (encoding) {
            if (encoding.match(/\bgzip\b/)) {
                res.setHeader('Content-Encoding', 'gzip')
                return zlib.createGzip();
            } else if (encoding.match(/\bdeflate\b/)) {
                res.setHeader('content-encoding', 'deflate')
                return zlib.createDeflate();
            } else {
                return false;
            }
        } else {
            return false;
        }


    }
    cache(req,res,p,statObj){  //实现缓存
        /* 强制缓存 服务端 Cache-Control Expires
            协商缓存  服务端 Last-Modified Etag
            协商缓存  客户端 if-modified-since  if-none-match
            etag ctime + 文件的大小
            Last-modified ctime
            强制缓存
            */
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Expires', new Date(Date.now() + 10 * 1000).toGMTString());
        let etag = statObj.ctime.toGMTString() + statObj.size;
        let lastModified = statObj.ctime.toGMTString();
        res.setHeader('Etag', etag);
        res.setHeader('Last-Modified', lastModified);
        let ifNoneMatch = req.headers['if-none-match'];
        let ifModifiedSince = req.headers['if-modified-since'];
        if (etag != ifNoneMatch) {
            return false;
        }
        if (lastModified != ifModifiedSince) {
            return false;
        }
        return true;
    }
    sendFile(req,res,p,statObj){
        // 1、检测是否有缓存
        if(this.cache(req,res,p,statObj)){
            res.statusCode = 304;
            res.end();
            return
        }



        //2、检测是否支持压缩
        res.setHeader("Content-Type",mime.getType(p)+";charset=utf8");
        let compress =this.gzip(req,res,p,statObj);
        let {start,end} = this.range(req,res,p,statObj);
        if(compress){ //检测是否压缩。返回的是压缩流
           return fs.createReadStream(p,{start,end}).pipe(compress).pipe(res);
        }else{
            // res.setHeader("Content-Type",mime.getType(p)+";charset=utf8");
           return fs.createReadStream(p,{start,end}).pipe(res)
        }

    }
    sendError(req,res,e){
        debug(util.inspect(e)); //输出错误
        res.statusCode = 404;
        res.end('Not Found');
    }
    start(){
        let server =http.createServer(this.handleRequest.bind(this)); //绑定回调函数中的this
        let {hostname,port} = this.config;
        server.listen(port,hostname);
        debug(`http://${hostname}:${chalk.green(port)} start`)
    }
}

module.exports = Server;
