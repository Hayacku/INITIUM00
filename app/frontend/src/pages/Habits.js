import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import { 
  TrendingUp, 
  Plus, 
  Flame, 
  CheckCircle2, 
  Trash2,
  Trophy,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

const Habits = () => {
  const { addXP } = useApp();
  const [habits, setHabits] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Santé',
    frequency: 'daily',
    targetPerWeek: 7,
    xpPerCompletion: 25
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await db.habits.toArray();
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      await db.habits.add({
        id: `habit-${Date.now()}`,
        ...formData,
        streak: 0,
        bestStreak: 0,
        completedDates: [],
        createdAt: new Date()
      });

      toast.success('Habitude créée!');
      setIsOpen(false);
      setFormData({
        title: '',
        category: 'Santé',
        frequency: 'daily',
        targetPerWeek: 7,
        xpPerCompletion: 25
      });
      loadHabits();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleComplete = async (habit) => {
    try {
      const today = new Date().toDateString();
      const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
      
      let newStreak = habit.streak || 0;
      if (lastCompleted) {
        const daysDiff = differenceInDays(new Date(today), lastCompleted);
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        } else {
          toast.info('Déjà complété aujourd\'hui');
          return;
        }
      } else {
        newStreak = 1;
      }

      const bestStreak = Math.max(newStreak, habit.bestStreak || 0);

      await db.habits.update(habit.id, {
        streak: newStreak,
        bestStreak,
        lastCompleted: new Date()
      });

      await addXP(habit.xpPerCompletion, 'habit');

      // Analytics
      const analytics = await db.analytics.where('date').equals(new Date(today)).first();
      if (analytics) {
        await db.analytics.update(analytics.id, {
          habitsCompleted: (analytics.habitsCompleted || 0) + 1
        });
      }

      toast.success(`+${habit.xpPerCompletion} XP! 🔥 Série: ${newStreak}`);
      loadHabits();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await db.habits.delete(id);
      toast.success('Habitude supprimée');
      loadHabits();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };


  return (
    <div className="space-y-6 animate-fade-in" data-testid="habits-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-primary" />
            Habitudes
          </h1>
          <p className="text-foreground/60 text-lg">Construisez vos routines quotidiennes</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-habit-button">
              <Plus className="w-5 h-5" />
              Nouvelle habitude
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="create-habit-dialog">
            <DialogHeader>
              <DialogTitle>Créer une habitude</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titre *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Faire du sport"
                  data-testid="habit-title-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="habit-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Santé">Santé</SelectItem>
                      <SelectItem value="Apprentissage">Apprentissage</SelectItem>
                      <SelectItem value="Vie sociale">Vie sociale</SelectItem>
                      <SelectItem value="Créativité">Créativité</SelectItem>
                      <SelectItem value="Travail">Travail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fréquence</label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger data-testid="habit-frequency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Objectif/semaine</label>
                  <Input
                    type="number"
                    value={formData.targetPerWeek}
                    onChange={(e) => setFormData({ ...formData, targetPerWeek: parseInt(e.target.value) })}
                    min={1}
                    max={7}
                    data-testid="habit-target-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">XP par complétion</label>
                  <Input
                    type="number"
                    value={formData.xpPerCompletion}
                    onChange={(e) => setFormData({ ...formData, xpPerCompletion: parseInt(e.target.value) })}
                    data-testid="habit-xp-input"
                  />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full" data-testid="submit-habit-button">
                Créer l'habitude
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Dialog édition habitude */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent data-testid="edit-habit-dialog">
            <DialogHeader>
              <DialogTitle>Modifier l'habitude</DialogTitle>
            </DialogHeader>
            {editData && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Titre *</label>
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="Ex: Faire du sport"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Catégorie</label>
                    <Select
                      value={editData.category}
                      onValueChange={(value) => setEditData({ ...editData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Santé">Santé</SelectItem>
                        <SelectItem value="Apprentissage">Apprentissage</SelectItem>
                        <SelectItem value="Vie sociale">Vie sociale</SelectItem>
                        <SelectItem value="Créativité">Créativité</SelectItem>
                        <SelectItem value="Travail">Travail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fréquence</label>
                    <Select
                      value={editData.frequency}
                      onValueChange={(value) => setEditData({ ...editData, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidien</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Objectif/semaine</label>
                    <Input
                      type="number"
                      value={editData.targetPerWeek}
                      onChange={(e) => setEditData({ ...editData, targetPerWeek: parseInt(e.target.value) })}
                      min={1}
                      max={7}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">XP par complétion</label>
                    <Input
                      type="number"
                      value={editData.xpPerCompletion}
                      onChange={(e) => setEditData({ ...editData, xpPerCompletion: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    await db.habits.update(editData.id, {
                      title: editData.title,
                      category: editData.category,
                      frequency: editData.frequency,
                      targetPerWeek: editData.targetPerWeek,
                      xpPerCompletion: editData.xpPerCompletion
                    });
                    toast.success('Habitude modifiée');
                    setEditOpen(false);
                    setEditData(null);
                    loadHabits();
                  }}
                  className="w-full mt-2"
                >Enregistrer</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="habits-grid">
        {habits.map((habit) => {
          const isCompletedToday = habit.lastCompleted &&
            new Date(habit.lastCompleted).toDateString() === new Date().toDateString();

          return (
            <div
              key={habit.id}
              className={`card-modern ${
                isCompletedToday ? 'border-green-500/30 bg-green-500/5' : ''
              }`}
              data-testid={`habit-card-${habit.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{habit.title}</h3>
                  <p className="text-sm text-foreground/60">{habit.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setEditData(habit);
                      setEditOpen(true);
                    }}
                    title="Modifier"
                  >
                    <Plus className="w-5 h-5 text-primary" />
                  </Button>
                  {isCompletedToday ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <button
                      onClick={() => handleComplete(habit)}
                      className="p-2 hover:bg-green-500/20 rounded-full transition-colors"
                      data-testid={`complete-habit-${habit.id}`}
                    >
                      <CheckCircle2 className="w-8 h-8 text-foreground/30 hover:text-green-500" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Streak */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-foreground/60">Série actuelle</p>
                      <p className="text-2xl font-bold">{habit.streak || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground/60">Record</p>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <p className="font-bold">{habit.bestStreak || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Fréquence</span>
                  <span className="font-medium">
                    {habit.frequency === 'daily' ? 'Quotidien' : 'Hebdomadaire'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Objectif/semaine</span>
                  <span className="font-medium">{habit.targetPerWeek}x</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">XP par complétion</span>
                  <span className="font-bold text-primary">{habit.xpPerCompletion} XP</span>
                </div>

                {habit.lastCompleted && (
                  <div className="flex items-center gap-2 text-sm text-foreground/60 pt-2 border-t border-foreground/10">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Dernière fois: {format(new Date(habit.lastCompleted), 'dd/MM/yyyy')}</span>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(habit.id)}
                  className="w-full p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 mt-2"
                  data-testid={`delete-habit-${habit.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-20" data-testid="no-habits-message">
          <TrendingUp className="w-20 h-20 mx-auto text-foreground/20 mb-4" />
          <p className="text-xl text-foreground/40">Aucune habitude trouvée</p>
          <p className="text-foreground/30 mt-2">Créez votre première habitude pour commencer!</p>
        </div>
      )}
    </div>
  );
};

export default Habits;
