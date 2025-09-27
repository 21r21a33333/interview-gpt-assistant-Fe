'use client';

import { type RefObject, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function useAutoScroll(scrollContentContainerRef: RefObject<Element | null>, dependencies: any[] = []) {
  useEffect(() => {
    function scrollToBottom() {
      if (scrollContentContainerRef.current) {
        // Use setTimeout to ensure DOM has fully updated after animations
        setTimeout(() => {
          if (scrollContentContainerRef.current) {
            const element = scrollContentContainerRef.current;
            element.scrollTop = element.scrollHeight;
          }
        }, 100);
      }
    }

    if (scrollContentContainerRef.current) {
      const resizeObserver = new ResizeObserver(scrollToBottom);

      resizeObserver.observe(scrollContentContainerRef.current);
      scrollToBottom();

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

  useAutoScroll(scrollContentRef, [messages.length]); // Trigger scroll when messages change

  return (
    <div ref={scrollContentRef} className={cn('flex flex-col overflow-y-auto', className)} {...props}>
      {children}
    </div>
  );
};
