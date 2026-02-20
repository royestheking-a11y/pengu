import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  Calendar as CalendarIcon,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, addDays } from 'date-fns';
import { toast } from 'sonner';

import 'react-day-picker/dist/style.css';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

import { useStore, SyllabusEvent } from './store';
import api from '../lib/api'; // Import API



export default function SyllabusSync() {
  const navigate = useNavigate();
  const { syllabusEvents, addSyllabusEvent, courses, addCourse, updateCourse, deleteCourse } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [uploadStep, setUploadStep] = useState<'idle' | 'processing' | 'complete'>('idle');
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<{ old: string, new: string } | null>(null);
  const [newCourse, setNewCourse] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<SyllabusEvent>>({
    type: 'assignment',
    weight: ''
  });

  const handleAddCourse = () => {
    if (!newCourse.trim()) {
      toast.error('Course name cannot be empty');
      return;
    }
    if (courses.some(c => c.toLowerCase() === newCourse.trim().toLowerCase())) {
      toast.error('Course already exists');
      return;
    }
    addCourse(newCourse.trim());
    setNewCourse('');
    setIsAddCourseOpen(false);
    toast.success('Course added successfully');
  };

  const handleUpdateCourse = () => {
    if (!courseToEdit || !courseToEdit.new.trim()) return;

    if (courses.some(c => c.toLowerCase() === courseToEdit.new.trim().toLowerCase() && c !== courseToEdit.old)) {
      toast.error('Course name already exists');
      return;
    }

    updateCourse(courseToEdit.old, courseToEdit.new.trim());
    setCourseToEdit(null);
    setIsEditCourseOpen(false);
    toast.success('Course updated');
  };

  const handleDeleteCourse = (course: string) => {
    if (confirm(`Are you sure you want to delete ${course}?`)) {
      deleteCourse(course);
      toast.success('Course deleted');
    }
  };

  const handleManualEntry = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.course) {
      toast.error('Please fill in all required fields');
      return;
    }

    const event: SyllabusEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date || new Date().toISOString(), // Ensure date string
      type: newEvent.type || 'assignment',
      course: newEvent.course,
      weight: newEvent.weight || '0%',
    };

    addSyllabusEvent(event);
    setIsManualEntryOpen(false);
    setNewEvent({ type: 'assignment', weight: '' });
    toast.success('Deadline added successfully');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileToUpload(file);
    setUploadStep('processing');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Real AI Scan API Call
      const response = await api.post('/syllabus/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadStep('complete');
      const scannedEvents = response.data;

      if (!scannedEvents || scannedEvents.length === 0) {
        toast.warning("No deadlines detected in this syllabus. You can add them manually.");
      } else {
        // Track unique courses to add them to the user's list
        const uniqueCourses = new Set<string>();

        // Add events and collect courses
        for (const event of scannedEvents) {
          await addSyllabusEvent(event);
          if (event.course && event.course !== 'Detected from Syllabus') {
            uniqueCourses.add(event.course);
          }
        }

        // Add detected courses to the global list if they don't exist
        for (const courseName of Array.from(uniqueCourses)) {
          if (!courses.some(c => c.toLowerCase() === courseName.toLowerCase())) {
            await addCourse(courseName);
          }
        }

        toast.success(`Successfully synced ${file.name}! Found ${scannedEvents.length} events.`);
      }

      // Reset after showing complete state
      setTimeout(() => {
        setUploadStep('idle');
        setFileToUpload(null);
      }, 3000);
    } catch (error: any) {
      console.error("Syllabus upload failed", error);
      const errorMsg = error.response?.data?.message || "Failed to analyze syllabus";
      toast.error(errorMsg);
      setUploadStep('idle');
      setFileToUpload(null);
    }
  };

  const handleCreateRequest = (event: SyllabusEvent) => {
    // Pass state to the new request page
    navigate('/student/new-request', {
      state: {
        topic: event.title,
        deadline: event.date,
        serviceType: 'assignment' // Default or map from event.type
      }
    });
    toast.info(`Starting request for ${event.title}`);
  };

  const activeEvents = syllabusEvents.filter(event =>
    selectedDate && isSameDay(new Date(event.date), selectedDate)
  );

  const modifiers = {
    hasEvent: syllabusEvents.map(e => new Date(e.date)),
    exam: syllabusEvents.filter(e => e.type === 'exam').map(e => new Date(e.date)),
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      color: '#5D4037'
    },
    exam: {
      color: '#dc2626',
      fontWeight: '900'
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Syllabus Sync</h1>
            <p className="text-stone-500">Upload your course syllabus to auto-generate your deadline calendar.</p>
          </div>
          <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" /> Add Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Manual Deadline</DialogTitle>
                <DialogDescription>
                  Manually add a deadline to your calendar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g. Midterm Exam"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="course" className="text-right">
                    Course
                  </Label>
                  <Select
                    value={newEvent.course}
                    onValueChange={(value) => setNewEvent({ ...newEvent, course: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                    value={newEvent.date ? format(new Date(newEvent.date), 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const dateString = e.target.value;
                      if (!dateString) {
                        setNewEvent({ ...newEvent, date: undefined });
                        return;
                      }
                      const [year, month, day] = dateString.split('-').map(Number);
                      setNewEvent({ ...newEvent, date: new Date(year, month - 1, day).toISOString() });
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="weight" className="text-right">
                    Weight
                  </Label>
                  <Input
                    id="weight"
                    value={newEvent.weight || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, weight: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g. 20%"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleManualEntry}>Add Deadline</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 bg-stone-50 p-4 rounded-xl border border-stone-100 flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    styles={{
                      caption: { color: '#3E2723' },
                      head_cell: { color: '#a8a29e' },
                    }}
                  />
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-[#3E2723] mb-4">
                      {selectedDate ? format(selectedDate, 'EEEE, MMMM do, yyyy') : 'Select a date'}
                    </h3>

                    {activeEvents.length > 0 ? (
                      <div className="space-y-3">
                        {activeEvents.map(event => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border border-stone-200 rounded-xl hover:shadow-md transition-shadow bg-white group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex gap-4">
                                <div className={`
                                  p-3 rounded-lg flex items-center justify-center h-fit
                                  ${event.type === 'exam' ? 'bg-red-100 text-red-700' : 'bg-[#5D4037]/10 text-[#5D4037]'}
                                `}>
                                  {event.type === 'exam' ? <AlertCircle className="size-5" /> : <FileText className="size-5" />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-stone-900">{event.title}</h4>
                                  <p className="text-sm text-stone-500">{event.course} • {event.weight} Weight</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                                      Due {format(new Date(event.date), 'h:mm a')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleCreateRequest(event)}>
                                Get Help <ArrowRight className="ml-2 size-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-xl">
                        <CalendarIcon className="mx-auto size-10 text-stone-300 mb-3" />
                        <p className="text-stone-500">No deadlines on this day.</p>
                        <Button
                          variant="link"
                          className="text-[#5D4037]"
                          onClick={() => {
                            if (selectedDate) {
                              setNewEvent(prev => ({ ...prev, date: selectedDate.toISOString() }));
                            }
                            setIsManualEntryOpen(true);
                          }}
                        >
                          Add a deadline +
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Upcoming List */}
            <div>
              <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                <Clock className="text-amber-500 size-5" /> Upcoming Deadlines (Next 30 Days)
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                {syllabusEvents
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .filter(e => new Date(e.date) > new Date())
                  .slice(0, 5)
                  .map((event, i) => (
                    <div key={event.id} className={`flex items-center justify-between p-4 ${i !== 4 ? 'border-b border-stone-100' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="text-center w-12">
                          <div className="text-xs text-stone-500 uppercase font-bold">{format(new Date(event.date), 'MMM')}</div>
                          <div className="text-xl font-bold text-[#3E2723]">{format(new Date(event.date), 'd')}</div>
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{event.title}</div>
                          <div className="text-sm text-stone-500">{event.course}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${event.type === 'exam' ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-600'
                        }`}>
                        {event.type.toUpperCase()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Upload */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-[#5D4037] to-[#3E2723] text-white">
              <h3 className="font-bold text-lg mb-2">Sync New Syllabus</h3>
              <p className="text-stone-300 text-sm mb-6">
                Upload your course PDF and our AI will extract all deadlines and add them to your calendar.
              </p>

              <div
                className={`
                    border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative
                    ${uploadStep === 'processing' ? 'border-amber-400/50 bg-amber-400/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}
                  `}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt" // Accept common syllabus formats
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={handleFileUpload}
                  disabled={uploadStep !== 'idle'}
                />

                {uploadStep === 'idle' && (
                  <>
                    <Upload className="mx-auto size-8 mb-2 opacity-80" />
                    <p className="text-sm font-medium">Click to Upload Syllabus (PDF)</p>
                  </>
                )}

                {uploadStep === 'processing' && (
                  <div className="flex flex-col items-center">
                    <Loader2 className="size-8 text-amber-400 animate-spin mb-3" />
                    <p className="text-sm font-medium">Analyzing {fileToUpload?.name}...</p>
                    <p className="text-xs text-white/50 mt-1">Extracting dates & events</p>
                  </div>
                )}

                {uploadStep === 'complete' && (
                  <>
                    <CheckCircle className="mx-auto size-8 mb-2 text-green-400" />
                    <p className="text-sm font-medium">Sync Complete!</p>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-stone-700 mb-4">Courses</h3>
              <div className="space-y-3">
                {courses.map(course => (
                  <div key={course} className="flex items-center justify-between p-2 hover:bg-stone-50 rounded-lg group">
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-stone-300" />
                      <span className="font-medium text-stone-700">{course}</span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="size-4 text-stone-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setCourseToEdit({ old: course, new: course });
                          setIsEditCourseOpen(true);
                        }}>
                          <Pencil className="mr-2 size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCourse(course)}>
                          <Trash2 className="mr-2 size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-2 text-xs">
                      <Plus className="size-3 mr-2" /> Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Course</DialogTitle>
                      <DialogDescription>
                        Enter the name of the new course to add to your list.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="course-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="course-name"
                          value={newCourse}
                          onChange={(e) => setNewCourse(e.target.value)}
                          className="col-span-3"
                          placeholder="e.g. CS 101"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddCourse}>Add Course</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Course</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-course-name" className="text-right">Name</Label>
                        <Input
                          id="edit-course-name"
                          value={courseToEdit?.new || ''}
                          onChange={(e) => setCourseToEdit(prev => prev ? { ...prev, new: e.target.value } : null)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleUpdateCourse}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
