import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export const maxDuration = 60; 

export async function GET(req: Request) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !evolutionKey) {
    return NextResponse.json({ error: "Evolution API credenciais ausentes." }, { status: 500 });
  }

  // Calculate the target date: exactly 2 days from now
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + 2);
  
  // Create start and end of day for the target date to query range
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Fetch appointments scheduled for 2 days from now that are "Confirmado"
  // Note: status 'Confirmado' means they booked it, but we still send a reminder.
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      tatuador_id,
      appointment_date,
      client_id,
      clients (
        name,
        phone
      )
    `)
    .gte('appointment_date', startOfDay.toISOString())
    .lte('appointment_date', endOfDay.toISOString())
    .eq('status', 'Confirmado');

  if (error || !appointments) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }

  for (const appt of appointments) {
    const clientData = appt.clients as any;
    if (!clientData || !clientData.phone) continue;

    const message = `Ola, ${clientData.name || 'tudo bem'}! Passando para confirmar a sua sessao de tatuagem que esta agendada para daqui a 2 dias. Qualquer duvida ou se precisar reagendar, por favor me avise com antecedencia! Nos vemos em breve!`;

    let cleanPhone = clientData.phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('55') && cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    try {
      await fetch(`${evolutionUrl}/message/sendText/${appt.tatuador_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionKey
        },
        body: JSON.stringify({
          number: cleanPhone,
          options: { delay: 1200, presence: 'composing' },
          textMessage: { text: message }
        })
      });

      // Optionally, mark that a reminder was sent to avoid duplicate sending 
      // (not strictly necessary if cron runs only once a day)

    } catch (e) {
      console.error("Failed to send appointment confirmation to", cleanPhone, e);
    }
  }

  return NextResponse.json({ status: 'success', message: `Confirmed ${appointments.length} appointments.` });
}
