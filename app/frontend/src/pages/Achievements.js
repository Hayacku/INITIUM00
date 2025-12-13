import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Trophy, Lock, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { GUEST_ACHIEVEMENTS } from '../constants/achievements';
import { db } from '../lib/db';

const Achievements = () => {
  const { api, isGuest } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [stats, setStats] = useState({ unlocked: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [isGuest]); // Reload if auth state changes

  const loadAchievements = async () => {
    try {
      if (isGuest) {
        // Guest functionality: Load constants + Local DB badges interactions

        // Simulating unlocked items for guest based on local checks (could be expanded)
        // For now, let's say "Premier Pas" is unlocked if they are here.
        const localBadges = await db.badges.toArray();
        const unlocked = localBadges.map(b => b.id); // This might not match exactly if IDs differ, but for demo:

        // Let's ensure at least one is unlocked for the demo feeling
        const guestUnlocked = ['guest-1'];

        setAchievements(GUEST_ACHIEVEMENTS);
        setUnlockedIds(guestUnlocked);
        setStats({ unlocked: guestUnlocked.length, total: GUEST_ACHIEVEMENTS.length });

      } else {
        // Authenticated functionality
        const [allRes, myRes] = await Promise.all([
          api.get('/gamification/achievements'),
          api.get('/gamification/my-achievements')
        ]);

        setAchievements(allRes.data);
        setUnlockedIds(myRes.data.unlocked.map(a => a.achievement_id));
        setStats({ unlocked: myRes.data.unlocked.length, total: myRes.data.total });
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Erreur lors du chargement des succès');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-slate-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-amber-500'
    };
    return colors[rarity] || 'bg-slate-500';
  };

  const getRarityLabel = (rarity) => {
    const labels = {
      common: 'Commun',
      rare: 'Rare',
      epic: 'Épique',
      legendary: 'Légendaire'
    };
    return labels[rarity] || rarity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="achievements-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block">Succès</h1>
          <p className="text-muted-foreground mt-2">Débloquez des récompenses en accomplissant des défis</p>
        </div>
        <div className="glass p-4 rounded-xl flex items-center gap-4 min-w-[200px]">
          <div className="flex-1">
            <div className="text-sm font-medium text-muted-foreground mb-1">Progression</div>
            <div className="text-2xl font-bold">
              {stats.unlocked} <span className="text-muted-foreground text-base font-normal">/ {stats.total}</span>
            </div>
            <Progress value={(stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0)} className="h-2 mt-2" />
          </div>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const isSecret = achievement.secret && !isUnlocked;

          return (
            <Card
              key={achievement.id}
              className={`glass-card border-0 ${!isUnlocked && 'opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-background/50 backdrop-blur-sm ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isSecret ? <Lock className="h-8 w-8" /> : achievement.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {isSecret ? '???' : achievement.name}
                      </CardTitle>
                      <Badge variant="secondary" className={`${getRarityColor(achievement.rarity)} text-white mt-1.5 border-0`}>
                        {getRarityLabel(achievement.rarity)}
                      </Badge>
                    </div>
                  </div>
                  {isUnlocked && <Trophy className="h-5 w-5 text-yellow-500 animate-pulse" />}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-sm leading-relaxed">
                  {isSecret ? 'Ce succès est secret. Continuez à explorer pour le découvrir.' : achievement.description}
                </CardDescription>
                {!isSecret && (
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground bg-background/30 p-2 rounded-lg">
                    {achievement.reward_xp > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{achievement.reward_xp} XP</span>
                      </div>
                    )}
                    {achievement.reward_coins > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-blue-400 fill-blue-400" />
                        <span>{achievement.reward_coins} pièces</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
