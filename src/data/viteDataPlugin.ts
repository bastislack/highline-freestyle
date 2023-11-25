/**
 * This is the entry point for the Data Plugin that reads the YAML Files defining tricks and combos
 */

import viteGetAllCombos from './viteComboFetcher';
import generateJsonSchemas from './viteSchemaGenerator';
import viteGetAllTricks from './viteTrickFetcher';
import { createHash } from 'crypto';

async function generateVirtualModuleContent() {
  const tricks = await viteGetAllTricks();
  const combos = await viteGetAllCombos(tricks);

  // *Should* get reproducible results under Node
  // As this code is not run on the Browser, this should be no issue.
  const contentToHash = JSON.stringify({ tricks, combos });

  const hash = createHash('md5').update(contentToHash).digest('hex');

  return `
  export const tricks = ${JSON.stringify(tricks)};
  export const combos = ${JSON.stringify(combos)};
  export const hash = "${hash}";

  export default ({
    tricks, combos, hash
  })
  `;
}

export function viteDataPlugin() {
  generateJsonSchemas();
  return {
    name: 'vite-plugin-highline-freestyle-data',
    resolveId(id: string): string | void {
      if (id === 'virtual:highline-freestyle-data') {
        return '\0' + id;
      }
    },
    async load(id: string): Promise<string | void> {
      if (id === '\0virtual:highline-freestyle-data') {
        return await generateVirtualModuleContent();
      }
    },
  };
}
