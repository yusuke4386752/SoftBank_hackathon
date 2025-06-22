import { NextRequest } from 'next/server'
import { Message } from '@/features/messages/messages'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'DifyMethod Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // ★★★ リクエストからclientIdも受け取るように変更 ★★★
    const { messages, apiKey, url, conversationId, stream, clientId } = await req.json();

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Last message is not from user or messages array is empty');
    }
    const query = typeof lastMessage.content === 'string' ? lastMessage.content : '';


    const difyKey = apiKey;
    if (!difyKey) {
      return new Response(JSON.stringify({ error: 'Dify Empty API Key' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const cleanUrl = (url: string) => {
      const trimmedUrl = url.replace(/\/$/, '');
      return trimmedUrl.endsWith('/chat-messages') ? trimmedUrl : `${trimmedUrl}/chat-messages`;
    };

    const difyUrl = url ? cleanUrl(url) : (process.env.DIFY_URL ? cleanUrl(process.env.DIFY_URL) : '');
    if (!difyUrl) {
      return new Response(JSON.stringify({ error: 'Dify Empty URL' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const headers = {
      Authorization: `Bearer ${difyKey}`,
      'Content-Type': 'application/json',
    };

    const bodyPayload: { [key: string]: any } = {
      inputs: {},
      query: query,
      response_mode: stream !== false ? 'streaming' : 'blocking',
      user: clientId || 'aituber-kit', // ★★★ userをclientIdに変更 ★★★
      files: [],
    };

    if (conversationId && conversationId.length > 0) {
      bodyPayload.conversation_id = conversationId;
    }

    const body = JSON.stringify(bodyPayload);

    const response = await fetch(difyUrl, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Dify API Error:', errorBody);
      return new Response(JSON.stringify({ error: 'Dify API request failed', detail: errorBody }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    if (stream !== false) {
      return new Response(response.body, {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    } else {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error('Error in Dify API call:', error);
    return new Response(JSON.stringify({ error: 'Dify Internal Server Error', detail: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}