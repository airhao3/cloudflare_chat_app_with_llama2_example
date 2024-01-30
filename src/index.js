import { Hono} from 'hono';
import { Ai } from '@cloudflare/ai';

import blocking from './blocking.html';
import streaming from './streaming.html';

const app = new Hono();

app.get("/", c => {
	return c.html(streaming)
});

app.get("/b", c => {
	return c.html(blocking)
});

app.get('/stream', async (c) => {
	const ai = new Ai(c.env.AI)

	const query = c.req.query("query")
	const question = query || "What is the square root of 9?"

	const messages = [
		{role: "system", content: "You are a helpful assistant."},
		{role: "user", content:question}
	]

	const aiResponse = await ai.run(
		'@cf/meta/llama-2-7b-chat-int8',
		{messages, stream:true}
	)
	return new Response(aiResponse, {
		headers: {
			'Content-Type': 'text/event-stream'
		}
	})
});

app.post('/', async c => {
	const ai = new Ai(c.env.CLOUDFLARE_AI)

	const body = await c.req.json()
	const question = body.query || "Hello, how is it going? "
	
	const messages = [
		{role: "system", content:"You are a helpful assistent"},
		{role: "user", content: question}
	]

	const airesponse = await ai.run(
		"@cf/meta/llama-2-7b-chat-int8",
		{messages, stream: true}
	)
	return c.text(aiResponse.response)
} );

 export default app 