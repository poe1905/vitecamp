const http = require('http');
const fs = require('fs');
const path = require('path');

const serverOptions = {
  port: 9527,
  liveReload: false
};
const server = http.createServer(serverOptions);

server.on('listening', () => {
  console.log(`Server running at http://localhost:${server.address().port}`);
});

server.on('error', (err) => {
  console.error(`Server error: ${err}`);
});

// 静态文件目录
const staticDir = 'dist';

// 遍历静态文件目录下的所有文件，并添加到服务器响应中
function addStaticFilesToResponse(requestedPath) {
  const fullPath = path.join(staticDir, requestedPath);
  if (!fs.existsSync(fullPath)) {
    return; // 如果文件不存在则返回
  }
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) { // 如果是目录则递归调用自身，直到找到文件或者到达根目录为止
    return addStaticFilesToResponse(requestedPath + '/');
  } else { // 如果是文件则直接返回文件内容
    const mimeType = getMimeType(fullPath);
    const contentLength = stat.size;
    const response = new http.Response(null, statusCode); // 根据文件类型设置状态码和响应头信息
    response.writeHead(200, { 'Content-Type': mimeType, 'Content-Length': contentLength });
    fs.createReadStream(fullPath).pipe(response); // 将文件内容通过管道传输到响应中
    return response; // 返回响应对象以便后续处理
  }
}

// 根据文件类型获取 MIME 类型
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase(); // 获取文件扩展名并转换为小写字母形式
  switch (ext) {
    case '.js': return 'text/javascript'; // 如果是 JavaScript 文件则返回 text/javascript MIME 类型
    case '.css': return 'text/css'; // 如果是 CSS 文件则返回 text/css MIME 类型
  }
}

// 根据请求路径获取文件内容并返回响应对象
function handleRequest(requestedPath) {
  const fullPath = path.join(staticDir, requestedPath); // 根据请求路径拼接出完整文件路径
  const response = new http.Response(null, statusCode); // 根据文件类型设置状态码和响应头信息
  response.writeHead(200, { 'Content-Type': getMimeType(fullPath), 'Content-Length': fs.statSync(fullPath).size }); // 根据文件类型设置状态码和响应头信息
  fs.createReadStream(fullPath).pipe(response); // 将文件内容通过管道传输到响应中
  return response; // 返回响应对象以便后续处理
}
