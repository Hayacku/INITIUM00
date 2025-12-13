import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import { Link } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Flame,
  Trophy,
  Zap,
  ArrowRight,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';


const Dashboard = () => {
  const { user } = useApp();
  const [stats, setStats] = useState({
    activeQuests: 0,
    habitsStreak: 0,
    todayXP: 0,
    weekProgress: 0
  });
  const [recentQuests, setRecentQuests] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pinned, setPinned] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadPinned();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Stats
      const quests = await db.quests.where('status').equals('in_progress').toArray();
      const habits = await db.habits.toArray();
      const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

      const today = new Date().toDateString();
      const todayAnalytics = await db.analytics
        .where('date')
        .equals(new Date(today))
        .first();

      setStats({
        activeQuests: quests.length,
        habitsStreak: maxStreak,
        todayXP: todayAnalytics?.xpEarned || 0,
        weekProgress: 75
      });

      // Quêtes récentes
      const recent = await db.quests
        .orderBy('createdAt')
        .reverse()
        .limit(4)
        .toArray();
      setRecentQuests(recent);

      // Habitudes du jour
      setTodayHabits(habits.slice(0, 5));

      // Événements à venir
      const events = await db.events
        .where('startDate')
        .above(new Date())
        .limit(3)
        .toArray();
      setUpcomingEvents(events);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  // Gestion des éléments épinglés
  const loadPinned = async () => {
    const pins = await db.settings.get('dashboard_pinned');
    setPinned(pins?.value || []);
  };

  const handlePin = async (item) => {
    const pins = await db.settings.get('dashboard_pinned');
    let pinnedArr = pins?.value || [];
    // Empêche les doublons
    if (!pinnedArr.find((p) => p.id === item.id)) {
      pinnedArr = [...pinnedArr, item];
      await db.settings.put({ id: 'dashboard_pinned', key: 'dashboard_pinned', value: pinnedArr });
      setPinned(pinnedArr);
    }
  };

  const handleUnpin = async (id) => {
    const pins = await db.settings.get('dashboard_pinned');
    let pinnedArr = pins?.value || [];
    pinnedArr = pinnedArr.filter((p) => p.id !== id);
    await db.settings.put({ id: 'dashboard_pinned', key: 'dashboard_pinned', value: pinnedArr });
    setPinned(pinnedArr);
  };

  return (
    <div className="space-y-8 animate-fade-in" data-testid="dashboard-page">

      {/* Header + Pinned */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block" data-testid="dashboard-title">
          Bonjour, {user?.username} 👋
        </h1>
        <p className="text-foreground/60 text-lg">
          {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
        {pinned.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Épinglés</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinned.map((item) => (
                <div key={item.id} className="glass-card relative p-4 rounded-xl">
                  <button
                    onClick={() => handleUnpin(item.id)}
                    className="absolute top-2 right-2 px-2 py-1 bg-destructive text-white rounded text-xs hover:bg-destructive/80 transition-colors"
                  >Retirer</button>
                  <h3 className="font-semibold text-lg mb-1">{item.title || item.name}</h3>
                  {item.xp && <p className="text-primary font-bold">{item.xp} XP</p>}
                  {item.category && <p className="text-muted-foreground">{item.category}</p>}
                  {item.type && <p className="text-muted-foreground">{item.type}</p>}
                  {item.date && <p className="text-muted-foreground/60">{format(new Date(item.date), 'dd/MM/yyyy')}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid - Mobile Scrollable or Stacked */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x" data-testid="stats-grid">
        <div className="glass-card group p-4 md:p-6 rounded-xl hover:bg-primary/5 transition-all min-w-[150px] snap-center" data-testid="stat-active-quests">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">{stats.activeQuests}</p>
          <p className="text-muted-foreground text-xs md:text-sm">Quêtes actives</p>
        </div>

        <div className="glass-card group p-4 md:p-6 rounded-xl hover:bg-orange-500/5 transition-all min-w-[150px] snap-center" data-testid="stat-habits-streak">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            </div>
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">{stats.habitsStreak}</p>
          <p className="text-muted-foreground text-xs md:text-sm">Meilleure série</p>
        </div>

        <div className="glass-card group p-4 md:p-6 rounded-xl hover:bg-secondary/5 transition-all min-w-[150px] snap-center" data-testid="stat-today-xp">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold px-2 py-1 bg-green-500/20 text-green-500 rounded-full">
              +{stats.todayXP}
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">{stats.todayXP}</p>
          <p className="text-muted-foreground text-xs md:text-sm">XP aujourd'hui</p>
        </div>

        <div className="glass-card group p-4 md:p-6 rounded-xl hover:bg-green-500/5 transition-all min-w-[150px] snap-center" data-testid="stat-week-progress">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">{stats.weekProgress}%</p>
          <p className="text-muted-foreground text-xs md:text-sm">Semaine</p>
          <div className="h-1.5 md:h-2 w-full bg-secondary/20 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.weekProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid: Quests & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quêtes récentes */}
        <div className="glass-card p-5 md:p-6 rounded-xl" data-testid="recent-quests-widget">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              Quêtes
            </h2>
            <Link
              to="/quests"
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-xs md:text-sm font-medium"
            >
              Voir tout
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentQuests.map((quest) => (
              <div
                key={quest.id}
                className="group p-3 md:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer relative border border-white/5"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm md:text-base pr-6">{quest.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePin({ ...quest, type: 'quest' });
                    }}
                    className="md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-primary"
                    title="Épingler"
                  >
                    <Zap className="w-3 h-3 md:w-4 md:h-4 rotate-45" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`px-2 py-0.5 rounded-full ${quest.priority === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-secondary/20 text-secondary'}`}>
                    {quest.priority === 'high' ? 'Urgent' : quest.priority}
                  </span>
                  <span>•</span>
                  <span>{quest.xp} XP</span>
                </div>
                {quest.progress !== undefined && (
                  <div className="h-1 w-full bg-secondary/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${quest.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
            {recentQuests.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">Pas de quêtes en cours</div>
            )}
          </div>
        </div>

        {/* Habitudes du jour */}
        <div className="glass-card p-5 md:p-6 rounded-xl" data-testid="today-habits-widget">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              Habitudes
            </h2>
            <Link
              to="/habits"
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-xs md:text-sm font-medium"
            >
              Voir tout
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayHabits.map((habit) => (
              <div
                key={habit.id}
                className="group p-3 md:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors relative border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${habit.completed ? 'bg-green-500/20' : 'bg-primary/10'}`}>
                    <CheckCircle2 className={`w-4 h-4 md:w-5 md:h-5 ${habit.completed ? 'text-green-500' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">{habit.title}</h3>
                    <p className="text-xs text-muted-foreground">{habit.category}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePin({ ...habit, type: 'habit' });
                  }}
                  className="md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-primary"
                >
                  <Zap className="w-3 h-3 md:w-4 md:h-4 rotate-45" />
                </button>
              </div>
            ))}
            {todayHabits.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">Tout est fait !</div>
            )}
          </div>
        </div>
      </div>

      {/* Événements à venir (Simple List for Mobile) */}
      <div className="glass-card p-5 md:p-6 rounded-xl" data-testid="upcoming-events-widget">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Agenda
          </h2>
          <Link to="/agenda" className="text-primary text-xs md:text-sm font-medium">Voir tout</Link>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 items-center">
              <div className="flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg border border-primary/20 shrink-0">
                <span className="text-[10px] md:text-xs font-bold text-primary uppercase">{format(new Date(event.startDate), 'MMM', { locale: fr })}</span>
                <span className="text-sm md:text-lg font-bold text-primary">{format(new Date(event.startDate), 'd')}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm md:text-base line-clamp-1">{event.title}</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(event.startDate), 'HH:mm')} • {event.type}
                </div>
              </div>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-center text-muted-foreground py-6 text-sm">Rien de prévu cette semaine</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
