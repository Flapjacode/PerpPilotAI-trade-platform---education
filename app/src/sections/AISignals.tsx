import { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Clock, Target, Shield, Zap, BarChart3, Activity, ChevronRight, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAISignals } from '@/hooks/useCryptoData';

interface AISignalsProps {
  onSelectCrypto: (crypto: { id: string; symbol: string; name: string; image: string; current_price: number; market_cap: number; market_cap_rank: number; fully_diluted_valuation: number | null; total_volume: number; high_24h: number; low_24h: number; price_change_24h: number; price_change_percentage_24h: number; market_cap_change_24h: number; market_cap_change_percentage_24h: number; circulating_supply: number; total_supply: number | null; max_supply: number | null; ath: number; ath_change_percentage: number; ath_date: string; atl: number; atl_change_percentage: number; atl_date: string; roi: null | { times: number; currency: string; percentage: number; }; last_updated: string; }) => void;
}

export function AISignals({ onSelectCrypto }: AISignalsProps) {
  const { signals, loading, refreshSignals, nextUpdate } = useAISignals();
  const [filter, setFilter] = useState<'all' | 'long' | 'short' | 'neutral'>('all');
  const [timeframe, setTimeframe] = useState<'all' | '1h' | '4h' | '1d'>('all');

  const filteredSignals = signals.filter(signal => {
    const matchesFilter = filter === 'all' || signal.recommendation.toLowerCase() === filter;
    const matchesTimeframe = timeframe === 'all' || signal.timeframe.toLowerCase() === timeframe;
    return matchesFilter && matchesTimeframe;
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'LONG':
        return <TrendingUp className="w-5 h-5" />;
      case 'SHORT':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'LONG':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'SHORT':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.max(Math.round(ms / 1000), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-800/50 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-800/50 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800/30 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Long Signals</p>
                <p className="text-2xl font-bold text-green-400">
                  {signals.filter(s => s.recommendation === 'LONG').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Short Signals</p>
                <p className="text-2xl font-bold text-red-400">
                  {signals.filter(s => s.recommendation === 'SHORT').length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Confidence</p>
                <p className="text-2xl font-bold text-blue-400">
                  {Math.round(signals.reduce((acc, s) => acc + s.confidence, 0) / signals.length)}%
                </p>
              </div>
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Signals</p>
                <p className="text-2xl font-bold text-purple-400">{signals.length}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-700 bg-slate-950/70 px-4 py-3 text-sm text-gray-300">
          <Clock className="w-4 h-4 text-blue-300" />
          <span>
            Next update in <span className="font-semibold text-white">{formatCountdown(nextUpdate)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter:</span>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="bg-gray-800/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">All</TabsTrigger>
              <TabsTrigger value="long" className="data-[state=active]:bg-green-600">Long</TabsTrigger>
              <TabsTrigger value="short" className="data-[state=active]:bg-red-600">Short</TabsTrigger>
              <TabsTrigger value="neutral" className="data-[state=active]:bg-gray-600">Neutral</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Timeframe:</span>
          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="bg-gray-800/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="1h">1H</TabsTrigger>
              <TabsTrigger value="4h">4H</TabsTrigger>
              <TabsTrigger value="1d">1D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300" onClick={refreshSignals}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSignals.map((signal) => (
          <Card
            key={signal.id}
            className="bg-[#0d1220] border-gray-800 hover:border-gray-700 transition-all cursor-pointer group"
            onClick={() => onSelectCrypto({
              id: signal.symbol,
              symbol: signal.symbol,
              name: signal.symbol.charAt(0).toUpperCase() + signal.symbol.slice(1),
              image: `https://assets.coingecko.com/coins/images/1/large/${signal.symbol}.png`,
              current_price: signal.entryPrice,
              market_cap: 0,
              market_cap_rank: 0,
              fully_diluted_valuation: null,
              total_volume: 0,
              high_24h: signal.targetPrice,
              low_24h: signal.stopLoss,
              price_change_24h: 0,
              price_change_percentage_24h: 0,
              market_cap_change_24h: 0,
              market_cap_change_percentage_24h: 0,
              circulating_supply: 0,
              total_supply: null,
              max_supply: null,
              ath: signal.targetPrice,
              ath_change_percentage: 0,
              ath_date: '',
              atl: signal.stopLoss,
              atl_change_percentage: 0,
              atl_date: '',
              roi: null,
              last_updated: ''
            })}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getSignalColor(signal.recommendation)}`}>
                    {getSignalIcon(signal.recommendation)}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-white capitalize">
                      {signal.symbol}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {signal.timeframe} • {new Date(signal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <Badge className={`${getSignalColor(signal.recommendation)} text-sm px-3 py-1`}>
                  {signal.recommendation}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Targets */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Entry
                  </p>
                  <p className="text-lg font-semibold text-white">
                    ${signal.entryPrice.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3">
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Target
                  </p>
                  <p className="text-lg font-semibold text-green-400">
                    ${signal.targetPrice.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Stop Loss
                  </p>
                  <p className="text-lg font-semibold text-red-400">
                    ${signal.stopLoss.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Risk/Reward */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Risk/Reward Ratio</span>
                <span className="text-white font-medium">
                  1:{((signal.targetPrice - signal.entryPrice) / (signal.entryPrice - signal.stopLoss)).toFixed(2)}
                </span>
              </div>

              {/* Indicators */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> RSI
                  </span>
                  <span className={`text-sm font-medium ${signal.indicators.rsi > 70 ? 'text-red-400' : signal.indicators.rsi < 30 ? 'text-green-400' : 'text-white'}`}>
                    {signal.indicators.rsi}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> MACD
                  </span>
                  <span className="text-sm font-medium text-white">{signal.indicators.macd}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> EMA
                  </span>
                  <span className="text-sm font-medium text-white">{signal.indicators.ema}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Volume
                  </span>
                  <span className="text-sm font-medium text-white">{signal.indicators.volume}</span>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-gray-800/30 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">AI Analysis</p>
                <p className="text-sm text-gray-300">{signal.reasoning}</p>
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">AI Confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        signal.confidence >= 80
                          ? 'bg-green-500'
                          : signal.confidence >= 60
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${getConfidenceColor(signal.confidence)}`}>
                    {signal.confidence}%
                  </span>
                </div>
              </div>

              {/* Action */}
              <Button
                className={`w-full ${
                  signal.recommendation === 'LONG'
                    ? 'bg-green-600 hover:bg-green-700'
                    : signal.recommendation === 'SHORT'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCrypto({
                    id: signal.symbol,
                    symbol: signal.symbol,
                    name: signal.symbol.charAt(0).toUpperCase() + signal.symbol.slice(1),
                    image: `https://assets.coingecko.com/coins/images/1/large/${signal.symbol}.png`,
                    current_price: signal.entryPrice,
                    market_cap: 0,
                    market_cap_rank: 0,
                    fully_diluted_valuation: null,
                    total_volume: 0,
                    high_24h: signal.targetPrice,
                    low_24h: signal.stopLoss,
                    price_change_24h: 0,
                    price_change_percentage_24h: 0,
                    market_cap_change_24h: 0,
                    market_cap_change_percentage_24h: 0,
                    circulating_supply: 0,
                    total_supply: null,
                    max_supply: null,
                    ath: signal.targetPrice,
                    ath_change_percentage: 0,
                    ath_date: '',
                    atl: signal.stopLoss,
                    atl_change_percentage: 0,
                    atl_date: '',
                    roi: null,
                    last_updated: ''
                  });
                }}
              >
                Trade {signal.symbol.toUpperCase()} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
