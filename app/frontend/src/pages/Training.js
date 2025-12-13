import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import { 
  Dumbbell, 
  Plus, 
  Trash2,
  Timer,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Training = () => {
  const { addXP } = useApp();
  const [sessions, setSessions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    totalXP: 0,
    thisWeek: 0
  });
  const [formData, setFormData] = useState({
    type: 'Cardio',
    intensity: 'medium',
    duration: 30,
    notes: '',
    exercises: []
  });
  const emptyExercise = { name: '', type: '', duration: '', reps: '', sets: '', details: '' };

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await db.training.reverse().toArray();
      setSessions(data);

      // Calculate stats
      const totalMinutes = data.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalXP = data.reduce((sum, s) => sum + (s.xp || 0), 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeek = data.filter(s => new Date(s.date) >= weekAgo).length;

      setStats({
        totalSessions: data.length,
        totalMinutes,
        totalXP,
        thisWeek
      });
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.duration || formData.duration <= 0) {
      toast.error('Durée invalide');
      return;
    }
    if (formData.exercises.length === 0) {
      toast.error('Ajoutez au moins un exercice');
      return;
    }
    try {
      // Calculate XP based on duration and intensity
      const intensityMultiplier = {
        low: 0.8,
        medium: 1,
        high: 1.3
      };
      const xp = Math.round(formData.duration * intensityMultiplier[formData.intensity]);

      await db.training.add({
        id: `training-${Date.now()}`,
        ...formData,
        xp,
        date: new Date(),
        createdAt: new Date()
      });

      await addXP(xp, 'training');

      toast.success(`+${xp} XP! Session enregistrée!`);
      setIsOpen(false);
      setFormData({
        type: 'Cardio',
        intensity: 'medium',
        duration: 30,
        notes: '',
        exercises: []
      });
      loadSessions();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  // Gestion des exercices dynamiques
  const handleExerciseChange = (idx, field, value) => {
    const updated = formData.exercises.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex);
    setFormData({ ...formData, exercises: updated });
  };
  const handleAddExercise = () => {
    setFormData({ ...formData, exercises: [...formData.exercises, { ...emptyExercise }] });
  };
  const handleRemoveExercise = (idx) => {
    setFormData({ ...formData, exercises: formData.exercises.filter((_, i) => i !== idx) });
  };

  const handleDelete = async (id) => {
    try {
      await db.training.delete(id);
      toast.success('Session supprimée');
      loadSessions();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="training-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
            <Dumbbell className="w-10 h-10 text-primary" />
            Training
          </h1>
          <p className="text-foreground/60 text-lg">Suivez vos entraînements et performances</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-training-button">
              <Plus className="w-5 h-5" />
              Nouvelle session
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="create-training-dialog">
            <DialogHeader>
              <DialogTitle>Enregistrer une session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger data-testid="training-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                      <SelectItem value="Musculation">Musculation</SelectItem>
                      <SelectItem value="Yoga">Yoga</SelectItem>
                      <SelectItem value="Natation">Natation</SelectItem>
                      <SelectItem value="Course">Course</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Intensité</label>
                  <Select
                    value={formData.intensity}
                    onValueChange={(value) => setFormData({ ...formData, intensity: value })}
                  >
                    <SelectTrigger data-testid="training-intensity-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Légère</SelectItem>
                      <SelectItem value="medium">Modérée</SelectItem>
                      <SelectItem value="high">Intense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Durée (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  min={1}
                  data-testid="training-duration-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optionnel)</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Comment s'est passée la session?"
                  rows={3}
                  data-testid="training-notes-input"
                />
              </div>
              {/* Exercices */}
              <div className="space-y-2">
                <label className="text-sm font-medium mb-2 block">Exercices</label>
                {formData.exercises.map((ex, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 items-center mb-2">
                    <Input
                      placeholder="Nom"
                      value={ex.name}
                      onChange={e => handleExerciseChange(idx, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Type"
                      value={ex.type}
                      onChange={e => handleExerciseChange(idx, 'type', e.target.value)}
                    />
                    <Input
                      placeholder="Durée (min)"
                      type="number"
                      value={ex.duration}
                      onChange={e => handleExerciseChange(idx, 'duration', e.target.value)}
                    />
                    <Input
                      placeholder="Répétitions"
                      type="number"
                      value={ex.reps}
                      onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                    />
                    <Input
                      placeholder="Séries"
                      type="number"
                      value={ex.sets}
                      onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                    />
                    <Input
                      placeholder="Détails"
                      value={ex.details}
                      onChange={e => handleExerciseChange(idx, 'details', e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveExercise(idx)} title="Supprimer l'exercice">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddExercise} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Ajouter un exercice
                </Button>
              </div>
              <Button onClick={handleCreate} className="w-full" data-testid="submit-training-button">
                Enregistrer la session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-testid="training-stats">
        <div className="card-modern">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <p className="text-foreground/60 text-sm">Sessions totales</p>
          </div>
          <p className="text-3xl font-bold">{stats.totalSessions}</p>
        </div>
        <div className="card-modern">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Timer className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-foreground/60 text-sm">Temps total</p>
          </div>
          <p className="text-3xl font-bold">{stats.totalMinutes}</p>
          <p className="text-sm text-foreground/60">minutes</p>
        </div>
        <div className="card-modern">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Zap className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-foreground/60 text-sm">XP total</p>
          </div>
          <p className="text-3xl font-bold">{stats.totalXP}</p>
        </div>
        <div className="card-modern">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-foreground/60 text-sm">Cette semaine</p>
          </div>
          <p className="text-3xl font-bold">{stats.thisWeek}</p>
          <p className="text-sm text-foreground/60">sessions</p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="card-modern" data-testid="training-sessions-list">
        <h2 className="text-2xl font-bold mb-6">Historique des sessions</h2>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 bg-foreground/5 rounded-xl hover:bg-foreground/10 transition-colors"
              data-testid={`training-session-${session.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{session.type}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.intensity === 'high' ? 'bg-red-500/20 text-red-500' :
                      session.intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {session.intensity === 'high' ? 'Intense' :
                       session.intensity === 'medium' ? 'Modéré' : 'Léger'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                      <Zap className="w-3 h-3 inline mr-1" />
                      {session.xp} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-foreground/60">
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      {session.duration} min
                    </div>
                    <div>
                      {format(new Date(session.date), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-foreground/70 mt-2 italic">{session.notes}</p>
                  )}
                  {/* Affichage des exercices */}
                  {session.exercises && session.exercises.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-base mb-2">Exercices :</h4>
                      <div className="space-y-1">
                        {session.exercises.map((ex, idx) => (
                          <div key={idx} className="flex gap-2 text-sm items-center">
                            <span className="font-bold">{ex.name}</span>
                            <span className="px-2 py-1 rounded bg-primary/10 text-primary">{ex.type}</span>
                            {ex.duration && <span>{ex.duration} min</span>}
                            {ex.reps && <span>{ex.reps} reps</span>}
                            {ex.sets && <span>{ex.sets} séries</span>}
                            {ex.details && <span className="italic text-foreground/60">{ex.details}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  data-testid={`delete-training-${session.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-foreground/40 py-8">Aucune session enregistrée</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Training;
