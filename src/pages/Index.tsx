import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import PlayerScreen from '@/components/PlayerScreen';
import HostScreen from '@/components/HostScreen';
import DisplayScreen from '@/components/DisplayScreen';

type Screen = 'menu' | 'player' | 'host' | 'display';

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');

  const mathFormulas = [
    'S = P / (1 - n·d)',
    'PV = FV / (1+r)ⁿ',
    'A = πr²',
    'E = mc²',
    'F = ma',
    'v = d/t',
    'P = W/t',
    'E = hf',
    'I = V/R',
    'W = Fd',
  ];

  const mathBg = Array(50).fill(0).map((_, i) => 
    mathFormulas[i % mathFormulas.length]
  ).join('  •  ');

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="math-bg whitespace-pre-wrap p-8">
        {mathBg}
      </div>

      <div className="relative z-10">
        {currentScreen === 'menu' && (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
            <h1 className="text-5xl md:text-7xl font-black text-primary mb-8 tracking-wider animate-fade-in">
              ВИКТОРИНА
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              <Button
                onClick={() => setCurrentScreen('player')}
                className="h-32 text-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name="Smartphone" size={40} />
                  <span>Игрок</span>
                </div>
              </Button>

              <Button
                onClick={() => setCurrentScreen('display')}
                className="h-32 text-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name="Monitor" size={40} />
                  <span>Общий экран</span>
                </div>
              </Button>

              <Button
                onClick={() => setCurrentScreen('host')}
                className="h-32 text-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name="Crown" size={40} />
                  <span>Ведущий</span>
                </div>
              </Button>
            </div>
          </div>
        )}

        {currentScreen === 'player' && <PlayerScreen onBack={() => setCurrentScreen('menu')} />}
        {currentScreen === 'host' && <HostScreen onBack={() => setCurrentScreen('menu')} />}
        {currentScreen === 'display' && <DisplayScreen onBack={() => setCurrentScreen('menu')} />}
      </div>
    </div>
  );
}
