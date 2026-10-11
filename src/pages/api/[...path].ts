import type { APIRoute } from 'astro';
import { proxy } from '../../server/proxy';
export const prerender = false;
export const ALL: APIRoute = ({ request }) => proxy(request);
