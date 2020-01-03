/*
* 友盟统计
*/
import hmacsha1 = require('hmacsha1');
import axios from "axios";

interface UmengConfig {
  event: string,
  apiKey: string,
  apiSecurity: string, 
  appkey?: string, 
  params?: any,
  baseUrl?: string,
  paramsUrl?: string
}

export default class UmengSDK {
  event: string
  apiKey: string
  apiSecurity: string
  appkey: string
  params: object
  _aop_signature: string
  urlQuery: string
  baseUrl: string
  paramsUrl: string

  constructor(config: UmengConfig) {
    if(!config.event) {
      throw new Error("event can not be empty");
    }
    if(!config.apiKey) {
      throw new Error("apiKey can not be empty");
    }
    if(!config.apiSecurity) {
      throw new Error("apiSecurity can not be empty");
    }
    this.event = config.event;
    this.apiKey = config.apiKey;
    this.apiSecurity = config.apiSecurity;
    this.appkey = config.appkey || "";
    this.params = config.params || {};
    if (this.appkey) {
      Object.assign(this.params, { appkey: this.appkey });
    }
    this.baseUrl = config.baseUrl || 'https://gateway.open.umeng.com/openapi/';
    this.paramsUrl = config.paramsUrl || `param2/1/com.umeng.uapp`
  }

  private sign() {
    let strParam = `${this.paramsUrl}/${this.event}/${this.apiKey}`;

    //参数按key的ASCII码升序排列
    this.params = this.objKeySort(this.params);
    //将参数按照key+value的方式拼接
    Object.keys(this.params).forEach(key => {
      strParam += `${key}${this.params[key]}`;
    });

    //加密并生成base64字符串
    let _aop_signature = hmacsha1(this.apiSecurity, `${strParam}`);
    _aop_signature = Buffer.from(_aop_signature, 'base64').toString('hex');
    _aop_signature = _aop_signature.toUpperCase();

    this._aop_signature = _aop_signature;
  }

  private getUrlQuery() {
    let urlQuery = '?';
    //参数按key的ASCII码升序排列，并将参数按照key+value的方式拼接
    this.params = this.objKeySort(this.params);
    Object.keys(this.params).forEach(key => {
      urlQuery += `${key}=${this.params[key]}&`;
    });

    urlQuery += `_aop_signature=${this._aop_signature}`;
    if (this.appkey) {
      urlQuery += `&appkey=${this.appkey}`;
    }

    this.urlQuery = urlQuery;
  }

  private objKeySort(args) {
    //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    var newkey = Object.keys(args).sort();
    var newObj = {}; //创建一个新的对象，用于存放排好序的键值对
    for (var i = 0; i < newkey.length; i++) {
      //遍历newkey数组
      newObj[newkey[i]] = args[newkey[i]];
      //向新创建的对象中按照排好的顺序依次增加键值对

    }
    return newObj; //返回排好序的新对象
  }

  async getUmengData() {
    //签名
    this.sign();

    //拼接urlQuery
    this.getUrlQuery();

    let paramsDatas = Object.create(null);
    Object.assign(paramsDatas, { '_aop_signature': this._aop_signature });
    if (this.appkey) {
      Object.assign(paramsDatas, { 'appkey': this.appkey });
    }
    Object.assign(paramsDatas, this.params);

    let headers = { 'Connection': 'Keep-Alive', 'User-Agent': 'Ocean-SDK-Client', 'Cache-Control': 'no-cache' };
    let url = `${this.baseUrl}${this.paramsUrl}/${this.event}/${this.apiKey}${this.urlQuery}`;

    try {
      let response = await axios({
        method: 'post',
        url,
        headers,
        data: paramsDatas
      }); 
      return response.data;
    } catch(error) {
      throw new Error("failed to get umeng data");
    }
  }
}