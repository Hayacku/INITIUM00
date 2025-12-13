import React from 'react';
import { useCloudSync } from '../hooks/useCloudSyncNew';
import { Button } from './ui/button';
import { Cloud, CloudOff, RefreshCw, Upload, Download, Loader2, CheckCircle, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CloudSyncPanel = () => {
  const { isAuthenticated } = useAuth();
  const { syncing, lastSync, syncAll, migrateToCloud } = useCloudSync();

  if (!isAuthenticated) {
    return (
      <div className="glass-card p-6 border-destructive/20 bg-destructive/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-3 opacity-10">
          <CloudOff className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-destructive-foreground">
            <CloudOff className="h-5 w-5" />
            Hors Ligne
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connectez-vous pour synchroniser vos données et y accéder depuis tous vos appareils.
          </p>
          <div className="text-xs bg-black/20 p-2 rounded inline-block text-muted-foreground">
            Vos données actuelles sont stockées localement (Mode Invité).
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-all pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              Cloud Sync
            </h3>
            <p className="text-sm text-muted-foreground">Sauvegarde automatique & multi-appareils</p>
          </div>

          {/* Status Indicator */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${syncing
            ? 'bg-primary/20 border-primary/50 text-white animate-pulse'
            : lastSync
              ? 'bg-green-500/20 border-green-500/30 text-green-500'
              : 'bg-white/5 border-white/10 text-muted-foreground'
            }`}>
            {syncing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Synchronisation...
              </>
            ) : lastSync ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Sync: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </>
            ) : (
              'En attente'
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sync Button */}
          <Button
            onClick={syncAll}
            disabled={syncing}
            className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-primary/20 hover:bg-primary/30 text-white border border-primary/20"
            variant="ghost"
          >
            <RefreshCw className={`h-6 w-6 ${syncing ? 'animate-spin' : ''}`} />
            <div className="text-center">
              <span className="block font-bold">Synchroniser tout</span>
              <span className="text-[10px] opacity-70">Envoyer & Recevoir</span>
            </div>
          </Button>

          {/* Migration Button */}
          <Button
            onClick={migrateToCloud}
            disabled={syncing}
            className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/5"
            variant="ghost"
          >
            <Upload className="h-6 w-6" />
            <div className="text-center">
              <span className="block font-bold">Sauvegarde Forcée</span>
              <span className="text-[10px] opacity-70">Migrer données locales VERS Cloud</span>
            </div>
          </Button>
        </div>

        {/* Devices Info */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>Données accessibles sur mobile & desktop</span>
          </div>
          {lastSync && (
            <span>Dern. maj: {lastSync.toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudSyncPanel;
