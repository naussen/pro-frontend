import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCourses, Course, Module, Subtopic } from '../services/firebaseService';

interface SidebarProps {
  onLessonClick: (lesson: Subtopic) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onLessonClick, isCollapsed }) => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      getCourses(currentUser.uid)
        .then(fetchedCourses => {
          setCourses(fetchedCourses);
          setError(null);
        })
        .catch(err => {
          console.error("Erro ao buscar cursos:", err);
          setError("Não foi possível carregar os cursos.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentUser]);

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleLessonClick = (lesson: Subtopic) => {
    setActiveLesson(lesson.id);
    onLessonClick(lesson);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando cursos...</p>
        </div>
      );
    }

    if (error) {
      return <div className="empty-state"><p>{error}</p></div>;
    }

    if (courses.length === 0) {
        return <div className="empty-state"><p>Nenhum curso encontrado.</p></div>;
    }

    return courses.map(course => {
      const isCourseExpanded = expandedCourses.has(course.id);
      return (
        <div key={course.id} className="course-item">
          <div className={`course-header ${isCourseExpanded ? 'active' : ''}`} onClick={() => toggleCourse(course.id)}>
            <div className="course-icon">{course.name.charAt(0)}</div>
            <span className="course-name">{course.name}</span>
            <span className={`toggle-icon ${isCourseExpanded ? 'expanded' : ''}`}>▶</span>
          </div>
          <div className="module-list" style={{ maxHeight: isCourseExpanded ? '800px' : '0' }}>
            {course.modules.map(module => {
              const isModuleExpanded = expandedModules.has(module.id);
              return (
                <div key={module.id} className="module-item">
                  <div className={`module-header ${isModuleExpanded ? 'active' : ''}`} onClick={() => toggleModule(module.id)}>
                    <span className="module-name">{module.name}</span>
                    <span className={`module-toggle ${isModuleExpanded ? 'expanded' : ''}`}>▶</span>
                  </div>
                  <div className="aulas-list" style={{ display: isModuleExpanded ? 'block' : 'none' }}>
                    {module.subtopics.map(subtopic => (
                      <a key={subtopic.id} href="#" className={`aula-item ${activeLesson === subtopic.id ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleLessonClick(subtopic); }}>
                        {subtopic.name}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <aside className={`study-sidebar ${isCollapsed ? 'collapsed' : ''}`} id="studySidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Meus Cursos</div>
        <div className="sidebar-icon-expanded">📚</div>
        <div className="sidebar-icon-collapsed">📚</div>
      </div>
      <div className="sidebar-content">
        <nav className="sidebar-nav" id="courseNavigation">
          {renderContent()}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;