import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCourses, Course, Subtopic } from '../services/firebaseService';

interface SidebarProps {
  onLessonClick: (lesson: Subtopic) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onLessonClick, isCollapsed }) => {
  // ... (hooks de estado para cursos, loading, error, etc.) ...

  return (
    <aside className={`study-sidebar ${isCollapsed ? 'collapsed' : ''}`} id="studySidebar">
      {/* ... (resto do JSX da sidebar) ... */}
    </aside>
  );
};

export default Sidebar;