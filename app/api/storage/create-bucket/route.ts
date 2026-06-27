// app/api/storage/create-bucket/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Create the bucket if it doesn't exist
    const { data, error } = await supabase.storage.createBucket('chat-files', {
      public: true,
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });

    if (error) {
      // Check if bucket already exists
      if (error.message.includes('already exists')) {
        return NextResponse.json({ 
          success: true, 
          message: 'Bucket already exists' 
        });
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Chat files bucket created successfully' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}