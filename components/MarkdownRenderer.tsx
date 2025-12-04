import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    // Added prose-invert to force light text color for dark mode
    <div className="prose prose-sm prose-stone prose-invert max-w-none font-sans text-right" dir="rtl">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Override paragraph to ensure proper spacing in Urdu
          p: ({node, ...props}) => <p className="mb-2 leading-relaxed text-green-50" {...props} />,
          // Ensure lists are RTL friendly
          ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-2 mr-4 text-green-100" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-2 mr-4 text-green-100" {...props} />,
          // Code blocks
          code: ({node, className, children, ...props}) => {
             const match = /language-(\w+)/.exec(className || '')
             const isInline = !match && !String(children).includes('\n');
             return isInline 
               ? <code className="bg-green-900 rounded px-1 py-0.5 text-emerald-300 font-mono text-sm" {...props}>{children}</code>
               : <code className="block bg-green-900 text-green-50 p-2 rounded-lg overflow-x-auto text-left font-mono text-sm my-2 border border-green-800" dir="ltr" {...props}>{children}</code>
          },
          blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-green-700 pr-4 italic my-2 text-green-300" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
          h1: ({node, ...props}) => <h1 className="text-white font-bold text-xl my-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-white font-bold text-lg my-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-white font-bold text-base my-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;