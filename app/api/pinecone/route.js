import { pipeline } from '@xenova/transformers';
import { index } from '@/services/pinecone/index.js';

export async function POST(req) {
  try {
    const { message } = await req.json();

    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embedding = await extractor(message, { pooling: 'mean', normalize: true });

    const index = pinecone.Index('your-index-name');
    const queryResponse = await index.query({
      vector: embedding.data[0],
      topK: 10,
      includeMetadata: true,
    });

    return new Response(JSON.stringify(queryResponse.matches), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in query route:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
