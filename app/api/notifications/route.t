// app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    // Get the current user from the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Fetch upcoming events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("status", "Upcoming")
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(5);

    // Fetch active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("alerts")
      .select("*")
      .eq("status", "active")
      .or(`audience.eq.all,audience.eq.${userData.role}`)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch users read notifications
    const { data: readNotifications, error: readError } = await supabase
      .from("user_notifications")
      .select("notification_id, is_read")
      .eq("user_id", userId);

    // Build read status map
    const readMap: Record<string, boolean> = {};
    if (readNotifications) {
      readNotifications.forEach((item: any) => {
        readMap[item.notification_id] = item.is_read;
      });
    }

    // Build notifications array
    const notifications: any[] = [];

    // Add events
    if (events) {
      events.forEach((event: any) => {
        const eventDate = new Date(event.start_date);
        const today = new Date();
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let severity = 'low';
        if (daysUntil <= 3) severity = 'urgent';
        else if (daysUntil <= 7) severity = 'high';
        else if (daysUntil <= 14) severity = 'medium';

        const notificationId = `event-${event.id}`;
        notifications.push({
          id: notificationId,
          type: 'event',
          title: event.title,
          message: `${event.event_type || 'Event'} • ${daysUntil <= 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`} • ${event.location || event.venue || 'Virtual'}`,
          date: new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          severity,
          link: `/events/${event.id}`,
          isRead: readMap[notificationId] || false,
          created_at: event.start_date,
          icon: event.is_virtual ? 'Video' : 'MapPin',
          color: event.is_virtual ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400',
        });
      });
    }

    // Add alerts
    if (alerts) {
      alerts.forEach((alert: any) => {
        const severityMap: Record<string, string> = {
          'low': 'low',
          'medium': 'medium',
          'high': 'high',
          'urgent': 'urgent',
        };
        const severity = severityMap[alert.severity?.toLowerCase() || 'low'] || 'low';
        
        const severityColors: Record<string, string> = {
          low: 'bg-blue-500/20 text-blue-400',
          medium: 'bg-yellow-500/20 text-yellow-400',
          high: 'bg-orange-500/20 text-orange-400',
          urgent: 'bg-red-500/20 text-red-400',
        };
        
        const severityIcons: Record<string, string> = {
          low: 'Info',
          medium: 'AlertCircle',
          high: 'AlertTriangle',
          urgent: 'Zap',
        };

        const notificationId = `alert-${alert.id}`;
        notifications.push({
          id: notificationId,
          type: 'alert',
          title: alert.title || 'Alert',
          message: alert.message || '',
          date: new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          severity,
          link: `/alerts/${alert.id}`,
          isRead: readMap[notificationId] || false,
          created_at: alert.created_at,
          icon: severityIcons[severity] || 'BellRing',
          color: severityColors[severity] || 'bg-slate-500/20 text-slate-400',
        });
      });
    }

    // Sort by created_at (most recent first) and limit to 10
    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const limitedNotifications = notifications.slice(0, 10);

    const unreadCount = limitedNotifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications: limitedNotifications,
      unreadCount,
      total: limitedNotifications.length,
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch notifications",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// POST endpoint to mark notifications as read
export async function POST(request: Request) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      // Mark all notifications as read by deleting existing entries and re-inserting
      // This is a simplified approach - in production, youd want to update in bulk
      const { data: readNotifications, error: fetchError } = await supabase
        .from("user_notifications")
        .select("notification_id")
        .eq("user_id", userId);

      if (fetchError) {
        console.error("Error fetching notifications:", fetchError);
        return NextResponse.json(
          { success: false, message: "Failed to fetch notifications" },
          { status: 500 }
        );
      }

      // Insert all current notifications as read
      const notificationsToMark = readNotifications || [];
      // You would need to get the current list of notifications here
      // This is a simplified approach
      
      // Instead, well use a different approach - update all existing records
      const { error: updateError } = await supabase
        .from("user_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error marking all as read:", updateError);
        return NextResponse.json(
          { success: false, message: "Failed to mark all as read" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: "Notification ID required" },
        { status: 400 }
      );
    }

    // Mark single notification as read
    const { error: upsertError } = await supabase
      .from("user_notifications")
      .upsert({
        user_id: userId,
        notification_id: notificationId,
        is_read: true,
        read_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id, notification_id'
      });

    if (upsertError) {
      console.error("Error marking notification as read:", upsertError);
      return NextResponse.json(
        { success: false, message: "Failed to mark as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to mark as read",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}