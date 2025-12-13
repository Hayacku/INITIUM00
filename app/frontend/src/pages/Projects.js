import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { 
  FolderKanban, 
  Plus, 
  Trash2,
  CheckCircle2,
  Circle,
  MoreVertical
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    targetDate: ''
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    projectId: ''
  });

  useEffect(() => {
    loadProjects();
    loadTasks();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await db.projects.toArray();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await db.tasks.toArray();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!projectForm.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      const newProject = {
        id: `project-${Date.now()}`,
        ...projectForm,
        status: 'planning',
        progress: 0,
        startDate: new Date(),
        createdAt: new Date()
      };

      await db.projects.add(newProject);
      toast.success('Projet créé!');
      setIsProjectOpen(false);
      setProjectForm({
        title: '',
        description: '',
        priority: 'medium',
        targetDate: ''
      });
      loadProjects();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !selectedProject) {
      toast.error('Titre requis');
      return;
    }

    try {
      await db.tasks.add({
        id: `task-${Date.now()}`,
        projectId: selectedProject.id,
        title: taskForm.title,
        status: 'todo',
        order: tasks.filter(t => t.projectId === selectedProject.id).length,
        createdAt: new Date()
      });

      toast.success('Tâche créée!');
      setIsTaskOpen(false);
      setTaskForm({ title: '', projectId: '' });
      loadTasks();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      await db.tasks.update(task.id, { status: newStatus });
      loadTasks();
      
      // Update project progress
      if (selectedProject) {
        const projectTasks = tasks.filter(t => t.projectId === selectedProject.id);
        const completedCount = projectTasks.filter(t => 
          t.id === task.id ? newStatus === 'completed' : t.status === 'completed'
        ).length;
        const progress = Math.round((completedCount / projectTasks.length) * 100);
        await db.projects.update(selectedProject.id, { progress });
        loadProjects();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await db.projects.delete(id);
      await db.tasks.where('projectId').equals(id).delete();
      toast.success('Projet supprimé');
      setSelectedProject(null);
      loadProjects();
      loadTasks();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await db.tasks.delete(id);
      toast.success('Tâche supprimée');
      loadTasks();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const projectTasks = selectedProject
    ? tasks.filter(t => t.projectId === selectedProject.id)
    : [];

  const tasksByStatus = {
    todo: projectTasks.filter(t => t.status === 'todo'),
    in_progress: projectTasks.filter(t => t.status === 'in_progress'),
    completed: projectTasks.filter(t => t.status === 'completed')
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="projects-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
            <FolderKanban className="w-10 h-10 text-primary" />
            Projets
          </h1>
          <p className="text-foreground/60 text-lg">Organisez et suivez vos projets</p>
        </div>
        <Dialog open={isProjectOpen} onOpenChange={setIsProjectOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-project-button">
              <Plus className="w-5 h-5" />
              Nouveau projet
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="create-project-dialog">
            <DialogHeader>
              <DialogTitle>Créer un projet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titre *</label>
                <Input
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="Titre du projet"
                  data-testid="project-title-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Description..."
                  rows={3}
                  data-testid="project-description-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Priorité</label>
                  <Select
                    value={projectForm.priority}
                    onValueChange={(value) => setProjectForm({ ...projectForm, priority: value })}
                  >
                    <SelectTrigger data-testid="project-priority-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date cible</label>
                  <Input
                    type="date"
                    value={projectForm.targetDate}
                    onChange={(e) => setProjectForm({ ...projectForm, targetDate: e.target.value })}
                    data-testid="project-target-date-input"
                  />
                </div>
              </div>
              <Button onClick={handleCreateProject} className="w-full" data-testid="submit-project-button">
                Créer le projet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects List */}
        <div className="card-modern" data-testid="projects-list">
          <h2 className="text-xl font-bold mb-4">Mes projets</h2>
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedProject?.id === project.id
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 hover:bg-foreground/10'
                }`}
                onClick={() => setSelectedProject(project)}
                data-testid={`project-item-${project.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{project.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                    data-testid={`delete-project-${project.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
                <p className="text-xs mt-1 opacity-70">{project.progress || 0}% complété</p>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-center text-foreground/40 py-4">Aucun projet</p>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-3 card-modern" data-testid="kanban-board">
          {selectedProject ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                  {selectedProject.description && (
                    <p className="text-foreground/60 mt-1">{selectedProject.description}</p>
                  )}
                </div>
                <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2" data-testid="create-task-button">
                      <Plus className="w-4 h-4" />
                      Tâche
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="create-task-dialog">
                    <DialogHeader>
                      <DialogTitle>Créer une tâche</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Titre *</label>
                        <Input
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          placeholder="Titre de la tâche"
                          data-testid="task-title-input"
                        />
                      </div>
                      <Button onClick={handleCreateTask} className="w-full" data-testid="submit-task-button">
                        Créer la tâche
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                  <div key={status} className="bg-foreground/5 rounded-xl p-4" data-testid={`kanban-column-${status}`}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      {status === 'todo' && '📋 À faire'}
                      {status === 'in_progress' && '🔄 En cours'}
                      {status === 'completed' && '✅ Terminé'}
                      <span className="text-xs text-foreground/60">({statusTasks.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {statusTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-background rounded-lg hover:shadow-md transition-shadow"
                          data-testid={`task-card-${task.id}`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => handleToggleTask(task)}
                              className="mt-0.5"
                              data-testid={`toggle-task-${task.id}`}
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-foreground/30" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className={`font-medium ${
                                task.status === 'completed' ? 'line-through text-foreground/50' : ''
                              }`}>
                                {task.title}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                              data-testid={`delete-task-${task.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <FolderKanban className="w-20 h-20 mx-auto text-foreground/20 mb-4" />
              <p className="text-xl text-foreground/40">Sélectionnez un projet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
