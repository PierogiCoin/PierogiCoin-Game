// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Definiujemy schemat walidacji po stronie serwera - to kluczowe dla bezpieczeństwa!
const ContactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = ContactFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Błąd walidacji danych.', errors: validationResult.error.flatten() }, { status: 400 });
    }
    
    // Tutaj w prawdziwej aplikacji wysłałbyś e-mail
    // np. używając Nodemailer, Resend, SendGrid itp.
    console.log('Dane z formularza (backend):', validationResult.data);
    console.log('Symulacja wysyłania e-maila...');

    // Zawsze zwracaj sukces, aby nie ujawniać logiki biznesowej.
    return NextResponse.json({ message: 'Wiadomość została pomyślnie wysłana.' }, { status: 200 });

  } catch (error) {
    console.error('Błąd po stronie serwera:', error);
    return NextResponse.json({ message: 'Wystąpił wewnętrzny błąd serwera.' }, { status: 500 });
  }
}