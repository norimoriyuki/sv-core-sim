'use client';

import { useState } from 'react';
import Image from 'next/image';

// カードの型定義
interface Card {
  id: string;
  name: string;
  cost: number;
  cores: number;
  image: string;
  count: number;
}

// プレイ方針の型定義
type PlayStrategy = 'greedy' | 'highCostFirst';

// マリガン方針の型定義
type MulliganStrategy = 'none' | 'returnNonCore';

// 表示方法の型定義
type DisplayMode = 'normal' | 'cumulative';

// シミュレーション用のカード型
interface SimulationCard {
  cost: number;
  cores: number;
}

export default function Home() {
  // カードデータの初期化
  const [cards, setCards] = useState<Card[]>([
    { id: 'one-one', name: '1コスト1コア', cost: 1, cores: 1, image: '/one-one.png', count: 3 },
    { id: 'one-two', name: '1コスト2コア', cost: 1, cores: 2, image: '/one-two.png', count: 3 },
    { id: 'two-one', name: '2コスト1コア', cost: 2, cores: 1, image: '/two-one.png', count: 7 },
    { id: 'three-one', name: '3コスト1コア', cost: 3, cores: 1, image: '/three-one.png', count: 1 },
    { id: 'three-two', name: '3コスト2コア', cost: 3, cores: 2, image: '/three-two.png', count: 3 },
    { id: 'four-two', name: '4コスト2コア', cost: 4, cores: 2, image: '/four-two.png', count: 5 },
    { id: 'five-one', name: '5コスト1コア', cost: 5, cores: 1, image: '/five-one.png', count: 0 },
    { id: 'five-two', name: '5コスト2コア', cost: 5, cores: 2, image: '/five-two.png', count: 3 },
  ]);

  const [playStrategy, setPlayStrategy] = useState<PlayStrategy>('highCostFirst');
  const [mulliganStrategy, setMulliganStrategy] = useState<MulliganStrategy>('none');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('normal');
  const [results, setResults] = useState<number[][]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // カード枚数の更新
  const updateCardCount = (cardId: string, count: number) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, count } : card
    ));
  };

  // デッキをシャッフルする関数
  const shuffleDeck = (deck: SimulationCard[]): SimulationCard[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // マリガンを実行する関数
  const performMulligan = (hand: SimulationCard[], strategy: MulliganStrategy): SimulationCard[] => {
    if (strategy === 'none') return hand;
    
    if (strategy === 'returnNonCore') {
      return hand.filter(card => card.cores > 0);
    }
    
    return hand;
  };

  // カードをプレイする関数
  const playCards = (hand: SimulationCard[], mana: number, strategy: PlayStrategy): { playedCards: SimulationCard[], remainingHand: SimulationCard[] } => {
    const remainingHand = [...hand];
    const playedCards: SimulationCard[] = [];
    
    // 方針に基づいてカードをソート
    if (strategy === 'greedy') {
      // 貪欲方: コア/コストの評価値でソート（高い順）
      remainingHand.sort((a, b) => {
        const efficiencyA = a.cores / a.cost;
        const efficiencyB = b.cores / b.cost;
        return efficiencyB - efficiencyA;
      });
    } else {
      // コストが高い順、同じコストの場合はコアが多い順
      remainingHand.sort((a, b) => {
        if (a.cost !== b.cost) return b.cost - a.cost;
        return b.cores - a.cores;
      });
    }
    
    let remainingMana = mana;
    
    // プレイできるカードを順番にプレイ
    for (let i = 0; i < remainingHand.length; i++) {
      const card = remainingHand[i];
      if (card.cost <= remainingMana) {
        playedCards.push(card);
        remainingMana -= card.cost;
        remainingHand.splice(i, 1);
        i--; // インデックスを調整
      }
    }
    
    return { playedCards, remainingHand };
  };

  // 1回のシミュレーションを実行する関数
  const runSingleSimulation = (deck: SimulationCard[], strategy: PlayStrategy, mulliganStrategy: MulliganStrategy): number[] => {
    const shuffledDeck = shuffleDeck(deck);
    let hand = shuffledDeck.slice(0, 3); // 初期手札3枚
    let deckIndex = 3;
    let totalCores = 0;
    const coresByTurn: number[] = [];
    
    // マリガン実行
    hand = performMulligan(hand, mulliganStrategy);
    
    // 10ターンまでシミュレーション
    for (let turn = 1; turn <= 10; turn++) {
      // ドロー（1ターン1枚）
      if (deckIndex < shuffledDeck.length) {
        hand.push(shuffledDeck[deckIndex]);
        deckIndex++;
      }
      
      // カードをプレイ
      const { playedCards } = playCards(hand, turn, strategy);
      
      // プレイしたカードのコアを加算
      const turnCores = playedCards.reduce((sum, card) => sum + card.cores, 0);
      totalCores += turnCores;
      
      // 30コアまで記録
      coresByTurn.push(Math.min(totalCores, 30));
    }
    
    return coresByTurn;
  };

  // シミュレーション実行
  const runSimulation = () => {
    setIsRunning(true);
    
    // デッキを構築
    const deck: SimulationCard[] = [];
    cards.forEach(card => {
      for (let i = 0; i < card.count; i++) {
        deck.push({ cost: card.cost, cores: card.cores });
      }
    });
    
    // 40枚未満の場合はダミーカードを追加
    while (deck.length < 40) {
      deck.push({ cost: 1, cores: 0 }); // ダミーカード
    }
    
    // 10,000回シミュレーション実行
    const simulationResults: number[][] = Array.from({ length: 10 }, () => Array(31).fill(0));
    
    for (let sim = 0; sim < 10000; sim++) {
      const result = runSingleSimulation(deck, playStrategy, mulliganStrategy);
      
      // 各ターンのコア数を記録
      result.forEach((cores, turnIndex) => {
        if (cores <= 30) { // 30コアまで
          simulationResults[turnIndex][cores]++;
        }
      });
    }
    
    // 確率に変換
    const probabilityResults = simulationResults.map(turn => 
      turn.map(count => (count / 10000) * 100)
    );
    
    setResults(probabilityResults);
    setIsRunning(false);
  };

  // ヒートマップの色を計算する関数
  const getHeatmapColor = (value: number): string => {
    // 最大値を計算（各行の最大値）
    const maxValue = Math.max(...results.flat());
    if (maxValue === 0) return 'bg-white';
    
    // 0-1の範囲に正規化
    const normalized = value / maxValue;
    
    return `bg-red-${Math.min(9, Math.max(1, Math.ceil(normalized * 9)))}00`;
  };

  // 累積確率を計算する関数
  const calculateCumulativeResults = (normalResults: number[][]): number[][] => {
    return normalResults.map(turn => {
      const cumulative = [];
      for (let i = 0; i < turn.length; i++) {
        // iコア以上を獲得している確率を計算
        const cumulativeProb = turn.slice(i).reduce((sum, prob) => sum + prob, 0);
        cumulative.push(cumulativeProb);
      }
      return cumulative;
    });
  };

  // 表示用の結果を取得
  const getDisplayResults = (): number[][] => {
    if (displayMode === 'cumulative') {
      return calculateCumulativeResults(results);
    }
    return results;
  };

  // コストごとにカードをグループ化
  const cardsByCost = cards.reduce((acc, card) => {
    if (!acc[card.cost]) {
      acc[card.cost] = [];
    }
    acc[card.cost].push(card);
    return acc;
  }, {} as Record<number, Card[]>);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AFネメシス コア獲得シミュレータ
        </h1>

        {/* 説明欄 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-800">シミュレータについて</h2>
          <div className="space-y-3 text-sm text-blue-700">
            <p>
              AFネメシスのコア数をシミュレート。10,000回自動で一人回しして分布を出力。結果はあくまで目安程度に。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>シミュレーション設定:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>シミュレーション回数: 10,000回</li>
                </ul>
              </div>
              <div>
                <strong>表示方法:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>通常:</strong> そのターンでちょうどnコアを獲得している確率</li>
                  <li><strong>累積:</strong> そのターンでnコア以上を獲得している確率</li>
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>プレイ方針:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>貪欲方:</strong> コストあたりのコア獲得数が高いカードから順番にプレイ</li>
                  <li><strong>コストが高い順:</strong> コストが高いカードから順番にプレイ、同じコストの場合はコアが多い方から</li>
                </ul>
              </div>
              <div>
                <strong>マリガン方針:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>マリガンなし:</strong> 初期手札をそのまま使用</li>
                  <li><strong>コアのないカードを戻す:</strong> コア0のカードを手札から除外</li>
                </ul>
              </div>
            </div>
            <p className="text-center mt-4">
              <a 
                href="https://note.com/preview/ne51daec0916b?prev_access_key=734082e66adf455ec9a9a994af3d1f1d" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                このページについて
              </a>
            </p>
          </div>
        </div>

        {/* カード選択セクション */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">デッキ構成</h2>
          <div className="space-y-6">
            {Object.entries(cardsByCost).map(([cost, costCards]) => (
              <div key={cost} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="text-lg font-medium text-gray-700 mb-3">{cost}コスト</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {costCards.map((card) => (
                    <div key={card.id} className="flex flex-col items-center border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-sm text-gray-800 mb-2 text-center">{card.name}</h4>
                      <div className="h-20 bg-gray-200 rounded flex items-center justify-center mb-3">
                        <Image
                          src={card.image}
                          alt={card.name}
                          width={80}
                          height={80}
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">枚数:</label>
                        <select
                          value={card.count}
                          onChange={(e) => updateCardCount(card.id, parseInt(e.target.value))}
                          className="border rounded px-2 py-1 text-sm text-black bg-white"
                        >
                          {Array.from({ length: 13 }, (_, i) => (
                            <option key={i} value={i} className="text-black">{i}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 設定セクション */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">シミュレーション設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プレイ方針
              </label>
              <select
                value={playStrategy}
                onChange={(e) => setPlayStrategy(e.target.value as PlayStrategy)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-black bg-white"
              >
                <option value="highCostFirst" className="text-black">コストが高い順</option>
                <option value="greedy" className="text-black">貪欲方</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                マリガン方針
              </label>
              <select
                value={mulliganStrategy}
                onChange={(e) => setMulliganStrategy(e.target.value as MulliganStrategy)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-black bg-white"
              >
                <option value="none" className="text-black">マリガンなし</option>
                <option value="returnNonCore" className="text-black">コアのないカードを戻す</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示方法
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-black bg-white"
              >
                <option value="normal" className="text-black">通常</option>
                <option value="cumulative" className="text-black">累積</option>
              </select>
            </div>
          </div>
        </div>

        {/* 実行ボタン */}
        <div className="text-center mb-6">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            {isRunning ? '実行中...' : 'シミュレーション実行'}
          </button>
        </div>

        {/* 結果テーブル */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              シミュレーション結果
              {displayMode === 'cumulative' && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  （累積確率：nコア以上を獲得している確率）
                </span>
              )}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 whitespace-nowrap">
                      <div className="text-center">
                        <div>ターン</div>
                        <div>/</div>
                        <div className="text-xs mt-1">
                          {displayMode === 'cumulative' ? 'コア数以上' : 'コア数'}
                        </div>
                      </div>
                    </th>
                    {Array.from({ length: 31 }, (_, i) => (
                      <th key={i} className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-800">
                        {displayMode === 'cumulative' ? `${i}+` : i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getDisplayResults().map((row, turnIndex) => (
                    <tr key={turnIndex} className={turnIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 text-center">
                        {turnIndex + 1}
                      </td>
                      {row.map((value, coreIndex) => (
                        <td 
                          key={coreIndex} 
                          className={`border border-gray-300 px-2 py-2 text-xs text-center text-gray-800 ${getHeatmapColor(value)}`}
                          style={{
                            backgroundColor: value > 0 ? `rgba(255, 0, 0, ${value / Math.max(...getDisplayResults().flat()) * 0.8})` : 'white'
                          }}
                        >
                          {value.toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
