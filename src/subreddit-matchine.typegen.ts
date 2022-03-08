// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateSubreddit: "SUBREDDIT_UPDATED";
    updateSubredditWithSerchTerm: "SEARCH_BOX.SEARCH_CLICKED";
    updatePosts: "done.invoke.fetch-subreddit";
    notifyLoaded: "done.invoke.fetch-subreddit";
  };
  internalEvents: {
    "done.invoke.fetch-subreddit": {
      type: "done.invoke.fetch-subreddit";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
    "error.platform.fetch-subreddit": {
      type: "error.platform.fetch-subreddit";
      data: unknown;
    };
  };
  invokeSrcNameMap: {
    fetchSubreddit: "done.invoke.fetch-subreddit";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    fetchSubreddit: "SUBREDDIT_UPDATED" | "SEARCH_BOX.SEARCH_CLICKED";
  };
  eventsCausingGuards: {
    isSubredditValid: "SUBREDDIT_UPDATED";
  };
  eventsCausingDelays: {};
  matchesStates: "idle" | "loading" | "loaded" | "failed";
  tags: never;
}
