'use client';

import { type RefObject, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function useAutoScroll(scrollContentContainerRef: RefObject<Element | null>, dependencies: any[] = []) {
  useEffect(() => {
    function scrollToBottom() {
      if (scrollContentContainerRef.current) {
        const element = scrollContentContainerRef.current;
        // Use immediate scroll for better responsiveness
        element.scrollTop = element.scrollHeight;
      }
    }

    function scrollToBottomSmooth() {
      if (scrollContentContainerRef.current) {
        const element = scrollContentContainerRef.current;
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      }
    }

    if (scrollContentContainerRef.current) {
      const resizeObserver = new ResizeObserver(scrollToBottom);
      resizeObserver.observe(scrollContentContainerRef.current);
      
      // Initial scroll
      scrollToBottom();
      
      // Also scroll when dependencies change (like new messages)
      if (dependencies.length > 0) {
        scrollToBottomSmooth();
      }

      return () => resizeObserver.disconnect();
    }
  }, [scrollContentContainerRef, ...dependencies]);
}
interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  messages?: any[]; // Add messages prop to trigger scroll on new messages
}

export const ChatMessageView = ({ className, children, messages = [], ...props }: ChatProps) => {
  const scrollContentRef = useRef<HTMLDivElement>(null);

  // Create a more comprehensive dependency array for auto-scroll
  const scrollDependencies = [
    messages.length,
    // Also trigger on message content changes (for streaming messages)
    messages.map(m => m.id + (m.message || '')).join(',')
  ];

  useAutoScroll(scrollContentRef, scrollDependencies);

  return (
    <div ref={scrollContentRef} className={cn('flex flex-col overflow-y-auto', className)} {...props}>
      {children}
    </div>
  );
};
