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
          entry: "updateSearchBox",
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
            const subredditMachine = spawn(
              _createSubredditMachine(event.subreddit),
              { sync: true }
            );
            return { ...context, subredditMachine };
          }
        }),
        updateSearchBox: assign((context) => {
          if (context.searchBox) {
            return context;
          } else {
            const searchBox = spawn(searchBoxMachine, {
              sync: true,
            });
            registerActor(searchBox, "SEARCH_BOX");
            return { ...context, searchBox };
          }
        }),
      },
    }
  );
