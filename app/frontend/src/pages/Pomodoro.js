import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Timer, Play, Pause, SkipForward, Coffee, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const Pomodoro = () => {
  const { api } = useAuth();
  const [mode, setMode] = useState('work'); // work, short_break, long_break
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [stats, setStats] = useState({ total_sessions: 0, completed_sessions: 0, completion_rate: 0 });

  const durations = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && sessionId) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const loadStats = async () => {
    try {
      const res = await api.get('/pomodoro/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const startSession = async () => {
    try {
      const res = await api.post('/pomodoro/start', {
        duration: durations[mode] / 60,
        session_type: mode
      });
      
      setSessionId(res.data.session_id);
      setIsRunning(true);
      toast.success('Session démarrée !');
    } catch (error) {
      toast.error('Erreur lors du démarrage');
    }
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    
    try {
      const res = await api.post(`/pomodoro/complete/${sessionId}`);
      toast.success(`Session terminée ! +${res.data.xp_earned} XP`);
      setIsRunning(false);
      loadStats();
      
      // Auto-switch to break
      if (mode === 'work') {
        setMode('short_break');
        setTimeLeft(durations.short_break);
      }
    } catch (error) {
      toast.error('Erreur lors de la complétion');
    }
  };

  const toggleTimer = () => {
    if (!isRunning && !sessionId) {
      startSession();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
    setSessionId(null);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
    setSessionId(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="pomodoro-page">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Mode Focus - Pomodoro</h1>
        <p className="text-muted-foreground mt-2">Technique Pomodoro pour maximiser votre concentration</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === 'work' ? 'default' : 'outline'}
          onClick={() => switchMode('work')}
          disabled={isRunning}
        >
          <Briefcase className="mr-2 h-4 w-4" />
          Travail (25min)
        </Button>
        <Button
          variant={mode === 'short_break' ? 'default' : 'outline'}
          onClick={() => switchMode('short_break')}
          disabled={isRunning}
        >
          <Coffee className="mr-2 h-4 w-4" />
          Pause (5min)
        </Button>
        <Button
          variant={mode === 'long_break' ? 'default' : 'outline'}
          onClick={() => switchMode('long_break')}
          disabled={isRunning}
        >
          <Coffee className="mr-2 h-4 w-4" />
          Longue pause (15min)
        </Button>
      </div>

      {/* Timer */}
      <Card className="border-2 border-primary">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-8">
            <div className="text-8xl font-mono font-bold">
              {formatTime(timeLeft)}
            </div>
            
            <Progress value={progress} className="h-4" />
            
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="w-32"
              >
                {isRunning ? (
                  <><Pause className="mr-2 h-5 w-5" /> Pause</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" /> Start</>
                )}
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
              >
                <SkipForward className="mr-2 h-5 w-5" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sessions totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total_sessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.completed_sessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taux de complétion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completion_rate.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pomodoro;
