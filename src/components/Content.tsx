import React, { useState, useEffect } => from 'react';
import { Subtopic, getLessonContent } from '../services/firebaseService';

interface ContentProps {
  lesson: Subtopic | null;
}

const Content: React.FC<ContentProps> = ({ lesson }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lesson && lesson.content_url) {
      setLoading(true);
      setError(null);
      setContent('');
      getLessonContent(lesson.content_url)
        .then(htmlContent => {
          setContent(htmlContent);
        })
        .catch(err => {
          console.error("Erro ao buscar conteúdo da aula:", err);
          setError("Falha ao carregar o conteúdo da aula.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setContent('');
      setError(null);
      setLoading(false);
    }
  }, [lesson]);

  const renderBody = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando conteúdo...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="empty-state">
          <h3>⚠️ Erro ao Carregar</h3>
          <p>Failed to edit, 0 occurrences found for old_string (import React from 'react';

const Content = () => {
  // A lógica e o JSX completo do conteúdo principal virão aqui.
  return (
    <main className="study-content">
      <p>Content Placeholder</p>
    </main>
  );
};

export default Content;
). Original old_string was (import React from 'react';

const Content = () => {
  // A lógica e o JSX completo do conteúdo principal virão aqui.
  return (
    <main className="study-content">
      <p>Content Placeholder</p>
    </main>
  );
};

export default Content;
) in C:\pro-frontend\src\components\Content.tsx. No edits made. The exact text in old_string was not found. Ensure you're not escaping content incorrectly and check whitespace, indentation, and context. Use read_file tool to verify.</p>
        </div>
      );
    }

    if (content) {
      return <div className="lesson-content" dangerouslySetInnerHTML={{ __html: content }} />;
    }

    return (
      <div className="empty-state">
        <div className="empty-state-icon">📖</div>
        <h3>Bem-vindo à Sala de Estudos!</h3>
        <p>Selecione uma aula no menu lateral para começar seus estudos.</p>
      </div>
    );
  };

  return (
    <main className="study-content">
      <div className="content-body" id="contentBody">
        {renderBody()}
      </div>
    </main>
  );
};

export default Content;