import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import {
  Target,
  Plus,
  Zap,
  Calendar,
  Flag,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Quests = () => {
  const { addXP } = useApp();
  const [quests, setQuests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const [isStepOpen, setIsStepOpen] = useState(false);
  const [selectedQuestForStep, setSelectedQuestForStep] = useState(null);
  const [expandedQuests, setExpandedQuests] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Apprentissage',
    priority: 'medium',
    dueDate: '',
    xp: 50,
    effort: 'medium'
  });
  const [stepFormData, setStepFormData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    loadQuests();
  }, [filter]);

  const loadQuests = async () => {
    try {
      let query = db.quests.toCollection();
      if (filter !== 'all') {
        query = db.quests.where('status').equals(filter);
      }
      const data = await query.reverse().toArray();
      setQuests(data);
    } catch (error) {
      console.error('Error loading quests:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      await db.quests.add({
        id: `quest-${Date.now()}`,
        ...formData,
        status: 'active',
        progress: 0,
        steps: [],
        createdAt: new Date()
      });

      toast.success('Quête créée avec succès!');
      setIsOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Apprentissage',
        priority: 'medium',
        dueDate: '',
        xp: 50,
        effort: 'medium'
      });
      loadQuests();
    } catch (error) {
      toast.error('Erreur lors de la création');
      console.error(error);
    }
  };

  const handleAddStep = async () => {
    if (!stepFormData.title.trim() || !selectedQuestForStep) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      const quest = quests.find(q => q.id === selectedQuestForStep);
      const steps = quest.steps || [];

      steps.push({
        id: `step-${Date.now()}`,
        title: stepFormData.title,
        description: stepFormData.description,
        completed: false,
        createdAt: new Date()
      });

      await db.quests.update(selectedQuestForStep, { steps });

      toast.success('Étape ajoutée!');
      setIsStepOpen(false);
      setStepFormData({ title: '', description: '' });
      loadQuests();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleToggleStep = async (questId, stepId) => {
    try {
      const quest = quests.find(q => q.id === questId);
      const steps = quest.steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );

      const completedSteps = steps.filter(s => s.completed).length;
      const progress = Math.round((completedSteps / steps.length) * 100);

      await db.quests.update(questId, { steps, progress });

      if (completedSteps === steps.length && quest.status !== 'completed') {
        // Auto-complete quest if all steps are done
        toast.info('Toutes les étapes sont terminées ! Complétez la quête.');
      }

      loadQuests();
    } catch (error) {
      console.error(error);
    }
  };

  const handleComplete = async (quest) => {
    try {
      await db.quests.update(quest.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date()
      });

      await addXP(quest.xp, 'quest');

      const today = new Date().toDateString();
      const analytics = await db.analytics.where('date').equals(new Date(today)).first();
      if (analytics) {
        await db.analytics.update(analytics.id, {
          questsCompleted: (analytics.questsCompleted || 0) + 1
        });
      }

      toast.success(`+${quest.xp} XP! Quête complétée!`);
      loadQuests();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await db.quests.delete(id);
      toast.success('Quête supprimée');
      loadQuests();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const toggleQuestExpansion = (questId) => {
    setExpandedQuests(prev => ({
      ...prev,
      [questId]: !prev[questId]
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="quests-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-primary" />
            Quêtes
          </h1>
          <p className="text-foreground/60 text-lg">Gérez vos objectifs et missions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-quest-button">
              <Plus className="w-5 h-5" />
              Nouvelle quête
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="create-quest-dialog">
            <DialogHeader>
              <DialogTitle>Créer une quête</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titre *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de la quête"
                  data-testid="quest-title-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description..."
                  rows={3}
                  data-testid="quest-description-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="quest-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apprentissage">Apprentissage</SelectItem>
                      <SelectItem value="Santé">Santé</SelectItem>
                      <SelectItem value="Créativité">Créativité</SelectItem>
                      <SelectItem value="Travail">Travail</SelectItem>
                      <SelectItem value="Vie sociale">Vie sociale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priorité</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger data-testid="quest-priority-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date limite</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    data-testid="quest-duedate-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">XP</label>
                  <Input
                    type="number"
                    value={formData.xp}
                    onChange={(e) => setFormData({ ...formData, xp: parseInt(e.target.value) })}
                    data-testid="quest-xp-input"
                  />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full" data-testid="submit-quest-button">
                Créer la quête
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap" data-testid="quest-filters">
        {['all', 'active', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === status
                ? 'bg-primary text-white'
                : 'bg-foreground/5 hover:bg-foreground/10'
              }`}
            data-testid={`filter-${status}`}
          >
            {status === 'all' ? 'Toutes' :
              status === 'active' ? 'Actives' :
                status === 'in_progress' ? 'En cours' : 'Terminées'}
          </button>
        ))}
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="quests-grid">
        {quests.map((quest) => {
          const steps = quest.steps || [];
          const isExpanded = expandedQuests[quest.id];

          return (
            <div
              key={quest.id}
              className="glass-card p-6 rounded-xl group"
              data-testid={`quest-card-${quest.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{quest.title}</h3>
                  {quest.description && (
                    <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>
                  )}
                </div>
                {quest.status !== 'completed' && (
                  <button
                    onClick={() => handleComplete(quest)}
                    className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                    data-testid={`complete-quest-${quest.id}`}
                  >
                    <Circle className="w-5 h-5 text-green-500" />
                  </button>
                )}
                {quest.status === 'completed' && (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${quest.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                      quest.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-green-500/20 text-green-500'
                    }`}>
                    <Flag className="w-3 h-3 inline mr-1" />
                    {quest.priority}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    {quest.category}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                    <Zap className="w-3 h-3 inline mr-1" />
                    {quest.xp} XP
                  </span>
                </div>

                {quest.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(quest.dueDate), 'dd/MM/yyyy')}
                  </div>
                )}

                {/* Steps Section */}
                {steps.length > 0 && (
                  <div className="border-t border-white/10 pt-3">
                    <button
                      onClick={() => toggleQuestExpansion(quest.id)}
                      className="flex items-center gap-2 text-sm font-medium w-full hover:text-primary transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Étapes ({steps.filter(s => s.completed).length}/{steps.length})
                    </button>
                    {isExpanded && (
                      <div className="space-y-2 mt-3">
                        {steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"
                          >
                            <Checkbox
                              checked={step.completed}
                              onCheckedChange={() => handleToggleStep(quest.id, step.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${step.completed ? 'line-through text-muted-foreground' : ''
                                }`}>
                                {step.title}
                              </p>
                              {step.description && (
                                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                {quest.progress !== undefined && quest.status !== 'completed' && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-semibold">{quest.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${quest.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-white/10">
                  {quest.status !== 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedQuestForStep(quest.id);
                        setIsStepOpen(true);
                      }}
                      className="flex-1 p-2 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Étape
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(quest.id)}
                    className="flex-1 p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    data-testid={`delete-quest-${quest.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {quests.length === 0 && (
        <div className="text-center py-20" data-testid="no-quests-message">
          <Target className="w-20 h-20 mx-auto text-foreground/20 mb-4" />
          <p className="text-xl text-foreground/40">Aucune quête trouvée</p>
          <p className="text-foreground/30 mt-2">Créez votre première quête pour commencer!</p>
        </div>
      )}

      {/* Add Step Dialog */}
      <Dialog open={isStepOpen} onOpenChange={setIsStepOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une étape</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Titre de l'étape *</label>
              <Input
                value={stepFormData.title}
                onChange={(e) => setStepFormData({ ...stepFormData, title: e.target.value })}
                placeholder="Ex: Lire le chapitre 1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optionnel)</label>
              <Textarea
                value={stepFormData.description}
                onChange={(e) => setStepFormData({ ...stepFormData, description: e.target.value })}
                placeholder="Détails de l'étape..."
                rows={2}
              />
            </div>
            <Button onClick={handleAddStep} className="w-full">
              Ajouter l'étape
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quests;
