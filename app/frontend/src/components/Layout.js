import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Calendar,
  FolderKanban,
  FileText,
  Dumbbell,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  Sparkles,
  Trophy,
  User,
  LogOut,
  Award,
  Users,
  Timer,
  Plug,
  MoreHorizontal
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const Layout = ({ children }) => {
  const { user: appUser, loading: appLoading } = useApp();
  const { user: authUser, logout, isGuest } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Determine effective user
  // If guest, we use the guest identity (name 'Invité') but overlying the local DB stats (xp, level)
  // If authenticated, we use the authUser (cloud data)
  const isGuestMode = isGuest || (!authUser && appUser); // Fallback: if no auth user but app user exists, treat as local/guest

  const user = isGuestMode
    ? { ...appUser, ...{ username: 'Invité', email: 'mode@hors-ligne' }, photoURL: null } // Merge local stats with Guest persona
    : authUser;

  const loading = appLoading;

  // Auto-close sidebar on mobile route change
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when location changes (mobile only)
  React.useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Full Menu Items List
  const allMenuItems = [
    { path: '/training', icon: Dumbbell, label: 'Entraînement', testId: 'nav-training', mobileOrder: 1 },
    { path: '/quests', icon: Target, label: 'Quêtes', testId: 'nav-quests', mobileOrder: 2 },
    { path: '/', icon: LayoutDashboard, label: 'Tableau de bord', testId: 'nav-dashboard', mobileOrder: 3, isCenter: true },
    { path: '/habits', icon: TrendingUp, label: 'Habitudes', testId: 'nav-habits', mobileOrder: 4 },
    { path: '/projects', icon: FolderKanban, label: 'Projets', testId: 'nav-projects', mobileOrder: 5 },
    // Secondary Items (Profile Menu)
    { path: '/agenda', icon: Calendar, label: 'Agenda', testId: 'nav-agenda', secondary: true },
    { path: '/notes', icon: FileText, label: 'Notes', testId: 'nav-notes', secondary: true },
    { path: '/analytics', icon: BarChart3, label: 'Analyses', testId: 'nav-analytics', secondary: true },
    { path: '/achievements', icon: Award, label: 'Succès', testId: 'nav-achievements', secondary: true },
    { path: '/leaderboard', icon: Users, label: 'Classement', testId: 'nav-leaderboard', secondary: true },
    { path: '/pomodoro', icon: Timer, label: 'Pomodoro', testId: 'nav-pomodoro', secondary: true },
    { path: '/integrations', icon: Plug, label: 'Intégrations', testId: 'nav-integrations', secondary: true },
    { path: '/settings', icon: SettingsIcon, label: 'Paramètres', testId: 'nav-settings', secondary: true }
  ];

  // Logic for Mobile Bottom Nav (Top 5 + Profile/More)
  const mobileNavItems = allMenuItems.filter(item => !item.secondary).sort((a, b) => a.mobileOrder - b.mobileOrder);
  const secondaryNavItems = allMenuItems.filter(item => item.secondary);
  // Logic for Desktop Sidebar (All items except maybe settings at bottom)
  const sidebarNavItems = allMenuItems;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-2xl text-primary font-bold">INITIUM...</div>
      </div>
    );
  }

  return (
    <div className="app-container flex min-h-screen bg-background text-foreground overflow-x-hidden relative" data-testid="app-layout">
      {/* Background Animated Blobs (Underwater Effect) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute -bottom-32 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen"></div>
      </div>

      {/* Main content wrapper to push content above background */}
      <div className="relative z-10 flex w-full h-full">

        {/* Mobile Bottom Navigation - CUSTOM ERGONOMICS */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-white/10 z-50 lg:hidden flex justify-between items-end px-4 pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.isCenter) {
              return (
                <div key={item.path} className="relative -top-6">
                  <Link
                    to={item.path}
                    className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30 border-4 border-background transition-transform active:scale-95 ${isActive ? 'scale-110' : ''}`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar (Desktop Only) */}
        <aside
          className={`hidden lg:flex fixed left-0 top-0 h-screen glass border-r-0 flex-col transition-all duration-300 z-40 
            ${sidebarOpen ? 'w-64' : 'w-20'}
          `}
          data-testid="sidebar"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between h-16">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in line-clamp-1">
                  INITIUM
                </span>
              )}
            </div>
          </div>

          {/* User Compact Profile */}
          <div className="px-3 py-4">
            <div className={`glass-card p-3 flex items-center gap-3 transition-all ${!sidebarOpen && 'justify-center p-2'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-primary">{user?.username?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate">{user?.username || 'Invité'}</p>
                  <p className="text-xs text-muted-foreground">Niveau {user?.level || 1}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative ${isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'fill-white/20' : ''}`} />
                  {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                  {/* Active Indicator Dot for collapsed mode */}
                  {!sidebarOpen && isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-white/5 space-y-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Button
              variant="ghost"
              onClick={logout}
              className={`w-full flex items-center gap-3 justify-start ${!sidebarOpen && 'justify-center'} text-destructive hover:text-destructive hover:bg-destructive/10`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Déconnexion</span>}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 min-h-screen flex flex-col mb-24 lg:mb-0
            lg:ml-[${sidebarOpen ? '256px' : '80px'}]
          `}
          style={{ marginLeft: window.innerWidth >= 1024 ? (sidebarOpen ? '16rem' : '5rem') : '0' }}
          data-testid="main-content"
        >
          {/* Mobile Header (Simplified + Profile Trigger) */}
          <div className="lg:hidden p-4 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                INITIUM
              </span>
            </div>

            {/* User Profile Trigger for Secondary Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary p-[1px] shadow-lg shadow-primary/20">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{user?.username?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l-white/10 bg-background/95 backdrop-blur-xl">
                <div className="flex flex-col h-full pt-6">
                  <div className="flex items-center gap-3 mb-6 p-4 glass-card">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2 px-2">Menu</h3>
                  <div className="space-y-1">
                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-foreground/80 hover:text-foreground"
                        >
                          <Icon className="w-5 h-5 text-primary" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-auto border-t border-white/10 pt-4">
                    <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
                      <LogOut className="w-5 h-5" />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Guest Banner */}
          {isGuestMode && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 px-4 py-2 text-xs text-center backdrop-blur-sm">
              <span className="font-bold text-amber-500">MODE INVITÉ</span> • Sauvegarde locale activée
            </div>
          )}

          <div className="p-4 md:p-8 flex-1 w-full max-w-[1600px] mx-auto animate-fade-in pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
