// Everything that's still being decided lives here, so one edit updates the whole site.

// Set this once the artist name is settled, e.g. 'Little Big Cat' or "Rip's BedLunch Band".
// While it's null, the site shows the names still in the running.
export const ARTIST_NAME: string | null = null

export const NAME_CANDIDATES = ['Little Big Cat', 'Rip’s BedLunch', 'Rip’s BedLunch Band']

export const releases = [
  {
    kind: 'EP',
    title: 'BedLunch',
    order: 'First up',
    when: 'Release date TBA',
    body: 'A short record to start things off. It comes out before the album.',
    art: 'bedlunch',
  },
  {
    kind: 'Album',
    title: 'Little Big Cat',
    order: 'Then',
    when: 'Release date TBA',
    body: 'The full-length album this site is named for.',
    art: 'cat',
  },
] as const
