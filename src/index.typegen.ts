// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateName: "SELECT";
    updatePosts: "done.invoke.fetch-subreddit";
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
    services: "fetchSubreddit";
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    fetchSubreddit: "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "idle"
    | "selected"
    | "selected.loading"
    | "selected.loaded"
    | "selected.failed"
    | { selected?: "loading" | "loaded" | "failed" };
  tags: never;
}
