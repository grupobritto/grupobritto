export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const subscription = await request.json();
  // Aqui você salvaria a 'subscription' no seu banco de dados,
  // associada ao usuário logado.
  // Por simplicidade, vamos apenas logar no console.
  console.log('Push Subscription object: ', subscription);

  return NextResponse.json({ success: true });
}
