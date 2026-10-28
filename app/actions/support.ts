'use server';
import { isShopFastError } from '@shopfast-sdk/client';
import { buyer } from '@/lib/shopfast';

export interface TicketState {
  readonly status: 'idle' | 'sent' | 'error';
  readonly number: number;
  readonly error: string;
  readonly fields: Readonly<Record<string, string>>;
}

function text(form: FormData, name: string): string {
  const v = form.get(name);
  return typeof v === 'string' ? v.trim() : '';
}

export async function openTicket(_prev: TicketState, form: FormData): Promise<TicketState> {
  const orderId = text(form, 'order');
  const access = text(form, 'access');
  try {
    const ticket = await (await buyer()).support.open({
      name: text(form, 'name'), email: text(form, 'email'), subject: text(form, 'subject'), message: text(form, 'message'),
      category: null, channel: orderId === '' ? 'web' : 'order', attachments: [],
      order: orderId === '' ? null : { sessionId: orderId, access: access === '' ? null : access },
      // Left empty by people; bots fill it in.
      website: text(form, 'website'),
    });
    return { status: 'sent', number: ticket.number, error: '', fields: {} };
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (!isShopFastError(error)) return { status: 'error', number: 0, error: 'Something went wrong. Try again in a moment.', fields: {} };
    const fields: Record<string, string> = {};
    for (const f of error.fields) fields[f.path.replace(/^body\./, '')] = f.message;
    return { status: 'error', number: 0, error: error.fields.length > 0 ? 'Check the highlighted fields.' : error.detail, fields };
  }
}
