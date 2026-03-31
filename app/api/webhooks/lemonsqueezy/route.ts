import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-signature');
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!secret || !signatureHeader) {
      return NextResponse.json({ error: 'Missing security configuration.' }, { status: 500 });
    }

    // Secure Verify signature against our secret
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signatureHeader, 'utf8');

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.error('Invalid Lemon Squeezy signature.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    // signature is unique to the exact payload content, making it a perfect idempotency key
    const eventId = signatureHeader; 
    const customData = payload.meta.custom_data || {};
    const userId = customData.user_id;

    // Use Service Role admin client to bypass RLS
    const supabase = await createAdminClient();

    // 1. Idempotency via DB Constraint (event_id UNIQUE)
    const { error: insertError } = await supabase.from('lemon_squeezy_events').insert({
      event_id: eventId,
      event_name: eventName,
      body: payload,
      processed: true
    });

    if (insertError) {
       if (insertError.code === '42P01') {
          console.error('FATAL: Table lemon_squeezy_events does not exist. Did you run the migration?');
          return NextResponse.json({ error: 'Database not initialized properly' }, { status: 500 });
       }
       // 23505 is PostgreSQL's unique_violation error code. Block duplicate processing completely.
       if (insertError.code === '23505') {
          return NextResponse.json({ success: true, reason: 'duplicate_event_caught_by_db' });
       }
       console.error('Event insert failed:', insertError);
       return NextResponse.json({ error: 'DB insertion failed' }, { status: 500 });
    }

    if (!userId) {
      console.warn('No custom_data.user_id found in payload.');
      // Acknowledging the hook but skipping biz logic
      return NextResponse.json({ success: true, reason: 'unmapped_user' });
    }

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const attributes = payload.data.attributes;
      const lsId = payload.data.id;
      const variantId = attributes.variant_id.toString();
      const status = attributes.status; // e.g., active, past_due, expired, cancelled
      
      // 2 & 4. Safe mapping (unknown variant -> ignore) & Cancel state
      let newPlan = 'free';
      const basicVariant = process.env.LEMON_SQUEEZY_BASIC_VARIANT_ID;
      const proVariant = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID;
      const basicFs = process.env.LEMON_SQUEEZY_FOUNDING_BASIC_VARIANT_ID;
      const proFs = process.env.LEMON_SQUEEZY_FOUNDING_PRO_VARIANT_ID;
      
      if (status === 'active' || status === 'on_trial' || status === 'past_due') {
        if (variantId === basicVariant || variantId === basicFs) newPlan = 'basic';
        else if (variantId === proVariant || variantId === proFs) newPlan = 'pro';
        else {
          console.warn(`Unmapped variant ID received: ${variantId}`);
          return NextResponse.json({ success: true, reason: 'ignored_unknown_variant' });
        }
      } else if (status === 'cancelled' || status === 'expired' || status === 'unpaid') {
        newPlan = 'free';
      }

      // Upsert Subscription record
      const { data: existingSub } = await supabase.from('subscriptions')
        .select('id').eq('lemon_squeezy_id', lsId).maybeSingle();
      
      if (existingSub) {
        await supabase.from('subscriptions').update({
           status, 
           variant_id: variantId, 
           current_period_end: attributes.renews_at, 
           updated_at: new Date().toISOString()
        }).eq('id', existingSub.id);
      } else {
        await supabase.from('subscriptions').insert({
           user_id: userId, 
           lemon_squeezy_id: lsId, 
           variant_id: variantId, 
           status, 
           current_period_end: attributes.renews_at
        });
      }

      // Update profiles.plan
      await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId);
    }
    
    // 4. Fallback handle for purely terminal events
    if (eventName === 'subscription_expired' || eventName === 'subscription_cancelled') {
       const lsId = payload.data.id;
       // Also explicitly update the sub record if it exists
       await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('lemon_squeezy_id', lsId);
       await supabase.from('profiles').update({ plan: 'free' }).eq('id', userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Webhook routing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
