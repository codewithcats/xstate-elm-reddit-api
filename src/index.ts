import { interpret } from "xstate";
import { createRedditMachine } from "./reddit-machine";
import { createSubredditMachine } from "./subreddit-matchine";
import { inspect } from "@xstate/inspect";
// @ts-ignore
import { Elm } from "./Main.elm";

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const elm = Elm.Main.init({
  node: document.querySelector("main"),
  flags: {},
});

const machine = interpret(createRedditMachine(createSubredditMachine), {
  devTools: true,
});

machine.onTransition((state) => {
  elm.ports.stateChanged.send(state);
});

elm.ports.event.subscribe((event: any) => {
  console.log("machine event", event);
  const [machineName] = (event.type as string).split(".");
  switch (machineName) {
    case "SEARCH_BOX": {
      machine.getSnapshot().context.searchBox.send(event);
    }
    default: {
      machine.send(event);
    }
  }
});

machine.start();
