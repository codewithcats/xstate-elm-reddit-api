import { interpret, toActorRef } from "xstate";
import { createRedditMachine } from "./reddit-machine";
import { createSubredditMachine } from "./subreddit-matchine";
import { inspect } from "@xstate/inspect";
// @ts-ignore
import { Elm } from "./Main.elm";
import { registerActor, sendEvent } from "./actor-registry";

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const elm = Elm.Main.init({
  node: document.querySelector("main"),
  flags: {},
});

const redditMachine = createRedditMachine(createSubredditMachine);

const redditInterpreter = interpret(redditMachine, {
  devTools: true,
});
registerActor("REDDIT", redditInterpreter, redditMachine.events);

redditInterpreter.onTransition((state) => {
  elm.ports.stateChanged.send(state);
});

elm.ports.event.subscribe((event: any) => {
  sendEvent(event);
});

redditInterpreter.start();
