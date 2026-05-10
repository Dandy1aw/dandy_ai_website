import { getCollection, getEntry } from 'astro:content';

export type Note = {
  id: string;
  title: string;
  description: string;
  date: Date;
  updatedDate?: Date;
  tag: 'AI Tools' | 'Recommendation' | 'Product Engineering' | 'Thinking';
  readingTime: number;
  featured: boolean;
  draft: boolean;
};

type CollectionEntry = Awaited<ReturnType<typeof getCollection<'notes'>>>[number];

function toNote(entry: CollectionEntry): Note {
  return { id: entry.id, ...entry.data };
}

export async function getNotes(): Promise<Note[]> {
  const entries = await getCollection('notes', ({ data }) => !data.draft);
  return entries
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map(toNote);
}

export async function getFeaturedNotes(): Promise<Note[]> {
  const all = await getNotes();
  const featured = all.filter(n => n.featured);
  if (featured.length >= 2) return featured.slice(0, 2);
  const nonFeatured = all.filter(n => !n.featured);
  return [...featured, ...nonFeatured].slice(0, 2);
}

export async function getNotesByTag(tag: Note['tag']): Promise<Note[]> {
  const all = await getNotes();
  return all.filter(n => n.tag === tag);
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const entry = await getEntry('notes', slug);
  if (!entry || entry.data.draft) return null;
  return toNote(entry);
}

export async function getRelatedNote(current: Note): Promise<Note | null> {
  const all = await getNotes();
  const sameTag = all.filter(n => n.tag === current.tag && n.id !== current.id);
  if (sameTag.length > 0) return sameTag[0];
  const others = all.filter(n => n.id !== current.id);
  return others[0] ?? null;
}
