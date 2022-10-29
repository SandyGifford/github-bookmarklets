export type BookmarkletJSONConfig = {
  description?: string;
  label: string;
};

export type BookmarkletConfig = BookmarkletJSONConfig & {
  entry: string;
  name: string;
};

export type BookmarkletBuild = {
  label: string;
  scriptlet: string;
  description?: string;
};
