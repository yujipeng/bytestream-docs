import { readdirSync } from 'node:fs';
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';

// Batch-generates one MDX reference page per OpenAPI document.
// Re-run after editing any file under /openapi.
function yamlFiles(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml') && !name.startsWith('_'))
    .map((name) => `${dir}/${name}`);
}

await generateFiles({
  input: createOpenAPI({ input: yamlFiles('./openapi/video') }),
  output: './content/docs/video/reference',
  per: 'file',
  includeDescription: true,
});
