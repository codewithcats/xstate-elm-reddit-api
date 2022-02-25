import { createMachine, assign } from "xstate";

type Context = { subreddit: string };
type SelectEvent = { type: "SELECT"; name: string };
type RedditEvents = SelectEvent;

function invokeFetchSubreddit(context: Context) {
  const { subreddit } = context;

  return fetch(`https://www.reddit.com/r/${subreddit}.json`)
    .then((response) => response.json())
    .then((json) => json.data.children.map((child) => child.data));
}

const redditMachine = createMachine({
  schema: {
    context: {} as Context,
    events: {} as RedditEvents,
  },
  id: "reddit",
  context: {
    subreddit: null,
  },
  states: {
    idle: {},
    selected: {
      initial: "loading",
      states: {
        loading: {
          invoke: {
            id: "fetch-subreddit",
            src: invokeFetchSubreddit,
            onDone: "loaded",
            onError: "failed",
          },
        },
        loaded: {},
        failed: {},
      },
    },
  },
  initial: "idle",
  on: {
    SELECT: {
      target: ".selected",
      actions: assign<Context, SelectEvent>({
        subreddit: (_, event) => event.name,
      }),
    },
  },
});
