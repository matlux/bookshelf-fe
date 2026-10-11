import { mkdir, writeFile } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';
import openapiTS, { astToString } from 'openapi-typescript';
import swagger2openapi from 'swagger2openapi';

try {
  loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const response = await fetch(
  new URL('/swagger.json', process.env.BOOKSHELF_API_URL || 'http://127.0.0.1:3000'),
);
if (!response.ok) throw new Error(`Swagger fetch failed: ${response.status}`);
const swagger = await response.json();
// Reitit uses JSON Schema const and vendor extensions inside Swagger 2.
function normalise(node) {
  if (!node || typeof node !== 'object') return;
  if ('const' in node) {
    node.enum = [node.const];
    delete node.const;
  }
  if (node['x-nullable']) node['x-nullable'] = true;
  for (const child of Object.values(node)) normalise(child);
}
normalise(swagger);
const { openapi } = await swagger2openapi.convertObj(swagger, { patch: true, warnOnly: true });
await mkdir('src/types', { recursive: true });
await writeFile('src/types/schema.ts', astToString(await openapiTS(openapi)));
await mkdir('api', { recursive: true });
await writeFile('api/swagger.json', `${JSON.stringify(swagger, null, 2)}\n`);
console.log('Generated types and recorded Swagger snapshot.');
