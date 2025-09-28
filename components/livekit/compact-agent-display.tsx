'use client';

import React from 'react';
import { useVoiceAssistant } from '@livekit/components-react';
import { AgentTile } from './agent-tile';
import { AvatarTile } from './avatar-tile';
import { cn } from '@/lib/utils';

interface CompactAgentDisplayProps {
  className?: string;
}

export function CompactAgentDisplay({ className }: CompactAgentDisplayProps) {
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();

  const isAvatar = agentVideoTrack !== undefined;

  return (
    <div className={cn('w-full h-full flex items-center justify-center', className)}>
      {!isAvatar && (
        // audio-only agent
        <AgentTile
          state={agentState}
          audioTrack={agentAudioTrack!}
          className="w-full h-full"
        />
      )}
      {isAvatar && (
        // avatar agent
        <AvatarTile
          videoTrack={agentVideoTrack}
          className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
        />
      )}
    </div>
  );
}
