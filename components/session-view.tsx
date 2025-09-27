'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  type AgentState,
  type ReceivedChatMessage,
  useRoomContext,
  useVoiceAssistant,
} from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar';
import { ChatEntry } from '@/components/livekit/chat/chat-entry';
import { ChatMessageView } from '@/components/livekit/chat/chat-message-view';
import { MediaTiles } from '@/components/livekit/media-tiles';
import useChatAndTranscription from '@/hooks/useChatAndTranscription';
import { useDebugMode } from '@/hooks/useDebug';
import type { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

interface SessionViewProps {
  appConfig: AppConfig;
  disabled: boolean;
  sessionStarted: boolean;
}

export const SessionView = ({
  appConfig,
  disabled,
  sessionStarted,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const { state: agentState } = useVoiceAssistant();
  const [chatOpen, setChatOpen] = useState(false);
  const { messages, send } = useChatAndTranscription();
  const room = useRoomContext();

  useDebugMode({
    enabled: process.env.NODE_END !== 'production',
  });

  async function handleSendMessage(message: string) {
    await send(message);
  }

  useEffect(() => {
    if (sessionStarted) {
      const timeout = setTimeout(() => {
        if (!isAgentAvailable(agentState)) {
          const reason =
            agentState === 'connecting'
              ? 'Agent did not join the room. '
              : 'Agent connected but did not complete initializing. ';

          toastAlert({
            title: 'Session ended',
            description: (
              <p className="w-full">
                {reason}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.livekit.io/agents/start/voice-ai/"
                  className="whitespace-nowrap underline"
                >
                  See quickstart guide
                </a>
                .
              </p>
            ),
          });
          room.disconnect();
        }
      }, 20_000);

      return () => clearTimeout(timeout);
    }
  }, [agentState, sessionStarted, room]);

  const { supportsChatInput, supportsVideoInput, supportsScreenShare } = appConfig;
  const capabilities = {
    supportsChatInput,
    supportsVideoInput,
    supportsScreenShare,
  };

  return (
    <section
      ref={ref}
      inert={disabled}
      className={cn(
        'opacity-0 h-screen overflow-hidden',
        // prevent page scrollbar
        !chatOpen && 'max-h-svh overflow-hidden'
      )}
    >
      {/* Two-column layout */}
      <div className="flex h-full">
        {/* Left Column - Video/Agent Interface */}
        <div className="flex-1 relative bg-background">
          <MediaTiles chatOpen={false} />
          
          {/* Control bar positioned at bottom of left column */}
          <div className="absolute bottom-0 left-0 right-0 z-50 px-3 pt-2 pb-3 md:px-6 md:pb-6">
            <motion.div
              key="control-bar"
              initial={{ opacity: 0, translateY: '100%' }}
              animate={{
                opacity: sessionStarted ? 1 : 0,
                translateY: sessionStarted ? '0%' : '100%',
              }}
              transition={{ duration: 0.3, delay: sessionStarted ? 0.5 : 0, ease: 'easeOut' }}
            >
              <div className="relative z-10 mx-auto w-full max-w-lg">
                {appConfig.isPreConnectBufferEnabled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: sessionStarted && messages.length === 0 ? 1 : 0,
                      transition: {
                        ease: 'easeIn',
                        delay: messages.length > 0 ? 0 : 0.8,
                        duration: messages.length > 0 ? 0.2 : 0.5,
                      },
                    }}
                    aria-hidden={messages.length > 0}
                    className={cn(
                      'absolute inset-x-0 -top-12 text-center',
                      sessionStarted && messages.length === 0 && 'pointer-events-none'
                    )}
                  >
                    <p className="animate-text-shimmer inline-block !bg-clip-text text-sm font-semibold text-transparent">
                      Agent is listening, ask it a question
                    </p>
                  </motion.div>
                )}

                <AgentControlBar
                  capabilities={capabilities}
                  onChatOpenChange={setChatOpen}
                  onSendMessage={handleSendMessage}
                />
              </div>
              {/* skrim */}
              <div className="from-background border-background absolute top-0 left-0 h-12 w-full -translate-y-full bg-gradient-to-t to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* Right Column - Chat Messages */}
        <div className="hidden md:flex w-96 border-l border-border bg-background flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-muted/50">
            <h3 className="font-semibold text-lg">Agent Chat</h3>
            <p className="text-sm text-muted-foreground">Conversation with AI Assistant</p>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-hidden">
            <ChatMessageView className="h-full" messages={messages}>
              <div className="px-4 py-4 space-y-4 whitespace-pre-wrap">
                <AnimatePresence>
                  {messages.map((message: ReceivedChatMessage) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <ChatEntry hideName key={message.id} entry={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-center">
                    <div className="text-muted-foreground">
                      <p className="text-lg font-medium mb-2">Start a conversation</p>
                      <p className="text-sm">Ask the agent a question to begin chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </ChatMessageView>
          </div>
        </div>

        {/* Mobile Chat Toggle */}
        <div className="md:hidden fixed bottom-20 right-4 z-50">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* Mobile Chat Overlay */}
        {chatOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-background">
            {/* Mobile Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-lg">Agent Chat</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 hover:bg-muted rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Chat Messages */}
            <div className="flex-1 overflow-hidden h-[calc(100vh-80px)]">
              <ChatMessageView className="h-full" messages={messages}>
                <div className="px-4 py-4 space-y-4 whitespace-pre-wrap">
                  <AnimatePresence>
                    {messages.map((message: ReceivedChatMessage) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <ChatEntry hideName key={message.id} entry={message} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-center">
                      <div className="text-muted-foreground">
                        <p className="text-lg font-medium mb-2">Start a conversation</p>
                        <p className="text-sm">Ask the agent a question to begin chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </ChatMessageView>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
