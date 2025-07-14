import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUsername = localStorage.getItem('username');

    if (!storedToken || !storedUsername) {
      navigate('/');
    } else {
      setUsername(storedUsername);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <header className="bg-blue-600 text-white shadow-md py-3 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Project Manager</h1>

      {username && (
        <div className="relative flex items-center space-x-2" ref={dropdownRef}>
          <span className="text-sm">{username}</span>
          <div onClick={toggleDropdown} className="cursor-pointer">
            {
              (FaUserCircle as unknown as React.FC<{ className?: string }>)({
                className: 'text-2xl'
              })
            }
          </div>

          {showDropdown && (
            <div className="absolute right-0 top-10 bg-white text-black rounded shadow-md w-32 z-10">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
