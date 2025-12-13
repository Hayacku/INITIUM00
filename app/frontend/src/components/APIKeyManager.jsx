import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const APIKeyManager = () => {
    const { api, isAuthenticated } = useAuth();
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newKey, setNewKey] = useState(null);
    const [keyName, setKeyName] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadKeys();
        }
    }, [isAuthenticated]);

    const loadKeys = async () => {
        try {
            const response = await api.get('/auth/api-keys');
            setKeys(response.data.api_keys);
        } catch (error) {
            console.error('Failed to load keys:', error);
        }
    };

    const createKey = async () => {
        if (!keyName.trim()) return;
        setLoading(true);
        try {
            const response = await api.post('/auth/api-keys', { name: keyName });
            setNewKey(response.data);
            setKeyName('');
            loadKeys();
            toast.success('Clé API générée avec succès !');
        } catch (error) {
            toast.error('Erreur lors de la génération de la clé');
        } finally {
            setLoading(false);
        }
    };

    const revokeKey = async (prefix) => {
        if (!window.confirm('Êtes-vous sûr de vouloir révoquer cette clé ? Cette action est irréversible.')) return;
        try {
            await api.delete(`/auth/api-keys/${prefix}`);
            setKeys(keys.filter(k => k.prefix !== prefix));
            toast.success('Clé révoquée');
        } catch (error) {
            toast.error('Erreur lors de la révocation');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copié dans le presse-papier');
    };

    if (!isAuthenticated) return null;

    return (
        <div className="glass-card p-6 relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <Key className="h-5 w-5 text-primary" />
                    Clés d'API
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Gérez vos clés d'accès pour l'intégration avec des outils tiers ou pour le développement.
                </p>

                {/* New Key Display */}
                {newKey && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl relative animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-bold text-green-500 mb-1">Clé générée !</h4>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Copiez cette clé maintenant. Elle ne sera plus jamais affichée en entier.
                                </p>
                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded border border-white/5">
                                    <code className="text-sm font-mono flex-1 break-all">{newKey.key}</code>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newKey.key)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setNewKey(null)}>
                                <Check className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Create Key Form */}
                <div className="flex gap-2 mb-6">
                    <Input
                        placeholder="Nom de la clé (ex: Integration Zapier)"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        className="bg-white/5 border-white/10"
                    />
                    <Button onClick={createKey} disabled={loading || !keyName.trim()}>
                        {loading ? '...' : <Plus className="w-4 h-4" />}
                        <span className="ml-2 hidden sm:inline">Générer</span>
                    </Button>
                </div>

                {/* Keys List */}
                <div className="space-y-2">
                    {keys.map((key) => (
                        <div key={key.prefix} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Key className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{key.name}</div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        {key.prefix}••••••••••••••••
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                    Créée le {new Date(key.created_at).toLocaleDateString()}
                                </span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => revokeKey(key.prefix)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {keys.length === 0 && !newKey && (
                        <p className="text-center text-muted-foreground text-sm py-4 italic">
                            Aucune clé active.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default APIKeyManager;
