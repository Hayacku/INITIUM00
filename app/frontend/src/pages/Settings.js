import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import {
  Settings as SettingsIcon,
  Palette,
  User,
  Download,
  Upload,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import ThemePicker from '../components/ThemePicker';
import CloudSyncPanel from '../components/CloudSyncPanel';
import APIKeyManager from '../components/APIKeyManager';
import { applyTheme } from '../lib/themes';

const Settings = () => {
  const { user, setUser, theme, changeTheme } = useApp();
  const [username, setUsername] = useState('');
  const [settings, setSettings] = useState({
    animations: true,
    haptics: true,
    typography: 'inter'
  });
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const animationsSetting = await db.settings.get('animations');
      const hapticsSetting = await db.settings.get('haptics');
      const typographySetting = await db.settings.get('typography');
      setSettings({
        animations: animationsSetting?.value === 'true',
        haptics: hapticsSetting?.value === 'true',
        typography: typographySetting?.value || 'inter'
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    try {
      await db.users.update(user.id, { username });
      setUser({ ...user, username });
      toast.success('Nom mis à jour!');
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleToggleSetting = async (key, value) => {
    try {
      await db.settings.put({ id: key, key, value: value.toString() });
      setSettings({ ...settings, [key]: value });
      toast.success('Paramètre mis à jour');
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleTypographyChange = async (value) => {
    await handleToggleSetting('typography', value);
  };

  const handleProfilePicUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setProfilePic(dataUrl);
      await db.users.update(user.id, { profilePic: dataUrl });
      setUser({ ...user, profilePic: dataUrl });
      toast.success('Photo de profil mise à jour!');
    };
    reader.readAsDataURL(file);
  };

  const handleExportData = async () => {
    try {
      const data = {
        users: await db.users.toArray(),
        quests: await db.quests.toArray(),
        habits: await db.habits.toArray(),
        projects: await db.projects.toArray(),
        tasks: await db.tasks.toArray(),
        notes: await db.notes.toArray(),
        training: await db.training.toArray(),
        events: await db.events.toArray(),
        analytics: await db.analytics.toArray(),
        settings: await db.settings.toArray(),
        badges: await db.badges.toArray()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `initium-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Données exportées!');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error(error);
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Clear existing data
      await db.users.clear();
      await db.quests.clear();
      await db.habits.clear();
      await db.projects.clear();
      await db.tasks.clear();
      await db.notes.clear();
      await db.training.clear();
      await db.events.clear();
      await db.analytics.clear();
      await db.badges.clear();

      // Import new data
      if (data.users) await db.users.bulkAdd(data.users);
      if (data.quests) await db.quests.bulkAdd(data.quests);
      if (data.habits) await db.habits.bulkAdd(data.habits);
      if (data.projects) await db.projects.bulkAdd(data.projects);
      if (data.tasks) await db.tasks.bulkAdd(data.tasks);
      if (data.notes) await db.notes.bulkAdd(data.notes);
      if (data.training) await db.training.bulkAdd(data.training);
      if (data.events) await db.events.bulkAdd(data.events);
      if (data.analytics) await db.analytics.bulkAdd(data.analytics);
      if (data.badges) await db.badges.bulkAdd(data.badges);

      toast.success('Données importées! Rechargement...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Erreur lors de l\'import');
      console.error(error);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer toutes les données? Cette action est irréversible.')) {
      return;
    }

    try {
      await db.users.clear();
      await db.quests.clear();
      await db.habits.clear();
      await db.projects.clear();
      await db.tasks.clear();
      await db.notes.clear();
      await db.training.clear();
      await db.events.clear();
      await db.analytics.clear();
      await db.badges.clear();

      toast.success('Toutes les données ont été supprimées. Rechargement...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const themes = [
    { name: 'violet', label: 'Violet', color: 'hsl(266 100% 60%)' },
    { name: 'bleu', label: 'Bleu', color: 'hsl(210 100% 55%)' },
    { name: 'noir', label: 'Noir', color: 'hsl(0 0% 20%)' },
    { name: 'blanc', label: 'Blanc', color: 'hsl(0 0% 98%)' },
    { name: 'vert', label: 'Vert', color: 'hsl(142 76% 45%)' },
    { name: 'rouge', label: 'Rouge', color: 'hsl(0 72% 55%)' },
    { name: 'jaune', label: 'Jaune', color: 'hsl(45 93% 55%)' }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
          <SettingsIcon className="w-10 h-10 text-primary" />
          Paramètres
        </h1>
        <p className="text-foreground/60 text-lg">Personnalisez votre expérience</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6" data-testid="profile-settings">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Profil
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative group">
              <img
                src={profilePic || 'https://ui-avatars.com/api/?name=U'}
                alt="Photo de profil"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary group-hover:scale-105 transition-transform"
                data-testid="profile-pic"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                className="absolute left-0 top-0 w-16 h-16 opacity-0 cursor-pointer"
                title="Changer la photo de profil"
                data-testid="profile-pic-upload"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="username" className="text-muted-foreground">Nom d'utilisateur</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom"
                  className="bg-white/5 border-white/10"
                  data-testid="username-input"
                />
                <Button onClick={handleUpdateUsername} data-testid="update-username-button" size="icon">
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          {user && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
              <div>
                <p className="text-sm text-muted-foreground">Niveau</p>
                <p className="text-2xl font-bold text-primary">{user.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">XP Total</p>
                <p className="text-2xl font-bold">{user.xp}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Themes */}
      <ThemePicker
        currentTheme={theme}
        onThemeChange={(newTheme) => {
          changeTheme(newTheme);
          applyTheme(newTheme);
        }}
      />

      {/* Cloud Sync */}
      <CloudSyncPanel />

      {/* API Keys */}
      <APIKeyManager />

      {/* Preferences */}
      <div className="glass-card p-6" data-testid="preferences-settings">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Préférences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <div>
              <Label htmlFor="animations" className="text-base cursor-pointer">Animations</Label>
              <p className="text-sm text-muted-foreground mt-1">Activer les animations fluides de l'interface</p>
            </div>
            <Switch
              id="animations"
              checked={settings.animations}
              onCheckedChange={(checked) => handleToggleSetting('animations', checked)}
              data-testid="animations-toggle"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <div>
              <Label htmlFor="haptics" className="text-base cursor-pointer">Retour haptique</Label>
              <p className="text-sm text-muted-foreground mt-1">Vibrations lors des interactions (Mobile)</p>
            </div>
            <Switch
              id="haptics"
              checked={settings.haptics}
              onCheckedChange={(checked) => handleToggleSetting('haptics', checked)}
              data-testid="haptics-toggle"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <div>
              <Label htmlFor="typography" className="text-base cursor-pointer">Typographie</Label>
              <p className="text-sm text-muted-foreground mt-1">Police d'affichage principale</p>
            </div>
            <select
              id="typography"
              value={settings.typography}
              onChange={e => handleTypographyChange(e.target.value)}
              className="p-2 rounded-lg border bg-background text-foreground border-white/10"
              data-testid="typography-select"
            >
              <option value="inter">Inter (Standard)</option>
              <option value="space-grotesk">Space Grotesk (Moderne)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6" data-testid="data-management-settings">
        <h2 className="text-2xl font-bold mb-6 text-destructive">Zone de Danger</h2>
        <div className="space-y-3">
          <Button
            onClick={handleExportData}
            className="w-full gap-2 justify-start bg-white/5 border border-white/10 hover:bg-white/10"
            variant="outline"
            data-testid="export-data-button"
          >
            <Download className="w-5 h-5" />
            Exporter toutes les données (Backup)
          </Button>
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              id="import-file"
              data-testid="import-file-input"
            />
            <Button
              onClick={() => document.getElementById('import-file').click()}
              className="w-full gap-2 justify-start bg-white/5 border border-white/10 hover:bg-white/10"
              variant="outline"
              data-testid="import-data-button"
            >
              <Upload className="w-5 h-5" />
              Importer des données
            </Button>
          </div>
          <Button
            onClick={handleClearAllData}
            className="w-full gap-2 justify-start hover:bg-destructive/90"
            variant="destructive"
            data-testid="clear-data-button"
          >
            <Trash2 className="w-5 h-5" />
            Supprimer toutes les données
          </Button>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-6" data-testid="about-section">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          À propos
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-foreground font-medium">
            <strong>INITIUM NEXT</strong> v1.0.0
          </p>
          <p className="text-muted-foreground mt-2">
            Votre second cerveau numérique pour maximiser productivité et croissance personnelle.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
