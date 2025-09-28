import * as React from 'react';
import type { MessageFormatter, ReceivedChatMessage } from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { useChatMessage } from './hooks/utils';
import MarkdownRenderer from './markdown-renderer';

export interface ChatEntryProps extends React.HTMLAttributes<HTMLLIElement> {
  /** The chat massage object to display. */
  entry: ReceivedChatMessage;
  /** Hide sender name. Useful when displaying multiple consecutive chat messages from the same person. */
  hideName?: boolean;
  /** Hide message timestamp. */
  hideTimestamp?: boolean;
  /** An optional formatter for the message body. */
  messageFormatter?: MessageFormatter;
}

export const ChatEntry = ({
  entry,
  messageFormatter,
  hideName,
  hideTimestamp,
  className,
  ...props
}: ChatEntryProps) => {
  const { message, hasBeenEdited, time, locale, name } = useChatMessage(entry, messageFormatter);

  const isUser = entry.from?.isLocal ?? false;
  const messageOrigin = isUser ? 'remote' : 'local';

  return (
    <li
      data-lk-message-origin={messageOrigin}
      title={time.toLocaleTimeString(locale, { timeStyle: 'full' })}
      className={cn('group mb-2 flex flex-col gap-1', className)}
      {...props}
    >
      {(!hideTimestamp || !hideName || hasBeenEdited) && (
        <span className="text-muted-foreground flex px-2 text-xs">
          {!hideName && <strong className="mr-2">{name}</strong>}
        </span>
      )}

      <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'max-w-[85%] rounded-2xl px-4 py-2 shadow-sm',
            isUser
              ? 'rounded-br-md bg-blue-500 text-white' // User messages - blue like WhatsApp
              : 'rounded-bl-md bg-gray-100 text-gray-800' // Agent messages - light gray like WhatsApp
          )}
        >
          <MarkdownRenderer
            source={typeof message === 'string' ? message : String(message)}
            className={cn('text-sm leading-relaxed', isUser ? 'prose-invert' : 'prose-gray')}
          />
        </div>
      </div>
    </li>
  );
};
