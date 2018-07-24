let path = require('path');
let config = {
    hostname:'127.0.0.1',
    port:3000,
    dir:path.join(__dirname,"..",'public')
};
module.exports = config;








// 1、检测是否有缓存
// if(this.cache(req,res,p,statObj)){
//     res.statusCode = 304;
//     res.end();
//     return
// }
// //2、检测是否支持压缩
// res.setHeader("Content-Type",mime.getType(p)+";charset=utf8");
// let compress =this.gzip(req,res,p,statObj);
// if(compress){ //检测是否压缩。返回的是压缩流
//     console.log(22);
//     return fs.createReadStream(p).pipe(compress).pipe(res);
// }else{
//     res.setHeader("Content-Type",mime.getType(p)+";charset=utf8");
//     return fs.createReadStream(p).pipe(res)
// }
//范围请求
// 3.范围请求 如果有范围请求 就返回部分内容
// if (this.range(req, res, statObj, p)) {
//     return;
// }
//
//
//
//
//
//
// range(req, res, statObj, p) {
//     //客户端 Range:bytes=0-3
//     //服务端 Accept-Range:bytes Content-Range:bytes 0-3/8777
//
//     let range = req.headers['range'];
//     if (range) {
//         let [, start, end] = range.match(/(\d*)-(\d*)/);
//         start = start ? Number(start) : 0;
//         end = end ? Number(end) : statObj.size - 1;
//         res.statusCode = 206;
//         res.setHeader('Accept-Ranges',"bytes");
//         res.setHeader('Content-Length',end-start+1);
//         res.setHeader('Content-Range',`bytes ${start}-${end}/${statObj.size}`);
//         fs.createReadStream(realPath,{start,end}).pipe(res);
//     }
//     return false;
// }
// gzip(req,res,p,statObj){
//     // 客户端 Accept-Encoding: gzip, deflate, br
//     // 服务端 Content-Encoding: gzip
//     let encoding = req.headers['accept-encoding'];
//     if (encoding) {
//         if (encoding.match(/\bgzip\b/)) {
//             res.setHeader('Content-Encoding', 'gzip')
//             return zlib.createGzip();
//         } else if (encoding.match(/\bdeflate\b/)) {
//             res.setHeader('content-encoding', 'deflate')
//             return zlib.createDeflate();
//         } else {
//             return false;
//         }
//     } else {
//         return false;
//     }
//
//
// }
// cache(req,res,p,statObj){  //实现缓存
//     /* 强制缓存 服务端 Cache-Control Expires
//         协商缓存  服务端 Last-Modified Etag
//         协商缓存  客户端 if-modified-since  if-none-match
//         etag ctime + 文件的大小
//         Last-modified ctime
//         强制缓存
//         */
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Expires', new Date(Date.now() + 10 * 1000).toGMTString());
//     let etag = statObj.ctime.toGMTString() + statObj.size;
//     let lastModified = statObj.ctime.toGMTString();
//     res.setHeader('Etag', etag);
//     res.setHeader('Last-Modified', lastModified);
//     let ifNoneMatch = req.headers['if-none-match'];
//     let ifModifiedSince = req.headers['if-modified-since'];
//     if (etag != ifNoneMatch) {
//         return false;
//     }
//     if (lastModified != ifModifiedSince) {
//         return false;
//     }
//     return true;
// }




/*
  *
  *
  *1、实现缓存
  *2、实现服务端压缩
  *3、实现范围请求
  *
  * */