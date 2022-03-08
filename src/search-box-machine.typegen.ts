// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateSearchTerm: "SEARCH_BOX.SEARCH_TERM_CHANGED";
  };
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    isSearchTermLenghtValid: "SEARCH_BOX.SEARCH_TERM_CHANGED";
    isSearchTermLenghtInvalid: "SEARCH_BOX.SEARCH_TERM_CHANGED";
  };
  eventsCausingDelays: {};
  matchesStates: "idle" | "ready" | "searching";
  tags: never;
}
