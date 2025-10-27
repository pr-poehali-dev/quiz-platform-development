import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface PlayerScreenProps {
  onBack: () => void;
}

export default function PlayerScreen({ onBack }: PlayerScreenProps) {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleJoinGame = async () => {
    if (gameCode.length === 6 && playerName.trim()) {
      try {
        const result = await api.joinGame(gameCode, playerName);
        setPlayerId(result.player_id);
        setIsJoined(true);
        toast({
          title: "Подключено!",
          description: `Добро пожаловать, ${playerName}!`,
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось подключиться к игре. Проверьте код.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Ошибка",
        description: "Введите код игры и имя",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Запись началась",
        description: "Говорите в микрофон",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить доступ к микрофону",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Запись остановлена",
        description: "Нажмите кнопку воспроизведения",
      });
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  if (!isJoined) {
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

            <div>
              <label className="text-sm font-medium mb-2 block">Ваше имя</label>
              <Input
                placeholder="Введите имя"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-xl bg-muted border-primary/30"
              />
            </div>

            <Button
              onClick={handleJoinGame}
              className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90"
            >
              Войти в игру
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-primary mb-2">{playerName}</h2>
          <p className="text-muted-foreground">Код: {gameCode}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-muted rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 text-center">Запись ответа</h3>
            
            <div className="flex flex-col gap-4">
              {!isRecording && !audioUrl && (
                <Button
                  onClick={startRecording}
                  className="w-full h-20 text-xl font-bold bg-primary hover:bg-primary/90"
                >
                  <Icon name="Mic" size={32} className="mr-2" />
                  Начать запись
                </Button>
              )}

              {isRecording && (
                <Button
                  onClick={stopRecording}
                  className="w-full h-20 text-xl font-bold bg-destructive hover:bg-destructive/90 animate-pulse"
                >
                  <Icon name="Square" size={32} className="mr-2" />
                  Остановить запись
                </Button>
              )}

              {audioUrl && (
                <div className="space-y-4">
                  <Button
                    onClick={playAudio}
                    className="w-full h-20 text-xl font-bold bg-primary hover:bg-primary/90"
                  >
                    <Icon name="Play" size={32} className="mr-2" />
                    Воспроизвести
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setAudioUrl(null);
                      audioChunksRef.current = [];
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Записать заново
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}