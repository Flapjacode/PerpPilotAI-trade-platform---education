import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Maximize2, Settings, TrendingUp, TrendingDown, BarChart3, CandlestickChart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Cryptocurrency } from '@/types/crypto';

// TradingView widget types
declare global {
  interface Window {
    TradingView: {
      widget: new (config: any) => any;
    };
  }
}

interface TradingViewProps {
  crypto: Cryptocurrency | null;
  onBack: () => void;
}

export function TradingView({ crypto, onBack }: TradingViewProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [indicators, setIndicators] = useState({
    ma20: true,
    ma50: false,
    rsi: false,
    macd: false,
    bollinger: false,
    volume: true,
  });

  // Convert crypto symbol to TradingView format
  const getTradingViewSymbol = (crypto: Cryptocurrency | null): string => {
    if (!crypto) return 'BINANCE:BTCUSDT';

    // Map common cryptocurrencies to TradingView symbols
    const symbolMap: { [key: string]: string } = {
      'bitcoin': 'BINANCE:BTCUSDT',
      'ethereum': 'BINANCE:ETHUSDT',
      'binancecoin': 'BINANCE:BNBUSDT',
      'cardano': 'BINANCE:ADAUSDT',
      'solana': 'BINANCE:SOLUSDT',
      'polkadot': 'BINANCE:DOTUSDT',
      'dogecoin': 'BINANCE:DOGEUSDT',
      'avalanche-2': 'BINANCE:AVAXUSDT',
      'chainlink': 'BINANCE:LINKUSDT',
      'litecoin': 'BINANCE:LTCUSDT',
    };

    return symbolMap[crypto.id] || `BINANCE:${crypto.symbol.toUpperCase()}USDT`;
  };

  useEffect(() => {
    if (!chartContainerRef.current || !crypto) return;

    // Clear any existing content
    chartContainerRef.current.innerHTML = '';

    // Create TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    script.onload = () => {
      if (window.TradingView && chartContainerRef.current) {
        new window.TradingView.widget({
          container_id: chartContainerRef.current.id,
          symbol: getTradingViewSymbol(crypto),
          interval: timeframe === '1D' ? 'D' : timeframe === '1H' ? '60' : timeframe === '4H' ? '240' : 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: chartType === 'candles' ? 1 : 2, // 1 for candles, 2 for line
          locale: 'en',
          toolbar_bg: '#0d1220',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: false,
          height: '100%',
          width: '100%',
          studies: indicators.ma20 ? ['MASimple@tv-basicstudies'] : [],
          hide_top_toolbar: false,
          hide_legend: false,
          hide_volume: !indicators.volume,
          withdateranges: true,
          hide_side_toolbar: false,
          details: true,
          hotlist: true,
          calendar: false,
          news: ['headlines'],
        });
      }
    };

    // Add unique ID to container
    chartContainerRef.current.id = `tradingview_${Date.now()}`;

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [crypto, timeframe, chartType, indicators]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatPercentage = (pct: number) => {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  };

  if (!crypto) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto" />
          <h3 className="text-xl font-semibold text-white">Select a Cryptocurrency</h3>
          <p className="text-gray-400">Choose a crypto from the market list to start trading</p>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            Browse Market
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-[#0d1220]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{crypto.name}</h2>
                  <Badge variant="outline" className="text-gray-400 border-gray-700 uppercase">
                    {crypto.symbol}
                  </Badge>
                  <Badge
                    className={`${
                      crypto.price_change_percentage_24h >= 0
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(crypto.current_price)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Vol: ${(crypto.total_volume / 1e9).toFixed(2)}B
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
              <Maximize2 className="w-4 h-4 mr-1" /> Fullscreen
            </Button>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
              <Settings className="w-4 h-4 mr-1" /> Settings
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-gray-500">Market Cap</span>
            <span className="ml-2 text-white font-medium">
              ${(crypto.market_cap / 1e9).toFixed(2)}B
            </span>
          </div>
          <div>
            <span className="text-gray-500">24h High</span>
            <span className="ml-2 text-green-400 font-medium">
              {formatPrice(crypto.high_24h)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">24h Low</span>
            <span className="ml-2 text-red-400 font-medium">
              {formatPrice(crypto.low_24h)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">ATH</span>
            <span className="ml-2 text-white font-medium">
              {formatPrice(crypto.ath)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#0a0e1a]">
        <div className="flex items-center gap-2">
          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="bg-gray-800/50">
              {['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M'].map((tf) => (
                <TabsTrigger
                  key={tf}
                  value={tf}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  {tf}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={chartType === 'candles' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('candles')}
            className={chartType === 'candles' ? 'bg-blue-600' : 'border-gray-700'}
          >
            <CandlestickChart className="w-4 h-4 mr-1" /> Candles
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            className={chartType === 'line' ? 'bg-blue-600' : 'border-gray-700'}
          >
            <Activity className="w-4 h-4 mr-1" /> Line
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Indicators:</span>
          {Object.entries(indicators).map(([key, enabled]) => (
            <Button
              key={key}
              variant={enabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIndicators(prev => ({ ...prev, [key]: !prev[key as keyof typeof indicators] }))}
              className={enabled ? 'bg-purple-600 text-xs' : 'border-gray-700 text-xs text-gray-400'}
            >
              {key.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>

        {/* Order Panel */}
        <div className="w-80 bg-[#0d1220] border-l border-gray-800 p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <TrendingUp className="w-4 h-4 mr-1" /> Long
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <TrendingDown className="w-4 h-4 mr-1" /> Short
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Order Type</label>
                <div className="flex gap-2 mt-1">
                  <Button variant="outline" size="sm" className="flex-1 border-blue-500 text-blue-400">
                    Market
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-gray-700 text-gray-400">
                    Limit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-gray-700 text-gray-400">
                    Stop
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Amount (USD)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Leverage</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    defaultValue="1"
                    className="flex-1"
                  />
                  <span className="text-white font-medium w-12 text-right">1x</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-500">Take Profit</label>
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full mt-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Stop Loss</label>
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full mt-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Margin Required</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Est. Liquidation</span>
                  <span className="text-white">--</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Trading Fee</span>
                  <span className="text-white">0.02%</span>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
        },
        horzLine: {
          color: '#3b82f6',
          labelBackgroundColor: '#3b82f6',
        },
      },
      rightPriceScale: {
        borderColor: '#1f2937',
      },
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries as unknown as SeriesDefinition<'Candlestick'>, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    const formattedData = chartData.map(d => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candleSeries.setData(formattedData);

    // Add volume histogram if enabled
    if (indicators.volume) {
      const volumeSeries = chart.addSeries(HistogramSeries as unknown as SeriesDefinition<'Histogram'>, {
        color: '#3b82f6',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = chartData.map(d => ({
        time: d.time as Time,
        value: d.volume,
        color: d.close >= d.open ? '#22c55e80' : '#ef444480',
      }));

      volumeSeries.setData(volumeData);
    }

      chart.timeScale().fitContent();

      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();
    };
    
    initChart();

    return () => {
      window.removeEventListener('resize', () => {});
      chart?.remove();
    };
  }, [chartData, indicators.volume]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatPercentage = (pct: number) => {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  };

  if (!crypto) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto" />
          <h3 className="text-xl font-semibold text-white">Select a Cryptocurrency</h3>
          <p className="text-gray-400">Choose a crypto from the market list to start trading</p>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            Browse Market
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-[#0d1220]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{crypto.name}</h2>
                  <Badge variant="outline" className="text-gray-400 border-gray-700 uppercase">
                    {crypto.symbol}
                  </Badge>
                  <Badge
                    className={`${
                      crypto.price_change_percentage_24h >= 0
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(crypto.current_price)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Vol: ${(crypto.total_volume / 1e9).toFixed(2)}B
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
              <Maximize2 className="w-4 h-4 mr-1" /> Fullscreen
            </Button>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
              <Settings className="w-4 h-4 mr-1" /> Settings
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-gray-500">Market Cap</span>
            <span className="ml-2 text-white font-medium">
              ${(crypto.market_cap / 1e9).toFixed(2)}B
            </span>
          </div>
          <div>
            <span className="text-gray-500">24h High</span>
            <span className="ml-2 text-green-400 font-medium">
              {formatPrice(crypto.high_24h)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">24h Low</span>
            <span className="ml-2 text-red-400 font-medium">
              {formatPrice(crypto.low_24h)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">ATH</span>
            <span className="ml-2 text-white font-medium">
              {formatPrice(crypto.ath)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#0a0e1a]">
        <div className="flex items-center gap-2">
          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="bg-gray-800/50">
              {['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M'].map((tf) => (
                <TabsTrigger
                  key={tf}
                  value={tf}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  {tf}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={chartType === 'candles' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('candles')}
            className={chartType === 'candles' ? 'bg-blue-600' : 'border-gray-700'}
          >
            <CandlestickChart className="w-4 h-4 mr-1" /> Candles
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            className={chartType === 'line' ? 'bg-blue-600' : 'border-gray-700'}
          >
            <Activity className="w-4 h-4 mr-1" /> Line
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Indicators:</span>
          {Object.entries(indicators).map(([key, enabled]) => (
            <Button
              key={key}
              variant={enabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIndicators(prev => ({ ...prev, [key]: !prev[key as keyof typeof indicators] }))}
              className={enabled ? 'bg-purple-600 text-xs' : 'border-gray-700 text-xs text-gray-400'}
            >
              {key.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div ref={chartContainerRef} className="w-full h-full" />
          )}
        </div>

        {/* Order Panel */}
        <div className="w-80 bg-[#0d1220] border-l border-gray-800 p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <TrendingUp className="w-4 h-4 mr-1" /> Long
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <TrendingDown className="w-4 h-4 mr-1" /> Short
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Order Type</label>
                <div className="flex gap-2 mt-1">
                  <Button variant="outline" size="sm" className="flex-1 border-blue-500 text-blue-400">
                    Market
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-gray-700 text-gray-400">
                    Limit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-gray-700 text-gray-400">
                    Stop
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Amount (USD)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Leverage</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    defaultValue="1"
                    className="flex-1"
                  />
                  <span className="text-white font-medium w-12 text-right">1x</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-500">Take Profit</label>
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full mt-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Stop Loss</label>
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full mt-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Margin Required</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Est. Liquidation</span>
                  <span className="text-white">--</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Trading Fee</span>
                  <span className="text-white">0.02%</span>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
