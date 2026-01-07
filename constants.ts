export const PAIRS = [
  { id: 'PAXG-USDT', name: '黄金代币 (PAXG)', type: 'Commodity' }, // Proxy for Gold
  { id: 'ETH-USDT', name: '以太坊 (ETH)', type: 'Crypto' },
  { id: 'WLD-USDT', name: '世界币 (WLD)', type: 'Crypto' }
];

export const DEFAULT_SETTINGS = {
  apiKey: '',
  secretKey: '',
  passphrase: '',
  geminiApiKey: '',
  proxyUrl: 'https://cors-anywhere.herokuapp.com/', // Example proxy
  useRealData: false,
};

// Mock data helpers
export const MOCK_POSITIONS = [
  {
    id: '1',
    instId: 'ETH-USDT',
    side: 'long' as const,
    size: 1.5,
    entryPrice: 2800.50,
    markPrice: 2850.00,
    upl: 74.25,
    uplRatio: 1.76,
    leverage: 10
  },
  {
    id: '2',
    instId: 'PAXG-USDT',
    side: 'short' as const,
    size: 0.5,
    entryPrice: 2350.00,
    markPrice: 2345.00,
    upl: 2.50,
    uplRatio: 0.21,
    leverage: 5
  }
];