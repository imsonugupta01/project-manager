import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Project {
  _id: string;
  title: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: any; // Existing task for update
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSuccess, task }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  const token = localStorage.getItem('userToken');

  useEffect(() => {
    if (!isOpen) return;

    // Set form if editing
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setDueDate(task.dueDate?.split('T')[0] || '');
      setProjectId(task.projectId);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setDueDate('');
      setProjectId('');
    }

    // Fetch projects
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    };

    fetchProjects();
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { title, description, status, dueDate, projectId };

    try {
      if (task?._id) {
        // Update Task
        await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/task/${task._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create Task
        await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/tasks`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving task', err);
      alert('Failed to save task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {task ? 'Update Task' : 'Create Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Dropdown */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;