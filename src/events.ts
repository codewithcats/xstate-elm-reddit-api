export type MachineEvent =
  | { type: "SUBREDDIT_UPDATED"; subreddit: string }
  | { type: "SUBREDDIT.LOADED" }
  | {
      type: "SEARCH_BOX.SEARCH_TERM_CHANGED";
      searchTerm: string;
    }
  | {
      type: "SEARCH_BOX.SEARCH_CLICKED";
      searchTerm: string;
    };
