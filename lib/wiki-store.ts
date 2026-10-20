import { desc, inArray } from "drizzle-orm";
import { wikiEdits, wikiRevisions } from "@/db/schema";
import type { LocalArticleEdit, LocalRevision } from "@/lib/localEdits";

export type WikiStore = { edits: Record<string, Partial<LocalArticleEdit>>; revisions: LocalRevision[] };
const emptyStore = (): WikiStore => ({ edits: {}, revisions: [] });
const STORE_DIRECTORY = ".local-data";
const STORE_FILE = `${STORE_DIRECTORY}/wiki-store.json`;
let writeChain: Promise<unknown> = Promise.resolve();

type CloudDb = ReturnType<(typeof import("@/db"))["getDb"]>;
let cloudDbPromise: Promise<CloudDb | null> | null = null;

/**
 * The deployed Sites worker has a Cloudflare D1 binding. Local Next runs do
 * not, so the same API keeps the file-backed store as a development fallback.
 */
async function getCloudDb() {
  if (!cloudDbPromise) {
    cloudDbPromise = import("@/db/next").then(({ getDb }) => getDb()).catch(() => null);
  }
  return cloudDbPromise;
}

function revisionKey(revision: LocalRevision) {
  return `${revision.timestamp}|${revision.slug}|${revision.userId || ""}`;
}

async function readLocalStore(): Promise<WikiStore> {
  const { readFile } = await import("node:fs/promises");
  try {
    const parsed = JSON.parse(await readFile(`${process.cwd()}/${STORE_FILE}`, "utf8")) as Partial<WikiStore>;
    return { edits: parsed.edits || {}, revisions: parsed.revisions || [] };
  } catch {
    return emptyStore();
  }
}

async function readCloudStore(db: CloudDb): Promise<WikiStore> {
  const [editRows, revisionRows] = await Promise.all([
    db.select().from(wikiEdits),
    db.select().from(wikiRevisions).orderBy(desc(wikiRevisions.timestamp), desc(wikiRevisions.id)).limit(5000),
  ]);
  const edits: Record<string, Partial<LocalArticleEdit>> = {};
  for (const row of editRows) {
    try { edits[row.slug] = JSON.parse(row.editJson) as Partial<LocalArticleEdit>; } catch { /* ignore malformed legacy rows */ }
  }
  return {
    edits,
    revisions: revisionRows.map((row) => ({
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      timestamp: row.timestamp,
      userId: row.userId,
      userName: row.userName,
      picture: row.picture || undefined,
    })),
  };
}

export async function readWikiStore(): Promise<WikiStore> {
  const db = await getCloudDb();
  return db ? readCloudStore(db) : readLocalStore();
}

async function writeLocalStore(store: WikiStore) {
  const { mkdir, rename, writeFile } = await import("node:fs/promises");
  const directory = `${process.cwd()}/${STORE_DIRECTORY}`;
  await mkdir(directory, { recursive: true });
  const temporaryFile = `${process.cwd()}/${STORE_FILE}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(store, null, 2), "utf8");
  await rename(temporaryFile, `${process.cwd()}/${STORE_FILE}`);
  return store;
}

async function writeCloudStore(db: CloudDb, previous: WikiStore, next: WikiStore) {
  for (const [slug, edit] of Object.entries(next.edits)) {
    await db.insert(wikiEdits).values({ slug, editJson: JSON.stringify(edit), updatedAt: new Date().toISOString() }).onConflictDoUpdate({
      target: wikiEdits.slug,
      set: { editJson: JSON.stringify(edit), updatedAt: new Date().toISOString() },
    });
  }

  const known = new Set(previous.revisions.map(revisionKey));
  const added = next.revisions.filter((revision) => !known.has(revisionKey(revision)));
  if (added.length) {
    await db.insert(wikiRevisions).values(added.map((revision) => ({
      slug: revision.slug,
      title: revision.title,
      summary: revision.summary,
      timestamp: revision.timestamp,
      userId: revision.userId || "anonymous",
      userName: revision.userName || "用户",
      picture: revision.picture || null,
    })));
  }

  const oldRows = await db.select({ id: wikiRevisions.id }).from(wikiRevisions).orderBy(desc(wikiRevisions.timestamp), desc(wikiRevisions.id)).limit(5000).offset(5000);
  if (oldRows.length) await db.delete(wikiRevisions).where(inArray(wikiRevisions.id, oldRows.map((row) => row.id)));
  return next;
}

export function updateWikiStore(update: (store: WikiStore) => WikiStore) {
  const operation = writeChain.then(async () => {
    const db = await getCloudDb();
    const current = db ? await readCloudStore(db) : await readLocalStore();
    const next = update(current);
    return db ? writeCloudStore(db, current, next) : writeLocalStore(next);
  });
  writeChain = operation.then(() => undefined, () => undefined);
  return operation;
}
