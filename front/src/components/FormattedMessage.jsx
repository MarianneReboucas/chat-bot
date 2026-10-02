import React, { useMemo } from 'react';
import { marked } from 'marked';

/**
 * Configuração personalizada do marked para renderização de Markdown segura e consistente
 */
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
});

/**
 * Componente FormattedMessage
 * Renderiza textos e respostas da IA formatadas em Markdown (negrito, itálico, listas, links, títulos, código).
 *
 * @param {Object} props
 * @param {string} props.content - Texto em formato Markdown a ser renderizado
 * @param {string} [props.className] - Classes adicionais de estilização CSS
 */
export default function FormattedMessage({ content = '', className = '' }) {
  const htmlContent = useMemo(() => {
    if (!content || typeof content !== 'string') {
      return '';
    }

    try {
      return marked.parse(content);
    } catch (error) {
      console.error('Erro ao converter Markdown:', error);
      return content;
    }
  }, [content]);

  return (
    <div
      className={`markdown-body ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
