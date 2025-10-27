import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface DisplayScreenProps {
  onBack: () => void;
}

export default function DisplayScreen({ onBack }: DisplayScreenProps) {
  const [gameCode, setGameCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!isConnected || !gameCode) return;

    const interval = setInterval(async () => {
      try {
        const gameState = await api.getGameState(gameCode);
        setPlayers(gameState.players);
      } catch (error) {
        console.error('Failed to fetch game state:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected, gameCode]);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="absolute top-6 left-6 text-primary"
        >
          <Icon name="ArrowLeft" size={24} />
        </Button>

        <Card className="w-full max-w-md p-8 bg-card border-primary/30 shadow-xl shadow-primary/10">
          <h2 className="text-3xl font-bold text-primary mb-6 text-center">Подключение к игре</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Код игры</label>
              <Input
                placeholder="000000"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase().slice(0, 6))}
                className="text-center text-3xl font-bold tracking-widest bg-muted border-primary/30"
                maxLength={6}
              />
            </div>

            <Button
              onClick={() => setIsConnected(true)}
              className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90"
              disabled={gameCode.length !== 6}
            >
              Подключиться
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative">
      <Button
        onClick={onBack}
        variant="ghost"
        className="absolute top-6 left-6 z-20 text-primary opacity-50 hover:opacity-100"
      >
        <Icon name="ArrowLeft" size={24} />
      </Button>

      <div className="max-w-6xl mx-auto pt-20">
        <h1 className="text-6xl font-black text-primary text-center mb-12 tracking-wider">
          ЛИДЕРБОРД
        </h1>

        <div className="space-y-6">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className="bg-primary rounded-3xl p-8 shadow-2xl shadow-primary/30 transition-all duration-500 hover:scale-[1.02]"
              style={{
                animation: 'fade-in 0.5s ease-out',
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <span className="text-3xl font-black text-primary-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <h2 className="text-5xl font-black text-primary-foreground tracking-wide">
                    {player.name}
                  </h2>
                </div>
                
                <div className="text-6xl font-black text-primary-foreground">
                  {player.score}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedPlayers.length === 0 && (
          <div className="text-center py-20">
            <Icon name="Users" size={80} className="mx-auto mb-6 opacity-30" />
            <p className="text-2xl text-muted-foreground">Игроки еще не подключились</p>
          </div>
        )}
      </div>
    </div>
  );
}
