// lib/chat-service.ts
import { supabase } from './supabase';

class ChatService {
  private static instance: ChatService;
  private isCleanedUp = false;
  private activeChatChannels: Set<string> = new Set();
  private unreadCountCache: Map<string, number> = new Map();

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

  public getUnreadCount(conversationId: string): number | undefined {
    return this.unreadCountCache.get(conversationId);
  }

  public setUnreadCount(conversationId: string, count: number): void {
    if (count === 0) {
      this.unreadCountCache.delete(conversationId);
    } else {
      this.unreadCountCache.set(conversationId, count);
    }
  }

  public incrementUnreadCount(conversationId: string): number {
    const currentCount = this.unreadCountCache.get(conversationId) || 0;
    const newCount = currentCount + 1;
    this.unreadCountCache.set(conversationId, newCount);
    return newCount;
  }

  public resetUnreadCount(conversationId: string): void {
    this.unreadCountCache.delete(conversationId);
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

      // Clear unread count cache
      this.unreadCountCache.clear();

      this.isCleanedUp = true;
      console.log('✅ Chat service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up chat service:', error);
    }
  }

  public reset(): void {
    this.isCleanedUp = false;
    this.unreadCountCache.clear();
    console.log('🔄 Chat service reset');
  }

  public needsCleanup(): boolean {
    return !this.isCleanedUp;
  }
}

export const chatService = ChatService.getInstance();