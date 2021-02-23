import * as React from "react";
import * as Etebase from "etebase";
import MiniSearch, { Options, SearchResult } from "minisearch";
import { findAll } from "highlight-words-core";
import { FlatList, View, Text } from "react-native";
import { List, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { useCredentials } from "../credentials";
import { useSyncGate } from "../SyncGate";
import { StoreState } from "../store";

import Link from "../widgets/Link";
import { DefaultNavigationProp } from "../NavigationConfig";
import SearchToolbar from "../widgets/SearchToolbar";


type NoteData = { name: string, content: string, id: string };

const msOptions: Options = {
  fields: ["name", "content"],
  storeFields: ["name", "content"],
  searchOptions: {
    boost: { name: 2 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: "AND",
  },
};
const minisearch = new MiniSearch<NoteData>(msOptions);

type ResultChunk = {
  text: string;
  index: number;
  match: boolean;
};

type HighLightProps = { children: React.ReactNode };

function Highlight(props: HighLightProps) {
  const theme = useTheme();
  return (
    <Text style={{ backgroundColor: theme.colors.accent, color: theme.colors.text }}>
      {props.children}
    </Text>
  );
}

// Estimated mean number of characters visible on a single line on a smartphone
const MIN_CHARACTERS = 40;
// Arbitrary, this should be enough to render enough context on any platform
const MAX_CHARACTERS = 200;

type ResultProps = { text: string, search: string, matches: string[] };

function Result(props: ResultProps) {
  const { text, search, matches } = props;
  const displayChunks: ResultChunk[] = [];
  let snippet = text;
  let snippetStart = 0;
  let snippetEnd = text.length - 1;

  if (snippet.length > MIN_CHARACTERS) {
    let firstMatchStart = -1;
    let firstMatchEnd = -1;

    // If there are several terms, try an exact match first
    // This won't work with a single term because we would have to tokenize the text to avoid partial matches
    const tokenize: (text: string) => string[] = MiniSearch.getDefault("tokenize");
    const searchTerms = tokenize(search);
    if (searchTerms.length > 1) {
      firstMatchStart = text.toLowerCase().indexOf(search.toLowerCase());
      firstMatchEnd = firstMatchStart + search.length;
    }

    // If there's no match, get the first match in the array, it should be the closest match to the first term
    // FIXME Maybe use an exact match of another term first
    if (firstMatchStart === -1) {
      firstMatchStart = text.toLowerCase().indexOf(matches[0]);
      firstMatchEnd = firstMatchStart + matches[0].length - 1;
    }

    // Try to get ~10 characters before for context
    snippetStart = Math.max(0, firstMatchStart - 10);
    if (firstMatchStart > 0) {
      // If there's a new line before, remove it with everything that comes before it
      let before = text.slice(snippetStart, firstMatchStart).trimStart();
      const chunks = before.split("\n");
      if (chunks.length > 1) {
        const lastChunk = chunks[chunks.length - 1];
        if (lastChunk) {
          before = lastChunk.trimStart();
        }
      }
      snippetStart = firstMatchStart - before.length;
    }

    // Try to get enough characters to have enough context, but not too much so we don't have too
    // much to parse afterwards.
    snippetEnd = Math.min(text.length, snippetStart + MAX_CHARACTERS);
    if (firstMatchEnd < text.length - 1) {
      // If there's more than one new line after, remove it with everything that comes after it
      let after = text.slice(firstMatchEnd + 1, snippetEnd).trimEnd();
      const chunks = after.split("\n");
      if (chunks.length > 2) {
        after = chunks.slice(0, 2).join("\n").trimEnd();
      }
      snippetEnd = firstMatchEnd + after.length;
    }
  }
  snippet = text.slice(snippetStart, snippetEnd + 1);
  
  if (snippetStart > 0) {
    displayChunks.push({
      text: "…",
      index: snippetStart - 1,
      match: false,
    });
  }

  const chunks = findAll({
    searchWords: matches,
    textToHighlight: snippet,
  });
  chunks.map(({ start, end, highlight }) => {
    displayChunks.push({
      text: snippet.substr(start, end - start),
      index: snippetStart + start,
      match: highlight,
    });
  });

  if (snippetEnd < text.length - 1) {
    displayChunks.push({
      text: "…",
      index: snippetEnd + 1,
      match: false,
    });
  }

  return (
    <Text>
      {displayChunks.map((chunk) => {
        return (chunk.match) ? <Highlight key={chunk.index}>{chunk.text}</Highlight>
          : <React.Fragment key={chunk.index}>{chunk.text}</React.Fragment>;
      })}
    </Text>
  );
}

type PropsType = {
  active: boolean;
};

export default function Search(props: PropsType) {
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const cacheItems = useSelector((state: StoreState) => state.cache.items);
  const etebase = useCredentials()!;
  const syncGate = useSyncGate();
  const theme = useTheme();
  const { active } = props;
  const [value, setValue] = React.useState("");
  const [entries, setEntries] = React.useState<SearchResult[]>([]);
  const navigation = useNavigation<DefaultNavigationProp>();

  React.useEffect(() => {
    if (!active) {
      return;
    }

    navigation.setOptions({
      header: () => (
        <SearchToolbar
          value={value}
          onChangeText={(text) => setValue(text)}
        />
      ),
    });
  }, [active, navigation, cacheCollections, value]);

  React.useEffect(() => {
    if (syncGate) {
      return;
    }
    
    (async () => {
      const notesList: NoteData[] = [];
      const colMgr = etebase.getCollectionManager();

      for (const [colUid, itemsList] of cacheItems.entries()) {
        const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
        const itemMgr = colMgr.getItemManager(col);

        for (const [uid, cachedItem] of itemsList.entries()) {
          if (cachedItem.isDeleted) {
            continue;
          }
          const item = itemMgr.cacheLoad(cachedItem.cache);
          // FIXME We need to remove the markdown formatting and the repeated new lines to have nicer results
          const content = await item.getContent(Etebase.OutputFormat.String);

          notesList.push({ name: cachedItem.meta.name!, content, id: `${colUid}:${uid}` });
        }
      }
      minisearch.removeAll();
      minisearch.addAll(notesList);
    })();
  }, [syncGate, cacheCollections, cacheItems]);

  React.useEffect(() => {
    if (syncGate) {
      return;
    }

    if (value && minisearch.documentCount > 0) {
      const results = minisearch.search(value);
      setEntries(results);
    } else if (entries.length > 0) {
      setEntries([]);
    }
  }, [syncGate, cacheCollections, cacheItems, value]);

  if (syncGate) {
    return syncGate;
  }

  function renderEntry(param: { item: SearchResult }) {
    const result = param.item;
    const [colUid, itemUid] = result.id.split(":");

    const nameMatches: string[] = [];
    const contentMatches: string[] = [];
    for (const term of result.terms) {
      if (result.match[term].includes("name")) {
        nameMatches.push(term);
      }
      if (result.match[term].includes("content")) {
        contentMatches.push(term);
      }
    }

    return (
      <Link
        key={result.id}
        to={`/notebook/${colUid}/note/${itemUid}`}
        renderChild={(props) => (
          <List.Item
            {...props}
            title={(nameMatches.length > 0) ? <Result text={result.name} search={value} matches={nameMatches} /> : result.name}
            description={(contentMatches.length > 0) ? <Result text={result.content} search={value} matches={contentMatches} /> : result.content}
          />
        )}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        style={[{ backgroundColor: theme.colors.background }, { flex: 1 }]}
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        maxToRenderPerBatch={10}
        ListEmptyComponent={() => value ? (
          <List.Item
            title={`No notes match "${value}"`}
          />
        ) : null}
      />
    </View>
  );
}
