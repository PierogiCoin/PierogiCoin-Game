import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

const botToken = process.env.BOT_TOKEN;
const bot = botToken ? new TelegramBot(botToken, { polling: false }) : null;

export async function POST(req: Request) {
    if (!bot) {
        return NextResponse.json({ error: 'BOT_TOKEN is not configured' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { itemId, userId, title, description, amount } = body;

        if (!itemId || !userId || !title || !description || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate a unique payload
        const payload = `${itemId}-${Date.now()}`;

        // Create invoice link
        // Note: createInvoiceLink is cleaner for web apps, but sendInvoice sends a message. 
        // usage in original code was bot.sendInvoice which returns a message, but logic accessed invoice.invoice_link?
        // Let's check original code behavior. 
        // Original: const invoice = await bot.sendInvoice(...); res.json({ invoiceLink: invoice.invoice_link });
        // But sendInvoice usually sends a message to chat. If userId is passed, it sends to that user.
        // If we want a LINK to open payment, createInvoiceLink is typical. 
        // However, sendInvoice doesn't return an object with invoice_link directly unless updated.
        // Let's stick to user's implementation attempt or better: createInvoiceLink if available.
        // But original code used sendInvoice.
        
        // Actually, sendInvoice returns a Message object. It DOES NOT return an invoice link usually.
        // Wait, maybe they meant createInvoiceLink?
        // Let's try createInvoiceLink if available in the library, otherwise assume sendInvoice.
        // Standard node-telegram-bot-api 'sendInvoice' sends a message.
        // If the user wants to pay via a button in the web app, typically openInvoice method in WebApp is used with a URL or slug.
        // BUT, for "Stars", createInvoiceLink is the modern way. 
        // I will use createInvoiceLink if it exists, otherwise fallback or wrapping.
        
        // However, looking at types, createInvoiceLink exists in newer versions.
        // If not, we might need to use raw api call.
        // Let's try to use createInvoiceLink first as it returns a URL.
        
        const prices = [{ label: title, amount: parseInt(amount) }];
        
        const invoiceLink = await bot.createInvoiceLink(
            title,
            description,
            payload,
            "", // Provider token is empty for Stars
            "XTR", // Currency
            prices
        );
        
        return NextResponse.json({ invoiceLink });

    } catch (error: unknown) {
        console.error('Error creating invoice:', error);
        const msg = error instanceof Error ? error.message : 'Failed to create invoice';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
