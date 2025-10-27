import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface HostScreenProps {
  onBack: () => void;
}

export default function HostScreen({ onBack }: HostScreenProps) {
  const [gameCode, setGameCode] = useState('');
  const [gameId, setGameId] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initGame = async () => {
      try {
        const game = await api.createGame();
        setGameCode(game.code);
        setGameId(game.game_id);
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать игру',
          variant: 'destructive',
        });
      }
    };

    initGame();
  }, [toast]);

  useEffect(() => {
    if (!gameCode) return;

    const interval = setInterval(async () => {
      try {
        const gameState = await api.getGameState(gameCode);
        setPlayers(gameState.players);
      } catch (error) {
        console.error('Failed to fetch game state:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [gameCode]);

  const updateScore = async (playerId: string, delta: number) => {
    try {
      await api.updateScore(playerId, delta);
      setPlayers(players.map(p => 
        p.id === playerId ? { ...p, score: p.score + delta } : p
      ));
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить счет',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-6 text-primary"
      >
        <Icon name="ArrowLeft" size={24} />
      </Button>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8 bg-card border-primary/30 shadow-xl shadow-primary/10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Код игры</h2>
            <div className="text-6xl font-black text-primary tracking-widest mb-4">
              {gameCode || '------'}
            </div>
            <p className="text-muted-foreground">Игроки используют этот код для подключения</p>
          </div>
        </Card>

        {players.length === 0 ? (
          <Card className="p-12 bg-muted/50 border-dashed border-2 border-primary/30">
            <div className="text-center text-muted-foreground">
              <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Ожидание игроков...</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {players.map((player) => (
              <Card key={player.id} className="p-6 bg-card border-primary/30 shadow-lg shadow-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{player.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => updateScore(player.id, -1)}
                      variant="outline"
                      size="lg"
                      className="w-14 h-14 text-2xl font-bold hover:bg-destructive hover:text-destructive-foreground"
                    >
                      −
                    </Button>
                    
                    <div className={`text-4xl font-black w-24 text-center ${
                      player.score > 0 ? 'text-primary' : 
                      player.score < 0 ? 'text-destructive' : 
                      'text-muted-foreground'
                    }`}>
                      {player.score}
                    </div>
                    
                    <Button
                      onClick={() => updateScore(player.id, 1)}
                      variant="outline"
                      size="lg"
                      className="w-14 h-14 text-2xl font-bold hover:bg-primary hover:text-primary-foreground"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
