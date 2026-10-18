import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LocalArticleEdit, LocalRevision } from "@/lib/localEdits";

export type WikiStore = { edits: Record<string, Partial<LocalArticleEdit>>; revisions: LocalRevision[] };
const STORE_DIRECTORY = path.join(process.cwd(), ".local-data");
const STORE_FILE = path.join(STORE_DIRECTORY, "wiki-store.json");
const emptyStore = (): WikiStore => ({ edits: {}, revisions: [] });
let writeChain: Promise<unknown> = Promise.resolve();

export async function readWikiStore(): Promise<WikiStore> {
  try {
    const parsed = JSON.parse(await readFile(STORE_FILE, "utf8")) as Partial<WikiStore>;
    return { edits: parsed.edits || {}, revisions: parsed.revisions || [] };
  } catch { return emptyStore(); }
}

export function updateWikiStore(update: (store: WikiStore) => WikiStore) {
  const operation = writeChain.then(async () => {
    const store = update(await readWikiStore());
    await mkdir(STORE_DIRECTORY, { recursive: true });
    const temporaryFile = `${STORE_FILE}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(store, null, 2), "utf8");
    await rename(temporaryFile, STORE_FILE);
    return store;
  });
  writeChain = operation.then(() => undefined, () => undefined);
  return operation;
}
