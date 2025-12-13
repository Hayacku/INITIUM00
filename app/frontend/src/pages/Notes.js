import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Tag,
  Link as LinkIcon,
  Save
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await db.notes.reverse().toArray();
      setNotes(data);
      if (data.length > 0 && !selectedNote) {
        setSelectedNote(data[0]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = {
        id: `note-${Date.now()}`,
        title: 'Nouvelle note',
        content: '# Nouvelle note\n\nCommencez à écrire...',
        tags: [],
        linkedTo: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.notes.add(newNote);
      toast.success('Note créée!');
      loadNotes();
      setSelectedNote(newNote);
      setIsEditing(true);
      setEditTitle(newNote.title);
      setEditContent(newNote.content);
      setEditTags('');
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      const tags = editTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await db.notes.update(selectedNote.id, {
        title: editTitle,
        content: editContent,
        tags,
        updatedAt: new Date()
      });

      toast.success('Note enregistrée!');
      setIsEditing(false);
      loadNotes();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await db.notes.delete(id);
      toast.success('Note supprimée');
      setSelectedNote(null);
      loadNotes();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags ? note.tags.join(', ') : '');
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6 animate-fade-in" data-testid="notes-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10 text-primary" />
            Notes
          </h1>
          <p className="text-foreground/60 text-lg">Votre base de connaissances personnelle</p>
        </div>
        <Button className="gap-2" onClick={handleCreateNote} data-testid="create-note-button">
          <Plus className="w-5 h-5" />
          Nouvelle note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Notes List */}
        <div className="glass-card flex flex-col h-[600px]" data-testid="notes-list">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="notes-search-input"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedNote?.id === note.id
                    ? 'bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10 text-muted-foreground hover:text-foreground'
                  }`}
                onClick={() => {
                  setSelectedNote(note);
                  setIsEditing(false);
                }}
                data-testid={`note-item-${note.id}`}
              >
                <h3 className={`font-semibold mb-1 ${selectedNote?.id === note.id ? 'text-white' : 'text-foreground'}`}>
                  {note.title}
                </h3>
                <p className={`text-xs ${selectedNote?.id === note.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {format(new Date(note.updatedAt || note.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${selectedNote?.id === note.id
                            ? 'bg-white/20 border-white/20 text-white'
                            : 'bg-background/50 border-white/10 text-muted-foreground'
                          }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Search className="w-8 h-8 opacity-20 mb-2" />
                <p>Aucune note</p>
              </div>
            )}
          </div>
        </div>

        {/* Note Content */}
        <div className="lg:col-span-3 glass-card flex flex-col min-h-[600px] p-6" data-testid="note-content">
          {selectedNote ? (
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
                      placeholder="Titre de la note"
                      data-testid="note-title-input"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveNote} className="gap-2" data-testid="save-note-button">
                        <Save className="w-4 h-4" />
                        Enregistrer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        data-testid="cancel-edit-button"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags (séparés par des virgules)
                    </label>
                    <Input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="react, dev, apprentissage"
                      data-testid="note-tags-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contenu (Markdown)</label>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                      placeholder="# Titre\n\nVotre contenu en Markdown..."
                      data-testid="note-content-input"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2">{selectedNote.title}</h2>
                      <p className="text-sm text-foreground/60">
                        Mis à jour: {format(new Date(selectedNote.updatedAt || selectedNote.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                      {selectedNote.tags && selectedNote.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedNote.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditNote(selectedNote)}
                        data-testid="edit-note-button"
                      >
                        Éditer
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        data-testid="delete-note-button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none" data-testid="note-markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedNote.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="w-20 h-20 mx-auto text-foreground/20 mb-4" />
              <p className="text-xl text-foreground/40">Sélectionnez une note</p>
              <p className="text-foreground/30 mt-2">Ou créez-en une nouvelle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
