import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    startDate: '',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: ''
  });
  const [editEvent, setEditEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const data = await db.events.toArray();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.startDate) {
      toast.error('Titre et date requis');
      return;
    }

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);

      if (editEvent) {
        await db.events.update(editEvent.id, {
          title: formData.title,
          type: formData.type,
          startDate: startDateTime,
          endDate: endDateTime,
          description: formData.description,
          location: formData.location
        });
        toast.success('Événement modifié!');
      } else {
        await db.events.add({
          id: `event-${Date.now()}`,
          title: formData.title,
          type: formData.type,
          startDate: startDateTime,
          endDate: endDateTime,
          description: formData.description,
          location: formData.location,
          createdAt: new Date()
        });
        toast.success('Événement créé!');
      }
      setIsOpen(false);
      setFormData({
        title: '',
        type: 'meeting',
        startDate: '',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: ''
      });
      setEditEvent(null);
      loadEvents();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await db.events.delete(id);
      toast.success('Événement supprimé');
      loadEvents();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleEdit = (event) => {
    setEditEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      startTime: format(new Date(event.startDate), 'HH:mm'),
      endTime: format(new Date(event.endDate), 'HH:mm'),
      description: event.description || '',
      location: event.location || ''
    });
    setIsOpen(true);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day) => {
    return events.filter(event => isSameDay(new Date(event.startDate), day));
  };

  const selectedDayEvents = events.filter(event => 
    isSameDay(new Date(event.startDate), selectedDate)
  );

  return (
    <div className="space-y-6 animate-fade-in" data-testid="agenda-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
            <CalendarIcon className="w-10 h-10 text-primary" />
            Agenda
          </h1>
          <p className="text-foreground/60 text-lg">Organisez vos événements et deadlines</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-event-button">
              <Plus className="w-5 h-5" />
              Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="create-event-dialog">
            <DialogHeader>
              <DialogTitle>{editEvent ? 'Modifier un événement' : 'Créer un événement'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titre *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de l'événement"
                  data-testid="event-title-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger data-testid="event-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Réunion</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                    <SelectItem value="reminder">Rappel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  data-testid="event-date-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Heure début</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    data-testid="event-start-time-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Heure fin</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    data-testid="event-end-time-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'événement"
                  data-testid="event-description-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Lieu</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Lieu de l'événement"
                  data-testid="event-location-input"
                />
              </div>
              <Button onClick={handleCreate} className="w-full" data-testid="submit-event-button">
                {editEvent ? 'Modifier' : 'Créer'} l'événement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card-modern" data-testid="calendar-widget">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
              data-testid="prev-month-button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
              data-testid="next-month-button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-foreground/60 p-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-2 rounded-lg transition-all relative ${
                    isSelected ? 'bg-primary text-white' :
                    isToday ? 'bg-primary/20 text-primary font-bold' :
                    isCurrentMonth ? 'hover:bg-foreground/5' : 'text-foreground/30'
                  }`}
                  data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                >
                  <span>{format(day, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-primary'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="card-modern" data-testid="events-list-widget">
          <h3 className="text-xl font-bold mb-4">
            {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
          </h3>
          <div className="space-y-3">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-foreground/5 rounded-xl hover:bg-foreground/10 transition-colors"
                  data-testid={`event-item-${event.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{event.title}</h4>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} title="Modifier">
                        <Plus className="w-4 h-4 rotate-45" />
                      </Button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                        data-testid={`delete-event-${event.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(event.startDate), 'HH:mm')} - 
                      {format(new Date(event.endDate), 'HH:mm')}
                    </span>
                  </div>
                  {event.location && (
                    <div className="text-sm text-foreground/60 mt-1">
                      <span className="font-medium">Lieu :</span> {event.location}
                    </div>
                  )}
                  {event.description && (
                    <div className="text-sm text-foreground/70 mt-1 italic">
                      {event.description}
                    </div>
                  )}
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    event.type === 'meeting' ? 'bg-blue-500/20 text-blue-500' :
                    event.type === 'deadline' ? 'bg-red-500/20 text-red-500' :
                    event.type === 'reminder' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {event.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-foreground/40 py-8">Aucun événement ce jour</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
