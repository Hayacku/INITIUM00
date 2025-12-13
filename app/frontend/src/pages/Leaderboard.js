import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Crown, TrendingUp, Medal } from 'lucide-react';
import { toast } from 'sonner';

const Leaderboard = () => {
  const { api, user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const [leaderRes, rankRes] = await Promise.all([
        api.get('/gamification/leaderboard?limit=100'),
        api.get('/gamification/my-rank')
      ]);

      setLeaderboard(leaderRes.data.leaderboard);
      setMyRank(rankRes.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Erreur lors du chargement du classement');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-background';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6" data-testid="leaderboard-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Classement Global</h1>
          <p className="text-muted-foreground mt-2">Top 100 des utilisateurs les plus actifs</p>
        </div>
        <TrendingUp className="h-12 w-12 text-primary" />
      </div>

      {/* My Rank Card */}
      {myRank && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">#{myRank.rank}</div>
                <div>
                  <div className="font-semibold">{myRank.username}</div>
                  <div className="text-sm text-muted-foreground">
                    Niveau {myRank.level} • {myRank.xp.toLocaleString()} XP
                  </div>
                </div>
              </div>
              <Badge variant="secondary">Votre rang</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top 100</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.user_id === user?.id;
              
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    getRankColor(entry.rank)
                  } ${
                    isCurrentUser ? 'ring-2 ring-primary' : ''
                  } transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(entry.rank) || (
                        <span className="text-xl font-bold">#{entry.rank}</span>
                      )}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatar_url} />
                      <AvatarFallback>
                        {entry.username[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {entry.username}
                        {isCurrentUser && <Badge className="ml-2" variant="outline">Vous</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Niveau {entry.level}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{entry.total_xp.toLocaleString()} XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
