import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../Component/Header';
import TaskModal from '../Component/TaskModal';

interface Task {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  title: string;
}

const statusColors: Record<string, string> = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'done': 'bg-green-100 text-green-800'
};

const TaskPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const token = localStorage.getItem('userToken');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchProjects();
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [selectedProject, statusFilter, tasks]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data.projects);
    } catch (err) {
      console.error('Error fetching projects');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.tasks);
    } catch (err: any) {
      console.error('Error fetching tasks', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;
    if (selectedProject) {
      filtered = filtered.filter((task) => task.projectId === selectedProject);
    }
    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    setFilteredTasks(filtered);
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task', err);
      alert('Failed to delete task');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatStatusDisplay = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  return (
    <>
      <Header />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600">View and manage all your tasks</p>
          </div>

          {/* Filter Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Project
                </label>
                <select
                  id="project-filter"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              {filteredTasks.length > 0 && (
                <p className="text-sm text-gray-600">
                  Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                </p>
              )}
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={() => {
                setSelectedTask(null);
                setModalOpen(true);
              }}
            >
              Create New Task
            </button>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">No tasks found. Create a new task to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    {/* Task Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                          {formatStatusDisplay(task.status)}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-700 text-sm mt-2 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Due:</span> {formatDate(task.dueDate)}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(task.createdAt)}
                        </div>
                        {task.updatedAt !== task.createdAt && (
                          <div>
                            <span className="font-medium">Updated:</span> {formatDate(task.updatedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Task Actions */}
                    <div className="flex md:flex-col justify-end gap-2 md:w-32">
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-100 rounded-md bg-blue-50"
                        onClick={() => {
                          setSelectedTask(task);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-100 rounded-md bg-red-50"
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchTasks}
          task={selectedTask}
        />
      )}
    </>
  );
};

export default TaskPage;