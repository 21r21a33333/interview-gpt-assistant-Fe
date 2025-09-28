import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  source: string;
  className?: string;
}

export default function MarkdownRenderer({ source, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize components to match chat styling
          p: ({ children }) => <span className="inline">{children}</span>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto my-1">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-1 space-y-0.5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-1 space-y-0.5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-2 my-1 italic">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="text-lg font-bold my-1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold my-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold my-1">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold my-1">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold my-1">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-semibold my-1">{children}</h6>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
