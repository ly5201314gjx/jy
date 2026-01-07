import CryptoJS from 'crypto-js';
import { Settings } from '../types';

const OKX_REST_URL = 'https://www.okx.com';

// Helper to generate signature
const sign = (timestamp: string, method: string, requestPath: string, body: string, secretKey: string) => {
  const message = timestamp + method + requestPath + body;
  const hmac = CryptoJS.HmacSHA256(message, secretKey);
  return CryptoJS.enc.Base64.stringify(hmac);
};

// Generic request handler
const okxRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST', 
  settings: Settings, 
  params: Record<string, any> = {},
  isPrivate: boolean = false
) => {
  if (!settings.proxyUrl) {
    throw new Error('CORS 代理未配置。浏览器端访问 OKX API 必须配置代理。');
  }

  // Construct Query String
  let queryString = '';
  if (method === 'GET' && Object.keys(params).length > 0) {
    queryString = '?' + new URLSearchParams(params).toString();
  }

  const urlPath = endpoint + queryString;
  const fullUrl = `${settings.proxyUrl}${OKX_REST_URL}${urlPath}`;
  
  const timestamp = new Date().toISOString();
  const body = method === 'POST' ? JSON.stringify(params) : '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (isPrivate) {
    if (!settings.apiKey || !settings.secretKey || !settings.passphrase) {
        throw new Error("API Key, Secret Key 或 Passphrase 未配置");
    }
    const signature = sign(timestamp, method, urlPath, body, settings.secretKey);
    headers['OK-ACCESS-KEY'] = settings.apiKey;
    headers['OK-ACCESS-SIGN'] = signature;
    headers['OK-ACCESS-TIMESTAMP'] = timestamp;
    headers['OK-ACCESS-PASSPHRASE'] = settings.passphrase;
    headers['OK-ACCESS-SIMULATED'] = '0'; // 0 for Real Trading, 1 for Demo
  }

  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: method === 'POST' ? body : undefined,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error: ${response.status} ${text}`);
    }

    const json = await response.json();
    if (json.code !== '0') {
        throw new Error(`OKX Error [${json.code}]: ${json.msg}`);
    }

    return json.data;
  } catch (error: any) {
    console.error(`OKX Request Failed [${endpoint}]:`, error);
    throw error;
  }
};

// Public API wrapper
export const publicRequest = async (endpoint: string, params: any, settings: Settings) => {
    return okxRequest(endpoint, 'GET', settings, params, false);
};

// Private API wrapper
export const privateRequest = async (endpoint: string, params: any, settings: Settings) => {
    return okxRequest(endpoint, 'GET', settings, params, true);
};