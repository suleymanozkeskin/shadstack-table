export interface HighlightChunk {
  key: string;
  match: boolean;
  text: string;
}

export interface HighlightWordsOptions {
  clipBy?: number;
  matchExactly?: boolean;
  query: string;
  text: string;
}

interface ClipArgs {
  clipBy?: number;
  curr: HighlightChunk;
  next?: HighlightChunk;
  prev?: HighlightChunk;
}

const chunkExists = (chunk: HighlightChunk | undefined): chunk is HighlightChunk =>
  typeof chunk !== 'undefined';

const hasMatch = (chunk: HighlightChunk | undefined): boolean =>
  chunkExists(chunk) && chunk.match;

const clip = ({ clipBy = 3, curr, next, prev }: ClipArgs): string => {
  const words = curr.text.split(' ');
  const len = words.length;

  if (curr.match || clipBy >= len) {
    return curr.text;
  }

  const ellipsis = '...';

  if (chunkExists(next) && chunkExists(prev) && hasMatch(prev) && hasMatch(next)) {
    if (len > clipBy * 2) {
      return [...words.slice(0, clipBy), ellipsis, ...words.slice(-clipBy)].join(' ');
    }
    return curr.text;
  }

  if (chunkExists(next) && hasMatch(next)) {
    return [ellipsis, ...words.slice(-clipBy)].join(' ');
  }

  if (chunkExists(prev) && hasMatch(prev)) {
    return [...words.slice(0, clipBy), ellipsis].join(' ');
  }

  return curr.text;
};

const escapeRegexp = (term: string): string =>
  term.replace(/[|\\{}()[\]^$+*?.-]/g, (char) => `\\${char}`);

const termsToRegExpString = (terms: string): string =>
  terms.replace(/\s{2,}/g, ' ').split(' ').join('|');

const regexpQuery = ({
  matchExactly = false,
  terms,
}: {
  matchExactly?: boolean;
  terms: string;
}): string => {
  if (typeof terms !== 'string') {
    throw new TypeError('Expected a string');
  }
  const escapedTerms = escapeRegexp(terms.trim());
  return `(${matchExactly ? escapedTerms : termsToRegExpString(escapedTerms)})`;
};

const buildRegexp = ({
  matchExactly = false,
  terms,
}: {
  matchExactly?: boolean;
  terms: string;
}): RegExp => {
  try {
    const fromString = /^([/~@;%#'])(.*?)\1([gimsuy]*)$/.exec(terms);
    if (fromString) {
      return new RegExp(fromString[2]!, fromString[3]);
    }
    return new RegExp(regexpQuery({ matchExactly, terms }), 'ig');
  } catch {
    throw new TypeError('Expected terms to be either a string or a RegExp!');
  }
};

const HEX = (() => {
  let idx = 36;
  let hex = '';
  while (idx--) {
    hex += idx.toString(36);
  }
  return hex;
})();

const uid = (len = 11): string => {
  let str = '';
  let num = len;
  while (num--) {
    str += HEX[(Math.random() * 36) | 0];
  }
  return str;
};

const hasLength = (str: string): boolean => str.length > 0;

export const highlightWords = ({
  clipBy,
  matchExactly = false,
  query,
  text,
}: HighlightWordsOptions): HighlightChunk[] => {
  const safeQuery = typeof query === 'string' ? query.trim() : query;
  if (safeQuery === '') {
    return [{ key: uid(), match: false, text }];
  }
  const searchRegexp = buildRegexp({ matchExactly, terms: query });
  return text
    .split(searchRegexp)
    .filter(hasLength)
    .map<HighlightChunk>((str) => ({
      key: uid(),
      match: matchExactly
        ? str.toLowerCase() === safeQuery.toLowerCase()
        : searchRegexp.test(str),
      text: str,
    }))
    .map((chunk, index, chunks) => ({
      ...chunk,
      ...(typeof clipBy === 'number' && {
        text: clip({
          clipBy,
          curr: chunk,
          ...(index < chunks.length - 1 && { next: chunks[index + 1] }),
          ...(index > 0 && { prev: chunks[index - 1] }),
        }),
      }),
    }));
};

export default highlightWords;
