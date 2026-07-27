import { readdirSync } from 'node:fs';
import { createOpenAPI } from 'fumadocs-openapi/server';

function yamlFiles(dir: string) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml') && !name.startsWith('_'))
    .map((name) => `${dir}/${name}`);
}

export const openapi = createOpenAPI({
  input: yamlFiles('./openapi/video'),
});
