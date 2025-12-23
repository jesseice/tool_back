class DyHot {
  passport_csrf_token = '';
  constructor(passport_csrf_token) {
    this.passport_csrf_token = passport_csrf_token;
  }

  formatToW(numStr) {
    try {
      const num = parseInt(String(numStr).replace(/[^\d]/g, ''));

      if (!numStr) return '';
      if (isNaN(num)) {
        return numStr; // 如果提取不到数字，直接返回原始输入
      }
      if (num < 10000) {
        return num.toString(); // 如果小于 10000，直接返回原始数字
      }
      return (num / 10000).toFixed(1) + 'w'; // 除以 10000 并保留一位小数
    } catch (error) {
      return '';
    }
  }

  /** 抖音-获取passport token */
  async getPassportToken() {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
      Accept: 'application/json, text/javascript',
      pragma: 'no-cache',
      'cache-control': 'no-cache',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua':
        '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'x-tt-passport-csrf-token': '',
      'x-tt-passport-trace-id': '59160321',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      referer: 'https://www.douyin.com/jingxuan',
      'accept-language': 'zh-CN,zh;q=0.9',
      priority: 'u=1, i',
    };
    const res = await fetch(
      'https://www.douyin.com/passport/general/login_guiding_strategy/?passport_jssdk_version=3.1.3&passport_jssdk_type=normal&is_from_ttaccountsdk=1&aid=6383',
      {
        headers,
        redirect: 'manual',
        method: 'GET',
      },
    );
    const cookies = res.headers.getSetCookie();
    const passport_csrf_token =
      cookies
        .find((item) => item.includes('passport_csrf_token'))
        ?.split('=')[1]
        .split(';')[0] || '';
    console.log('passport_csrf_token', passport_csrf_token);
    if (passport_csrf_token) {
      this.passport_csrf_token = passport_csrf_token;
      return true;
    }
    return false;
  }

  /** 抖音-爬取热点*/
  async queryDyHotList() {
    const res = await fetch(
      'https://www.douyin.com/aweme/v1/web/hot/search/list/',
      {
        headers: {
          accept: '*/*',
          'accept-language': 'zh-CN,zh;q=0.9',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          priority: 'u=1, i',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'none',
          'sec-fetch-storage-access': 'active',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
          Cookie: `passport_csrf_token=${this.passport_csrf_token};`,
        },
        redirect: 'follow',
      },
    );
    const response = await res.json();
    console.log('[response] ---> ', response);
    if (response.data) {
      return response.data.word_list.map((val) => {
        return {
          id: val.sentence_id,
          title: val.word,
          desc: '',
          link: `https://www.douyin.com/hot/${
            val.sentence_id
          }/${encodeURIComponent(val.word)}`,
          img: '',
          hot: this.formatToW(val.hot_value),
        };
      });
    }
    return [];
  }
}

class Bot {
  tenant_access_token = '';
  chatId = '';
  constructor(chatId) {
    this.chatId = chatId;
  }
  /** 获取token */
  async getAuthToken() {
    const res = await fetch(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: 'cli_a9a2b58e54781cc6',
          app_secret: 'CTeCkXvXUvXcAqdJi0qvqgktxyzOGb5G',
        }),
      },
    );
    const response = await res.json();
    console.log('response', response);
    if (response.code === 0) {
      this.tenant_access_token = response.tenant_access_token;
      return response.tenant_access_token;
    } else {
      console.log('获取授权token失败', response.msg);
    }
    return null;
  }

  /** 发送消息 */
  async sendMsg(msg) {
    const res = await fetch(
      'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.tenant_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receive_id: this.chatId,
          msg_type: 'interactive',
          content: JSON.stringify(msg),
        }),
      },
    );
    const data = await res.json();
    console.log('sendMsg data', data);
    return data;
  }
}
const main = async () => {
  try {
    let sendedDays = [];

    // 看当前时间 是不是 早上9.
    const now = new Date();
    const curDay = `${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
    if (!(now.getHours() === 9 && !sendedDays.includes(curDay))) {
      return;
    }

    const dyHot = new DyHot();
    await dyHot.getPassportToken();
    const list = await dyHot.queryDyHotList();

    const chatId = 'oc_e6cfd73e275162589768b9d9559ea072';
    const bot = new Bot(chatId);

    await bot.getAuthToken();
    // const msgContent = {
    //   zh_cn: {
    //     title: `抖音今日热点-${new Date().toLocaleDateString()}`,
    //     content: [
    //       ...list.map((item) => {
    //         const { id, title, desc, link, img, hot } = item;
    //         return [
    //           {
    //             tag: 'a',
    //             href: link,
    //             text: title,
    //           },
    //           {
    //             tag: 'text',
    //             text: hot,
    //           },
    //           {
    //             tag: 'emotion',
    //             emoji_type: 'Fire',
    //           },
    //         ];
    //       }),
    //     ],
    //   },
    // };
    const msgContent = {
      type: 'template',
      data: {
        template_id: 'AAqXTec1E8NnP',
        template_variable: {
          title: `抖音今日热点-${new Date().toLocaleDateString()}`,
          list,
        },
      },
    };
    console.log('msgContent', msgContent);
    await bot.sendMsg(msgContent);

    sendedDays.push(curDay);
  } catch (error) {
    console.error('main error', error);
  } finally {
    setTimeout(main, 1000 * 30);
  }
};

main();
