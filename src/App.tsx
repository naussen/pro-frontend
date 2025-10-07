import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import { useAuth } from './context/AuthContext';
import { Subtopic } from './services/firebaseService';

function App() {
  const { currentUser, loading } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<Subtopic | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLessonClick = (lesson: Subtopic) => {
    setSelectedLesson(lesson);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!currentUser) {
    window.location.href = 'index.html';
    return null;
  }

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} />
      <div className={`study-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-overlay" id="sidebarOverlay"></div>
        <Sidebar onLessonClick={handleLessonClick} isCollapsed={isSidebarCollapsed} />
        <Content lesson={selectedLesson} />
      </div>
    </>
  );
}

export default App;