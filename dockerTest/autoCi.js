//启动服务 开一个接口 接受tag 收到后就执行deploy.sh脚本 纯node实现 不用其他框架
const http = require('http');
const { exec } = require('child_process');
const path = require('path');
const url = require('url');

const PORT = 3002;

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 只处理 GET 和 POST 请求
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // 处理部署接口
    let tag = null;

    // 从 GET 参数获取 tag
    if (req.method === 'GET') {
      tag = parsedUrl.query.tag;
    } else if (req.method === 'POST') {
      // 从 POST body 获取 tag
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const challenge = data.challenge || data.CHALLENGE;
          if (challenge) {
            // 飞书地址验证，需在 1 秒内回传 challenge
            res.writeHead(200, {
              'Content-Type': 'application/json; charset=utf-8',
            });
            res.end(JSON.stringify({ challenge }));
            return;
          }
          tag = data.tag;
        } catch (e) {
          // 如果不是 JSON，尝试解析 URL encoded
          const params = new URLSearchParams(body);
          tag = params.get('tag');
        }
        handleDeploy(tag, req, res);
      });
      return;

    handleDeploy(tag, req, res);
  } else {
    // 其他路径返回 404
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

function handleDeploy(tag, req, res) {
  // 验证 tag 参数
  if (!tag || typeof tag !== 'string' || tag.trim() === '') {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        error: 'Tag parameter is required',
        usage: {
          GET: '/deploy?tag=your-tag',
          POST: '/deploy with body: { "tag": "your-tag" }',
        },
      }),
    );
    return;
  }

  // 清理 tag，防止命令注入
  const cleanTag = tag.trim().replace(/[;&|`$(){}[\]<>]/g, '');

  console.log(`[${new Date().toISOString()}] 收到部署请求，tag: ${cleanTag}`);

  // 执行部署脚本
  // 在 Windows 上，尝试使用 bash 或 sh 命令执行脚本
  // 如果系统有 Git Bash 或 WSL，可以使用这些命令

  console.log('process.platform', process.platform);
  const isWindows = process.platform === 'win32';
  let command;

  if (isWindows) {
    // Windows 上优先尝试 bash（Git Bash），如果没有则尝试 sh
    // 也可以使用 WSL: wsl bash deploy.sh
    command = `bash ./deploy.sh "${cleanTag}"`;
  } else {
    // Linux/Mac 上使用 sh
    command = `sh ./deploy.sh "${cleanTag}"`;
  }

  exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] 执行失败:`, error);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(
        JSON.stringify({
          success: false,
          error: error.message,
          stderr: stderr,
        }),
      );
      return;
    }

    console.log(`[${new Date().toISOString()}] 部署成功，tag: ${cleanTag}`);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        success: true,
        tag: cleanTag,
        message: 'Deploy script executed successfully',
        stdout: stdout,
      }),
    );
  });
}

const main = async () => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器启动成功，监听端口: ${PORT}`);
    console.log(`部署接口: http://localhost:${PORT}/deploy?tag=your-tag`);
    console.log(`或者 POST 到: http://localhost:${PORT}/deploy`);
  });
};

main();
