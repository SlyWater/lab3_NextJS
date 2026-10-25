import { readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { get, put, BlobPreconditionFailedError } from '@vercel/blob';

const file = process.env.COMMUNITIES_FILE || path.join(process.cwd(), 'data', 'communities.json');
let pending = Promise.resolve();

async function readSnapshot() {
  let text;
  let etag;
  if (process.env.VERCEL) {
    const result = await get('communities.json', { access: 'private', useCache: false });
    if (!result) return { communities: [], etag: null };
    text = await new Response(result.stream).text();
    // The HTTP response may mark the storage ETag as weak after compression.
    etag = result.blob.etag.replace(/^W\//, '');
  } else {
    text = await readFile(/* turbopackIgnore: true */ file, 'utf8');
  }
  const communities = JSON.parse(text);
  if (!Array.isArray(communities)) throw new Error('Invalid communities JSON');
  return { communities, etag };
}

export async function listCommunities(user) {
  const { communities } = await readSnapshot();
  return communities.filter(community => community.members.includes(user));
}

export function addCommunity(community) {
  const save = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { communities, etag } = await readSnapshot();
      const text = JSON.stringify([...communities, community], null, 2) + '\n';
      if (!process.env.VERCEL) {
        await writeFile(file + '.tmp', text, 'utf8');
        await rename(file + '.tmp', file);
        return;
      }
      try {
        await put('communities.json', text, {
          access: 'private', contentType: 'application/json',
          addRandomSuffix: false, allowOverwrite: Boolean(etag),
          ...(etag ? { ifMatch: etag } : {})
        });
        return;
      } catch (error) {
        if (!(error instanceof BlobPreconditionFailedError) || attempt === 2) throw error;
      }
    }
  };
  const operation = pending.catch(() => {}).then(save);
  pending = operation;
  return operation;
}
