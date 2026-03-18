import React, { useState, useEffect } from 'react';
import { Dices, Coins, Map as MapIcon, ArrowRight, Star, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { BOARD, simulate, SimulationResult, TileModifier } from './simulator';

const getTileGridStyle = (id: number) => {
  if (id >= 0 && id <= 10) return { gridRow: 11, gridColumn: 11 - id };
  if (id >= 11 && id <= 20) return { gridRow: 11 - (id - 10), gridColumn: 1 };
  if (id >= 21 && id <= 30) return { gridRow: 1, gridColumn: 1 + (id - 20) };
  if (id >= 31 && id <= 39) return { gridRow: 1 + (id - 30), gridColumn: 11 };
  return {};
};

export default function App() {
  const [currentPos, setCurrentPos] = useState<number>(0);
  const [dice1, setDice1] = useState<string>('1');
  const [dice2, setDice2] = useState<string>('1');
  const [dice3, setDice3] = useState<string>('1');
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [modifiers, setModifiers] = useState<Record<number, TileModifier>>({});
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; tileId: number | null }>({
    visible: false,
    x: 0,
    y: 0,
    tileId: null
  });

  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const handleSimulate = () => {
    const d1 = parseInt(dice1, 10) || 0;
    const d2 = parseInt(dice2, 10) || 0;
    const d3 = parseInt(dice3, 10) || 0;
    const res = simulate(currentPos, [d1, d2, d3], modifiers);
    setResults(res);
  };

  const handleContextMenu = (e: React.MouseEvent, tileId: number) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tileId
    });
  };

  const handleSetModifier = (tileId: number, modifier: TileModifier | null) => {
    setModifiers(prev => {
      const next = { ...prev };
      if (modifier) {
        next[tileId] = modifier;
      } else {
        delete next[tileId];
      }
      return next;
    });
    setContextMenu({ ...contextMenu, visible: false });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white p-4 md:p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl hidden sm:block">
              <Dices size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">진의 신비한 정원 주사위 시뮬레이터</h1>
              <p className="text-xs md:text-sm text-slate-500">최적의 주사위 사용 순서를 찾아 코인을 최대로 획득하세요!</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-[10px] md:text-xs text-slate-400 font-medium">제작</p>
            <p className="text-xs md:text-sm font-bold text-slate-600">메이플 인벤 복치</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Board Overview */}
          <div className="xl:col-span-7 bg-white p-4 md:p-6 rounded-2xl shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapIcon className="w-5 h-5 mr-2 text-blue-500" />
              보드판 (좌클릭: 현재 위치, 우클릭: 황금벌/호문 설정)
            </h2>
            <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl p-2 md:p-6 border border-slate-200 overflow-hidden">
              <div className="w-full max-w-2xl aspect-square grid grid-cols-11 grid-rows-11 gap-0.5 md:gap-1 relative">
                {BOARD.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={() => setCurrentPos(tile.id)}
                    onContextMenu={(e) => handleContextMenu(e, tile.id)}
                    style={getTileGridStyle(tile.id)}
                    className={`
                      relative flex flex-col items-center justify-center text-center p-0.5 md:p-1 cursor-pointer transition-all select-none
                      ${currentPos === tile.id 
                        ? 'bg-blue-500 text-white shadow-lg scale-110 z-10 rounded-md ring-2 ring-blue-300' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50 rounded-sm'}
                    `}
                  >
                    <span className={`absolute top-0.5 left-0.5 text-[0.4rem] md:text-[0.5rem] leading-none ${currentPos === tile.id ? 'text-blue-200' : 'text-slate-400'}`}>
                      {tile.id}
                    </span>
                    
                    {modifiers[tile.id] === 'golden_bee' && (
                      <div className="absolute top-0.5 right-0.5 text-[0.6rem] md:text-sm leading-none" title="황금벌 (코인 x2)">🐝</div>
                    )}
                    {modifiers[tile.id] === 'homunculus' && (
                      <div className="absolute top-0.5 right-0.5 text-[0.6rem] md:text-sm leading-none" title="호문 (코인 x0.5)">👾</div>
                    )}
                    
                    <div className="flex flex-col items-center justify-center w-full h-full mt-1">
                      {tile.type === 'start' && <span className="text-[0.45rem] md:text-[0.65rem] font-black text-red-500">START</span>}
                      {tile.type === 'coin' && <span className="text-[0.45rem] md:text-[0.65rem] font-bold">{tile.label}</span>}
                      {tile.type === 'move' && <span className="text-[0.45rem] md:text-[0.65rem] font-bold text-orange-500">{tile.label}</span>}
                    </div>

                    {tile.bonusDice && (
                      <div className="absolute bottom-0.5 right-0.5">
                        <Dices className={`w-2 h-2 md:w-3 md:h-3 ${currentPos === tile.id ? 'text-yellow-300' : 'text-purple-500'}`} />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Center Logo */}
                <div className="col-start-2 col-end-11 row-start-2 row-end-11 flex items-center justify-center pointer-events-none">
                  <div className="text-center opacity-10">
                    <MapIcon className="w-16 h-16 md:w-32 md:h-32 mx-auto mb-2 md:mb-4" />
                    <h2 className="text-lg md:text-3xl font-black tracking-widest">MYSTERIOUS<br/>GARDEN</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Context Menu */}
          {contextMenu.visible && contextMenu.tileId !== null && (
            <div
              className="fixed bg-white border border-slate-200 shadow-xl rounded-lg py-1 z-50 min-w-[140px] overflow-hidden"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <div className="px-3 py-1.5 text-xs font-bold text-slate-400 border-b border-slate-100 bg-slate-50">
                {contextMenu.tileId}번 칸 설정
              </div>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 text-yellow-700 font-medium flex justify-between items-center"
                onClick={(e) => { e.stopPropagation(); handleSetModifier(contextMenu.tileId!, 'golden_bee'); }}
              >
                <span>황금벌</span>
                <span className="text-xs bg-yellow-100 px-1.5 py-0.5 rounded">x2</span>
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 text-purple-700 font-medium flex justify-between items-center"
                onClick={(e) => { e.stopPropagation(); handleSetModifier(contextMenu.tileId!, 'homunculus'); }}
              >
                <span>호문</span>
                <span className="text-xs bg-purple-100 px-1.5 py-0.5 rounded">x0.5</span>
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 text-slate-600 flex justify-between items-center"
                onClick={(e) => { e.stopPropagation(); handleSetModifier(contextMenu.tileId!, null); }}
              >
                <span>초기화</span>
              </button>
            </div>
          )}

          {/* Right Column: Controls & Results */}
          <div className="xl:col-span-5 space-y-6">
            {/* Input Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">시뮬레이션 설정</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">현재 위치 (칸 번호)</label>
                  <select 
                    value={currentPos} 
                    onChange={(e) => setCurrentPos(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    {BOARD.map(t => (
                      <option key={t.id} value={t.id}>{t.id}. {t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">주사위 눈금 (3개)</label>
                  <div className="flex space-x-3">
                    {[dice1, dice2, dice3].map((val, idx) => (
                      <input 
                        key={idx}
                        type="text" 
                        value={val}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!/^-?\d*$/.test(v)) return;
                          if (v.length > 3) return;
                          if (idx === 0) setDice1(v);
                          if (idx === 1) setDice2(v);
                          if (idx === 2) setDice3(v);
                        }}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSimulate}
                className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center"
              >
                <Star className="w-5 h-5 mr-2" />
                최적 경로 계산하기
              </button>
            </div>

            {/* Results Section */}
            {results.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Coins className="w-5 h-5 mr-2 text-yellow-500" />
                  시뮬레이션 결과
                </h2>
                
                <div className="space-y-4">
                  {results.map((res, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${idx === 0 ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-100' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            {idx === 0 && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md">BEST</span>}
                            <h3 className="font-bold text-lg">주사위 순서: {res.order.join(' → ')}</h3>
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            총 획득 코인: <span className="font-bold text-slate-800">{res.totalCoins.toLocaleString()}</span>
                            {res.bonusDiceCount > 0 && (
                              <span className="ml-3 text-purple-600 font-medium">
                                + 추가 주사위 {res.bonusDiceCount}개
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200/60">
                        <div className="flex flex-col space-y-3">
                          {res.path.map((step, stepIdx) => (
                            <div key={stepIdx} className="flex items-center text-[11px] sm:text-sm">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] sm:text-xs font-bold mr-2 sm:mr-3 shrink-0">
                                {stepIdx + 1}
                              </div>
                              <div className="flex-1 flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
                                <span className="font-medium shrink-0">주사위 {step.roll}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-200 shrink-0">
                                  {step.landedOn}번 칸({BOARD[step.landedOn].label})
                                </span>
                                
                                {step.moveDest !== undefined && (
                                  <>
                                    <ArrowRight className="w-3 h-3 text-orange-400 shrink-0" />
                                    <span className="bg-orange-50 text-orange-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-orange-200 shrink-0">
                                      {step.moveDest}번 칸으로 이동({BOARD[step.moveDest].label})
                                    </span>
                                  </>
                                )}
                                
                                <div className="flex items-center ml-auto pl-2 shrink-0 gap-1">
                                  {step.bonusDice && (
                                    <Dices className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.length === 0 && (
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 border-dashed text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                <p>주사위 눈금을 입력하고 계산하기 버튼을 눌러주세요.</p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Guide (Collapsible) */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="w-full px-4 md:px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-500" />
              <h3 className="text-base md:text-lg font-semibold text-slate-800">시뮬레이터 사용 방법</h3>
            </div>
            {isGuideOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {isGuideOpen && (
            <div className="px-4 md:px-6 pb-6 pt-2 text-sm text-slate-600 space-y-3 border-t border-slate-100">
              <p><strong>1. 현재 위치 설정:</strong> 보드판에서 현재 캐릭터가 있는 칸을 <span className="text-blue-500 font-bold">좌클릭</span>하여 선택합니다.</p>
              <p><strong>2. 특수 칸(황금벌/호문) 설정:</strong> 보드판의 칸을 <span className="text-purple-500 font-bold">우클릭</span>하여 황금벌(코인 2배) 또는 호문(코인 0.5배) 효과를 부여할 수 있습니다.</p>
              <p><strong>3. 주사위 입력:</strong> 현재 보유 중인 주사위의 눈금을 입력합니다.</p>
              <p><strong>4. 최적 경로 계산:</strong> '최적 경로 계산' 버튼을 누르면, 입력한 주사위를 모두 사용했을 때 가장 많은 코인을 획득할 수 있는 순서를 찾아줍니다.</p>
              <p><strong>5. 결과 확인:</strong> 우측(또는 하단)에 표시된 추천 주사위 사용 순서에 따라 게임을 진행하세요!</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-800 text-xs leading-relaxed">
                * 시뮬레이션은 입력된 주사위 조합으로 도달할 수 있는 모든 경우의 수를 계산하여 최적의 결과를 도출합니다.<br/>
                * 칸 이동(예: 12번 칸으로 이동) 및 보너스 주사위 획득 효과도 모두 반영되어 계산됩니다.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
