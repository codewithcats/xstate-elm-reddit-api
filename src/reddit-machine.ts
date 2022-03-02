import { ActorRef, assign, createMachine, spawn } from "xstate";
import { createSubredditMachine } from "./subreddit-matchine";

export type Context = {
  subredditOptions: string[];
  subredditMachine: ActorRef<any>;
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
      },
      states: {
        idle: {},
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
      },
    }
  );
