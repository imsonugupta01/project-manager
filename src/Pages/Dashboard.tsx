import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../Component/Header';
import { useNavigate } from 'react-router-dom';

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  taskCount: number;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  const token = localStorage.getItem('userToken');

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else {
      fetchProjects();
    }
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/projects/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(res.data.projects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: newTitle,
      description: newDescription,
      status,
    };

    try {
      if (isEditing && editProjectId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/projects/project/${editProjectId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/projects/projects`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      resetForm();
      fetchProjects();
    } catch (err: any) {
      console.error('Project submit error:', err);
      setError('Failed to save project. Please check your input and try again.');
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setStatus('active');
    setEditProjectId(null);
    setIsEditing(false);
    setModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <>
      <Header />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
              <p className="text-gray-600 mt-1">Track and manage all your projects</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-medium shadow-sm transition-colors duration-150"
            >
              Create New Project
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-medium">{error}</p>
              <button 
                onClick={() => setError('')}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by creating your first project
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-150"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                        {project.title}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {project.description || 'No description provided'}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800 mr-1">{project.taskCount}</span>
                        <span>{project.taskCount === 1 ? 'task' : 'tasks'}</span>
                      </div>
                    
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3 flex justify-between border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/tasks/${project._id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      View Tasks
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setNewTitle(project.title);
                          setNewDescription(project.description);
                          setStatus(project.status);
                          setEditProjectId(project._id);
                          setIsEditing(true);
                          setModalOpen(true);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Project' : 'New Project'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              
              <form onSubmit={handleSubmitProject}>
                <div className="mb-4">
                  <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    id="project-title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter project title"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="project-description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    rows={3}
                    placeholder="Describe your project"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="project-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isEditing ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;