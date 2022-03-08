import { assign, sendUpdate, createMachine } from "xstate";
import { MachineEvent } from "./events";

interface Context {
  searchTerm: string;
}

export const searchBoxMachine = createMachine(
  {
    tsTypes: {} as import("./search-box-machine.typegen").Typegen0,
    id: "search-box",
    schema: {
      context: {} as Context,
      events: {} as MachineEvent,
    },
    context: {
      searchTerm: "",
    },
    states: {
      idle: {
        entry: sendUpdate<
          Context,
          { type: "SEARCH_BOX.SEARCH_TERM_CHANGED"; searchTerm: string }
        >(),
        on: {
          "SEARCH_BOX.SEARCH_TERM_CHANGED": [
            {
              target: "ready",
              actions: "updateSearchTerm",
              cond: "isSearchTermLenghtValid",
            },
          ],
        },
      },
      ready: {
        entry: sendUpdate<
          Context,
          { type: "SEARCH_BOX.SEARCH_TERM_CHANGED"; searchTerm: string }
        >(),
        on: {
          "SEARCH_BOX.SEARCH_TERM_CHANGED": [
            {
              target: "idle",
              actions: "updateSearchTerm",
              cond: "isSearchTermLenghtInvalid",
            },
          ],
          "SEARCH_BOX.SEARCH_CLICKED": {
            target: "searching",
          },
        },
      },
      searching: {
        on: {
          "SUBREDDIT.LOADED": {
            target: "ready",
          },
        },
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
      isSearchTermLenghtInvalid: (_, event) => {
        return event.searchTerm.length <= 3;
      },
    },
  }
);
