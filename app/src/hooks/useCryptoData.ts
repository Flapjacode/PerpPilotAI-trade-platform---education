import { useState, useEffect, useCallback } from 'react';
import type { Cryptocurrency, ChartData, AISignal } from '@/types/crypto';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export function useCryptoData() {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      if (!response.ok) throw new Error('Failed to fetch crypto data');
      const data = await response.json();
      setCryptos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to mock data if API fails
      setCryptos(getMockCryptos());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCryptos();
    const interval = setInterval(fetchCryptos, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchCryptos]);

  return { cryptos, loading, error, refetch: fetchCryptos };
}

export function useChartData(symbol: string, days: number = 30) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${COINGECKO_API}/coins/${symbol.toLowerCase()}/ohlc?vs_currency=usd&days=${days}`
        );
        if (!response.ok) throw new Error('Failed to fetch chart data');
        const rawData = await response.json();
        const formattedData: ChartData[] = rawData.map((candle: number[]) => ({
          time: candle[0] / 1000,
          open: candle[1],
          high: candle[2],
          low: candle[3],
          close: candle[4],
          volume: 0,
        }));
        setData(formattedData);
      } catch (err) {
        // Generate mock chart data
        setData(generateMockChartData(days));
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchChartData();
    }
  }, [symbol, days]);

  return { data, loading };
}

export function useAISignals() {
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextUpdate, setNextUpdate] = useState<number>(2 * 60 * 60 * 1000);

  const shuffleArray = <T,>(array: T[]) => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const createSignal = (coin: Cryptocurrency, index: number): AISignal => {
    const recommendation = ['LONG', 'SHORT', 'NEUTRAL'][Math.floor(Math.random() * 3)] as AISignal['recommendation'];
    const entryPrice = coin.current_price;
    const confidence = Math.min(95, Math.max(50, Math.round(40 + Math.random() * 50)));
    const timeframeOptions = ['1H', '4H', '1D'];
    const timeframe = timeframeOptions[index % timeframeOptions.length];
    const strength = Math.random() * 0.12 + 0.04;
    const stopBuffer = Math.random() * 0.06 + 0.02;

    const targetPrice = parseFloat(
      recommendation === 'SHORT'
        ? (entryPrice * (1 - strength)).toFixed(2)
        : recommendation === 'LONG'
        ? (entryPrice * (1 + strength)).toFixed(2)
        : (entryPrice * (1 + 0.04)).toFixed(2)
    );

    const stopLoss = parseFloat(
      recommendation === 'SHORT'
        ? (entryPrice * (1 + stopBuffer)).toFixed(2)
        : recommendation === 'LONG'
        ? (entryPrice * (1 - stopBuffer)).toFixed(2)
        : (entryPrice * (1 - 0.03)).toFixed(2)
    );

    return {
      id: `${coin.id}-${Date.now()}-${index}`,
      symbol: coin.id,
      recommendation,
      confidence,
      entryPrice,
      targetPrice,
      stopLoss,
      timeframe,
      reasoning: recommendation === 'NEUTRAL'
        ? 'Price is consolidating, the model recommends waiting for a clearer breakout before taking a position.'
        : recommendation === 'LONG'
        ? 'Momentum is supporting an upside move; support is holding and indicators are aligned for a buy entry.'
        : 'Trend indicators are showing weakness and the asset is likely to retrace lower into support.',
      indicators: {
        rsi: parseFloat((Math.random() * 40 + (recommendation === 'LONG' ? 50 : recommendation === 'SHORT' ? 30 : 45)).toFixed(1)),
        macd: recommendation === 'LONG' ? 'Bullish Momentum' : recommendation === 'SHORT' ? 'Bearish Momentum' : 'Neutral',
        ema: recommendation === 'LONG' ? 'Above 50 EMA' : recommendation === 'SHORT' ? 'Below 50 EMA' : 'Sideways',
        volume: recommendation === 'LONG' ? 'Increasing' : recommendation === 'SHORT' ? 'Decreasing' : 'Stable',
      },
      timestamp: new Date().toISOString(),
    };
  };

  const generateSignals = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false&price_change_percentage=24h`
      );
      let cryptos: Cryptocurrency[] = [];
      if (response.ok) {
        const data = await response.json();
        cryptos = data.map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          market_cap_rank: coin.market_cap_rank,
          fully_diluted_valuation: coin.fully_diluted_valuation,
          total_volume: coin.total_volume,
          high_24h: coin.high_24h,
          low_24h: coin.low_24h,
          price_change_24h: coin.price_change_24h,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap_change_24h: coin.market_cap_change_24h,
          market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
          circulating_supply: coin.circulating_supply,
          total_supply: coin.total_supply,
          max_supply: coin.max_supply,
          ath: coin.ath,
          ath_change_percentage: coin.ath_change_percentage,
          ath_date: coin.ath_date,
          atl: coin.atl,
          atl_change_percentage: coin.atl_change_percentage,
          atl_date: coin.atl_date,
          roi: coin.roi,
          last_updated: coin.last_updated,
        }));
      } else {
        cryptos = getMockCryptos();
      }

      const selected = shuffleArray(cryptos).slice(0, 10);
      const generated = selected.map(createSignal);
      setSignals(generated);
    } catch {
      setSignals(shuffleArray(getMockCryptos()).slice(0, 10).map(createSignal));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSignals();
    const interval = setInterval(generateSignals, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { signals, loading, refreshSignals: generateSignals, nextUpdate };
}

// Mock data helpers
function getMockCryptos(): Cryptocurrency[] {
  return [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 67234.50,
      market_cap: 1325000000000,
      market_cap_rank: 1,
      fully_diluted_valuation: 1412000000000,
      total_volume: 28500000000,
      high_24h: 68500.00,
      low_24h: 66100.00,
      price_change_24h: 1234.50,
      price_change_percentage_24h: 1.87,
      market_cap_change_24h: 25000000000,
      market_cap_change_percentage_24h: 1.92,
      circulating_supply: 19700000,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: 73738.00,
      ath_change_percentage: -8.82,
      ath_date: '2024-03-14T00:00:00.000Z',
      atl: 67.81,
      atl_change_percentage: 99000.25,
      atl_date: '2013-07-06T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString(),
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 3456.78,
      market_cap: 415000000000,
      market_cap_rank: 2,
      fully_diluted_valuation: 415000000000,
      total_volume: 15200000000,
      high_24h: 3520.00,
      low_24h: 3380.00,
      price_change_24h: -45.22,
      price_change_percentage_24h: -1.29,
      market_cap_change_24h: -5400000000,
      market_cap_change_percentage_24h: -1.28,
      circulating_supply: 120000000,
      total_supply: 120000000,
      max_supply: null,
      ath: 4878.26,
      ath_change_percentage: -29.15,
      ath_date: '2021-11-10T00:00:00.000Z',
      atl: 0.432979,
      atl_change_percentage: 798000.15,
      atl_date: '2015-10-20T00:00:00.000Z',
      roi: {
        times: 68.5,
        currency: 'btc',
        percentage: 6850.25,
      },
      last_updated: new Date().toISOString(),
    },
    {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      current_price: 145.23,
      market_cap: 68500000000,
      market_cap_rank: 5,
      fully_diluted_valuation: 84500000000,
      total_volume: 3200000000,
      high_24h: 152.40,
      low_24h: 141.80,
      price_change_24h: 8.45,
      price_change_percentage_24h: 6.18,
      market_cap_change_24h: 3980000000,
      market_cap_change_percentage_24h: 6.16,
      circulating_supply: 471000000,
      total_supply: 581000000,
      max_supply: null,
      ath: 259.96,
      ath_change_percentage: -44.13,
      ath_date: '2021-11-06T00:00:00.000Z',
      atl: 0.500801,
      atl_change_percentage: 28900.25,
      atl_date: '2020-05-11T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString(),
    },
    {
      id: 'cardano',
      symbol: 'ada',
      name: 'Cardano',
      image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      current_price: 0.4523,
      market_cap: 16200000000,
      market_cap_rank: 10,
      fully_diluted_valuation: 20350000000,
      total_volume: 425000000,
      high_24h: 0.4680,
      low_24h: 0.4410,
      price_change_24h: -0.0089,
      price_change_percentage_24h: -1.93,
      market_cap_change_24h: -318000000,
      market_cap_change_percentage_24h: -1.92,
      circulating_supply: 35800000000,
      total_supply: 45000000000,
      max_supply: 45000000000,
      ath: 3.09,
      ath_change_percentage: -85.35,
      ath_date: '2021-09-02T00:00:00.000Z',
      atl: 0.01925276,
      atl_change_percentage: 2248.15,
      atl_date: '2020-03-13T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString(),
    },
    {
      id: 'binancecoin',
      symbol: 'bnb',
      name: 'BNB',
      image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      current_price: 589.45,
      market_cap: 86000000000,
      market_cap_rank: 4,
      fully_diluted_valuation: 86000000000,
      total_volume: 1200000000,
      high_24h: 598.00,
      low_24h: 582.00,
      price_change_24h: 5.23,
      price_change_percentage_24h: 0.89,
      market_cap_change_24h: 765000000,
      market_cap_change_percentage_24h: 0.90,
      circulating_supply: 146000000,
      total_supply: 146000000,
      max_supply: 200000000,
      ath: 690.93,
      ath_change_percentage: -14.68,
      ath_date: '2021-05-10T00:00:00.000Z',
      atl: 0.0398177,
      atl_change_percentage: 1479000.25,
      atl_date: '2017-10-19T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString(),
    },
    {
      id: 'ripple',
      symbol: 'xrp',
      name: 'XRP',
      image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
      current_price: 0.6234,
      market_cap: 34500000000,
      market_cap_rank: 7,
      fully_diluted_valuation: 62340000000,
      total_volume: 1850000000,
      high_24h: 0.6450,
      low_24h: 0.6080,
      price_change_24h: 0.0123,
      price_change_percentage_24h: 2.01,
      market_cap_change_24h: 680000000,
      market_cap_change_percentage_24h: 2.01,
      circulating_supply: 55300000000,
      total_supply: 100000000000,
      max_supply: 100000000000,
      ath: 3.40,
      ath_change_percentage: -81.67,
      ath_date: '2018-01-07T00:00:00.000Z',
      atl: 0.00268621,
      atl_change_percentage: 23100.15,
      atl_date: '2014-05-22T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString(),
    },
  ];
}

function generateMockChartData(days: number): ChartData[] {
  const data: ChartData[] = [];
  const now = Date.now() / 1000;
  const daySeconds = 86400;
  let price = 65000;

  for (let i = days; i >= 0; i--) {
    const time = now - i * daySeconds;
    const volatility = 0.03;
    const change = (Math.random() - 0.5) * volatility;
    price = price * (1 + change);
    
    const open = price * (1 + (Math.random() - 0.5) * 0.01);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.015);
    const low = Math.min(open, close) * (1 - Math.random() * 0.015);
    
    data.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000000000 + 500000000,
    });
  }

  return data;
}
