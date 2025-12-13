import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, Circle, Plug } from 'lucide-react';
import { toast } from 'sonner';

const Integrations = () => {
  const { api } = useAuth();
  const [available, setAvailable] = useState([]);
  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const [availRes, connRes] = await Promise.all([
        api.get('/integrations/available'),
        api.get('/integrations/connected')
      ]);

      setAvailable(availRes.data.integrations);
      setConnected(connRes.data.integrations.map(i => i.provider));
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error('Erreur lors du chargement des intégrations');
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (provider) => {
    try {
      const res = await api.post(`/integrations/connect/${provider}`);
      toast.success(res.data.message);
      loadIntegrations();
    } catch (error) {
      toast.error('Erreur lors de la connexion');
    }
  };

  const isConnected = (providerId) => connected.includes(providerId);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6" data-testid="integrations-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Intégrations</h1>
          <p className="text-muted-foreground mt-2">Connectez vos applications favorites</p>
        </div>
        <Plug className="h-12 w-12 text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {available.map((integration) => {
          const connected = isConnected(integration.id);
          
          return (
            <Card key={integration.id} className={connected ? 'border-green-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{integration.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      {integration.status === 'mock' && (
                        <Badge variant="secondary" className="mt-1">Mock</Badge>
                      )}
                    </div>
                  </div>
                  {connected ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {integration.id === 'google_calendar' && 'Synchronisez vos quêtes avec Google Calendar'}
                  {integration.id === 'notion' && 'Importez vos pages Notion'}
                  {integration.id === 'spotify' && 'Playlists adaptées à votre mood'}
                  {integration.id === 'strava' && 'Sync automatique de vos activités'}
                  {integration.id === 'todoist' && 'Importez vos tâches Todoist'}
                  {integration.id === 'trello' && 'Sync avec vos boards Trello'}
                </CardDescription>
                
                {connected ? (
                  <Button variant="outline" className="w-full" disabled>
                    Connecté
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => connectIntegration(integration.id)}
                  >
                    Connecter
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Mode Mock</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les intégrations sont actuellement en mode mock pour démonstration. 
            Pour activer les vraies intégrations, configurez les API keys dans les paramètres.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Integrations;
