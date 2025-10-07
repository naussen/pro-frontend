import React, { useState, useEffect } from 'react';
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
      // Limpa o conteúdo se nenhuma aula for selecionada
      setContent('');
      setError(null);
      setLoading(false);
    }
  }, [lesson]);

  const renderContent = () => {
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
          <p>{error}</p>
        </div>
      );
    }

    if (content) {
      // Usar dangerouslySetInnerHTML para renderizar o conteúdo HTML
      // ATENÇÃO: Isso assume que o conteúdo HTML é seguro.
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
        {renderContent()}
      </div>
    </main>
  );
};

export default Content;
