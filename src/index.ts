import { ActorRef, interpret } from "xstate";
import { createRedditMachine } from "./reddit-machine";
import { createSubredditMachine } from "./subreddit-matchine";
import { inspect } from "@xstate/inspect";
// @ts-ignore
import { Elm } from "./Main.elm";
import { getActor } from "./actor-registry";

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const elm = Elm.Main.init({
  node: document.querySelector("main"),
  flags: {},
});

const redditMachine = interpret(createRedditMachine(createSubredditMachine), {
  devTools: true,
});

redditMachine.onTransition((state) => {
  elm.ports.stateChanged.send(state);
});

elm.ports.event.subscribe((event: any) => {
  console.log("machine event", event);
  const [machineId] = (event.type as string).split(".");
  const machine = getActor<ActorRef<any>>(machineId);
  if (machine) {
    machine.send(event);
  } else {
    redditMachine.send(event);
  }
});

redditMachine.start();
