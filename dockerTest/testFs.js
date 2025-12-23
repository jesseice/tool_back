const http = require('http');
const url = require('url');

const PORT = 3002;

const getAuthToken = async () => {
  const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_id: "cli_a9a2b58e54781cc6",
      app_secret: "CTeCkXvXUvXcAqdJi0qvqgktxyzOGb5G",
    }),
  });
  const response = await res.json();
  if (response.code === 0) {
    return response.tenant_access_token;
  } else {
    console.log("获取授权token失败", response.msg);
  }
  return null
}


/** 调dmx接口 */
const callDmxApi = async (msg) => {
  const res = await fetch('https://www.dmxapi.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'sk-FF0NnS5xA4AZgmyamXBDh4qvHHIYGaaD2P8wFqAkp48OmMdX',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: '你是个智能飞书机器人，需要回复用户的消息.',
        },
        {
          role: 'user',
          content: msg,
        },
      ],
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
};

/** 发送消息 */
const sendMsg = async (msg, chatId) => {
  console.log('msg', msg, chatId);
  const token = await getAuthToken()
  const res = await fetch(
    'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: 'text',
        content: JSON.stringify({
          text: msg,
        }),
      }),
    },
  );
  const data = await res.json();
  console.log('sendMsg data', data);
  return data;
};

/** 处理 机器人消息 */
const handleMsg = async (data) => {
  try {
    console.log('data', data);
    const { header, event } = data;
    if (header.event_type !== 'im.message.receive_v1')
      return console.log('非消息处理', '非消息处理');

    const aiMsg = await callDmxApi(JSON.parse(event.message.content)?.text.split(' ')[1]);
    console.log('aiMsg', aiMsg);
    await sendMsg(aiMsg, event.message.chat_id);
  } catch (error) {
    console.error('handleMsg error', error);
  }
};

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
    // 拿body里的CHALLENGE

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const data = JSON.parse(body);
      const challenge = data.challenge || data.CHALLENGE;
      if (challenge) {
        // 飞书地址验证，需在 1 秒内回传 challenge
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
        });
        res.end(JSON.stringify(challenge));
        return;
      }
      handleMsg(data);
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }
  res.end(tag);
});

const main = async () => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器启动成功，监听端口: ${PORT}`);
    console.log(`部署接口: http://localhost:${PORT}/deploy?tag=your-tag`);
    console.log(`或者 POST 到: http://localhost:${PORT}/deploy`);
  });
};

main();
