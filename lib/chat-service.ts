import { supabase } from './supabase';

class ChatService {
  private static instance: ChatService;
  private isCleanedUp = false;
  private guestId: string | null = null;
  private guestName: string | null = null;
  // Track specific chat channel IDs so we don't break other app features
  private activeChatChannels: Set<string> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadGuestData();
    }
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private loadGuestData(): void {
    try {
      this.guestId = localStorage.getItem('guest_chat_id');
      this.guestName = localStorage.getItem('guest_chat_name');
    } catch (e) {
      console.error('Failed to read localStorage:', e);
    }
  }

  /**
   * Tracks active chat channel names so they can be securely closed later
   */
  public trackChannel(channelName: string): void {
    this.activeChatChannels.add(channelName);
  }

  public getGuestId(): string {
    if (typeof window === 'undefined') return '';
    if (this.guestId) return this.guestId;
    
    const storedId = localStorage.getItem('guest_chat_id');
    if (storedId) {
      this.guestId = storedId;
      return storedId;
    }
    
    const newId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('guest_chat_id', newId);
    this.guestId = newId;
    return newId;
  }

  public getGuestName(): string {
    if (typeof window === 'undefined') return 'Guest User';
    if (this.guestName) return this.guestName;
    
    return localStorage.getItem('guest_chat_name') || 'Guest User';
  }

  public setGuestName(name: string): void {
    if (typeof window === 'undefined') return;
    this.guestName = name;
    localStorage.setItem('guest_chat_name', name);
  }

  /**
   * Safely removes only chat-specific real-time subscriptions and guest states
   */
  public async cleanup(): Promise<void> {
    if (this.isCleanedUp) return;

    console.log('🧹 Cleaning up chat service...');

    try {
      // 1. Only remove tracked chat channels, keeping other app subscriptions intact
      for (const channelName of this.activeChatChannels) {
        const channel = supabase.channel(channelName);
        await channel.unsubscribe();
        this.activeChatChannels.delete(channelName);
      }
      
      // 2. Clear only chat-related keys from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('guest_chat_id');
        localStorage.removeItem('guest_chat_name');
        
        // Note: 'registered_activities' and bookmark items removed from here 
        // to prevent unexpected data loss across the application.

        this.guestId = null;
        this.guestName = null;
      }

      this.isCleanedUp = true;
      console.log('✅ Chat service cleaned up safely');
    } catch (error) {
      console.error('❌ Error cleaning up chat service:', error);
    }
  }

  public reset(): void {
    this.isCleanedUp = false;
    this.loadGuestData();
    console.log('🔄 Chat service reset for new session');
  }

  public needsCleanup(): boolean {
    return !this.isCleanedUp;
  }
}

// Export the instance directly for streamlined application imports
export const chatService = ChatService.getInstance();
