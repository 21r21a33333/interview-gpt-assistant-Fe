'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { CompactAgentDisplay } from '@/components/livekit/compact-agent-display';
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
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const mobileChatScrollRef = useRef<HTMLDivElement>(null);

  // Custom auto-scroll effect for chat messages
  useEffect(() => {
    const scrollToBottom = (element: HTMLDivElement | null) => {
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    };

    // Scroll both desktop and mobile chat containers
    scrollToBottom(chatScrollRef.current);
    scrollToBottom(mobileChatScrollRef.current);
  }, [messages]);

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
        'h-screen overflow-hidden opacity-0',
        // prevent page scrollbar
        'max-h-svh overflow-hidden'
      )}
    >
      {/* Chat-focused layout */}
      <div className="flex h-full flex-col">
        {/* Chat Header with Agent Status */}
        <div className="border-border bg-muted/50 flex-shrink-0 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                <svg
                  fill="#fff"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                >
                  <path d="M15.3568437,15 C15.7646155,15.4524132 16,16.046195 16,16.6740273 L16,18.5 C16,19.8807119 14.8807119,21 13.5,21 L4.5,21 C3.11928813,21 2,19.8807119 2,18.5 L2,16.6741582 C2,16.0462625 2.23543163,15.4524277 2.64327433,15 L2.5,15 C2.22385763,15 2,14.7761424 2,14.5 C2,14.2238576 2.22385763,14 2.5,14 L4.16159469,14 L6.20372283,12.860218 C5.46099525,12.1339918 5,11.1208315 5,10 C5,7.790861 6.790861,6 9,6 C11.209139,6 13,7.790861 13,10 C13,10.0851511 12.9973393,10.1696808 12.9920965,10.2535104 L13.5294677,9.70238819 C13.1955521,9.21872477 13,8.6321992 13,8 C13,6.34314575 14.3431458,5 16,5 C17.6568542,5 19,6.34314575 19,8 C19,8.63142186 18.8049285,9.21728235 18.4717634,9.70060362 L18.4756434,9.70454496 L20.2910569,11.5687647 C20.7456276,12.0355563 21,12.6613719 21,13.3129308 L21,14 L21.5,14 C21.7761424,14 22,14.2238576 22,14.5 C22,14.7761424 21.7761424,15 21.5,15 L15.3568437,15 L15.3568437,15 Z M13.8388411,14 L20,14 L20,13.3129308 C20,12.9219955 19.8473766,12.5465061 19.5746341,12.2664311 L17.7752165,10.4186373 C17.2781336,10.7840978 16.6642801,11 16,11 C15.3364952,11 14.7232995,10.7846015 14.2265245,10.4199164 L12.4260261,12.2664886 C12.2161243,12.4817616 12.1876639,12.5119114 12.1322325,12.5816619 C12.0367817,12.7017697 12.0030449,12.7911346 12.0001997,12.9735561 L13.8388411,14 Z M13.2430272,14.8126554 L10.9146921,13.5128341 C10.3460214,13.8234492 9.6936285,14 9,14 C8.30657563,14 7.65436264,13.8235531 7.08580996,13.5131083 L3.76895585,15.3643588 C3.29420285,15.6293348 3,16.1304646 3,16.6741582 L3,18.5 C3,19.3284271 3.67157288,20 4.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 L15,16.6740273 C15,16.130386 14.7058532,15.6292958 14.2311717,15.3642991 L13.5719516,14.9962814 C13.4392535,14.9800633 13.3226161,14.9118587 13.2430272,14.8126554 L13.2430272,14.8126554 Z M9,13 C10.6568542,13 12,11.6568542 12,10 C12,8.34314575 10.6568542,7 9,7 C7.34314575,7 6,8.34314575 6,10 C6,11.6568542 7.34314575,13 9,13 Z M16,10 C17.1045695,10 18,9.1045695 18,8 C18,6.8954305 17.1045695,6 16,6 C14.8954305,6 14,6.8954305 14,8 C14,9.1045695 14.8954305,10 16,10 Z" />
                </svg>
              </div>
              <div>
                <h3 className="animate-text-shimmer inline-block !bg-clip-text text-lg font-semibold text-transparent">
                  AI Assistant
                </h3>
                <p className="text-muted-foreground text-sm">
                  {isAgentAvailable(agentState) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="bg-muted/50 flex-1 overflow-hidden">
          <div ref={chatScrollRef} className="h-full overflow-y-auto bg-black">
            <div className="space-y-2 px-4 py-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message: ReceivedChatMessage) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <ChatEntry hideName key={message.id} entry={message} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="text-muted-foreground">
                    <div className="dark:bg-grey-900 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <svg
                        className="h-8 w-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="animate-text-shimmer inline-block !bg-clip-text text-sm font-semibold text-transparent">
                      Start a conversation
                    </p>
                    <br />
                    <p className="animate-text-shimmer inline-block !bg-clip-text text-sm font-semibold text-transparent">
                      Ask the agent a question to begin chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Control Bar at Bottom */}
        <div className="border-border bg-background flex-shrink-0 border-t">
          <motion.div
            key="control-bar"
            initial={{ opacity: 0, translateY: '100%' }}
            animate={{
              opacity: sessionStarted ? 1 : 0,
              translateY: sessionStarted ? '0%' : '100%',
            }}
            transition={{ duration: 0.3, delay: sessionStarted ? 0.5 : 0, ease: 'easeOut' }}
            className="p-4"
          >
            <div className="relative mx-auto w-full max-w-2xl">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};
