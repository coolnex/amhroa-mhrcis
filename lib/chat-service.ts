// lib/chat-service.ts
import { supabase } from './supabase';

class ChatService {
  private static instance: ChatService;
  private isCleanedUp = false;
  private activeChatChannels: Set<string> = new Set();

  private constructor() {
    // Remove guest chat support
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public trackChannel(channelName: string): void {
    this.activeChatChannels.add(channelName);
  }

  public async cleanup(): Promise<void> {
    if (this.isCleanedUp) return;

    console.log('🧹 Cleaning up chat service...');

    try {
      for (const channelName of this.activeChatChannels) {
        const channel = supabase.channel(channelName);
        await channel.unsubscribe();
        this.activeChatChannels.delete(channelName);
      }

      this.isCleanedUp = true;
      console.log('✅ Chat service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up chat service:', error);
    }
  }

  public reset(): void {
    this.isCleanedUp = false;
    console.log('🔄 Chat service reset');
  }

  public needsCleanup(): boolean {
    return !this.isCleanedUp;
  }
}

export const chatService = ChatService.getInstance();