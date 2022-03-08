import { ActorRefFrom, assign, createMachine, spawn } from "xstate";
import { createSubredditMachine } from "./subreddit-matchine";
import { searchBoxMachine } from "./search-box-machine";
import { registerActor } from "./actor-registry";

export type Context = {
  subredditOptions: string[];
  subredditMachine: ActorRefFrom<ReturnType<typeof createSubredditMachine>>;
  searchBox: ActorRefFrom<typeof searchBoxMachine>;
};
type SelectEvent = { type: "SELECT"; subreddit: string };

export const createRedditMachine = (
  _createSubredditMachine: typeof createSubredditMachine
) =>
  createMachine(
    {
      tsTypes: {} as import("./reddit-machine.typegen").Typegen0,
      id: "reddit",
      schema: {
        context: {} as Context,
        events: {} as SelectEvent,
      },
      context: {
        subredditOptions: ["elm", "react", "angular"],
        subredditMachine: null,
        searchBox: null,
      },
      states: {
        idle: {
          entry: ["updateSearchBox", "updateSubreddit"],
        },
        subredditSelected: {},
      },
      initial: "idle",
      on: {
        SELECT: {
          target: ".subredditSelected",
          actions: "updateSubreddit",
        },
      },
    },
    {
      actions: {
        updateSubreddit: assign((context, event) => {
          if (context.subredditMachine) {
            context.subredditMachine.send({
              type: "SUBREDDIT_UPDATED",
              subreddit: event.subreddit,
            });
            return context;
          } else {
            const machine = _createSubredditMachine(event.subreddit);
            const subredditActor = spawn(machine, { sync: false });
            registerActor("SUBREDDIT", subredditActor, machine.events);
            return { ...context, subredditMachine: subredditActor };
          }
        }),
        updateSearchBox: assign((context) => {
          if (context.searchBox) {
            return context;
          } else {
            const searchBox = spawn(searchBoxMachine, {
              sync: false,
            });
            registerActor("SEARCH_BOX", searchBox, searchBoxMachine.events);
            return { ...context, searchBox };
          }
        }),
      },
    }
  );
