import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/lib/utils'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div className={cn('markdown-preview', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold text-foreground mt-8 mb-4 border-b border-border pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold text-foreground mt-6 mb-3 border-b border-border pb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-semibold text-foreground mt-5 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl font-semibold text-foreground mt-4 mb-2" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-lg font-semibold text-foreground mt-3 mb-2" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-base font-semibold text-foreground mt-3 mb-2" {...props} />
          ),
          
          // Paragraphs & Text
          p: ({ node, ...props }) => (
            <p className="text-foreground leading-7 my-4" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-foreground" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-foreground" {...props} />
          ),
          
          // Links
          a: ({ node, ...props }) => (
            <a 
              className="text-primary hover:text-primary/80 underline transition-colors" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 my-4 text-foreground pl-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 my-4 text-foreground pl-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-foreground leading-7" {...props} />
          ),
          
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-primary bg-muted/50 pl-4 py-2 my-4 italic text-muted-foreground" 
              {...props} 
            />
          ),
          
          // Code
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ? (
              <pre className="bg-muted border border-border rounded-lg p-4 my-4 overflow-x-auto">
                <code className={`text-sm text-foreground font-mono ${className || ''}`} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            )
          },
          
          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-border rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-border" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-border" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left font-semibold text-foreground border-r border-border last:border-r-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-foreground border-r border-border last:border-r-0" {...props} />
          ),
          
          // Horizontal Rule
          hr: ({ node, ...props }) => (
            <hr className="border-t border-border my-8" {...props} />
          ),
          
          // Images
          img: ({ node, ...props }) => (
            <img className="rounded-lg my-4 max-w-full h-auto" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
