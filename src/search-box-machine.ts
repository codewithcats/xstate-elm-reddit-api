import { assign, createMachine } from "xstate";

interface Context {
  searchTerm: string;
}

export const searchBoxMachine = createMachine(
  {
    tsTypes: {} as import("./search-box-machine.typegen").Typegen0,
    id: "search-box",
    schema: {
      context: {} as Context,
      events: {} as {
        type: "SEARCH_BOX.SEARCH_TERM_CHANGED";
        searchTerm: string;
      },
    },
    context: {
      searchTerm: "",
    },
    states: {
      idle: {
        on: {
          "SEARCH_BOX.SEARCH_TERM_CHANGED": [
            {
              target: "ready",
              actions: "updateSearchTerm",
              cond: "isSearchTermLenghtValid",
            },
            { target: "idle", actions: "updateSearchTerm" },
          ],
        },
      },
      ready: {
        on: {
          "SEARCH_BOX.SEARCH_TERM_CHANGED": [
            {
              target: "ready",
              actions: "updateSearchTerm",
              cond: "isSearchTermLenghtValid",
            },
            { target: "idle", actions: "updateSearchTerm" },
          ],
        },
      },
      searching: {
        on: {},
      },
    },
    initial: "idle",
  },
  {
    actions: {
      updateSearchTerm: assign((context, event) => {
        return {
          ...context,
          searchTerm: event.searchTerm,
        };
      }),
    },
    guards: {
      isSearchTermLenghtValid: (_, event) => {
        return event.searchTerm.length > 3;
      },
    },
  }
);
