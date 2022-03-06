const registry = new Map<string, any>();

/**
 * Register actor to retrieve it later using the given ID.
 * If no ID is passed, it will use actor's ID.
 * @param actorRef ActorRef
 * @param id string
 * @returns StateMachine
 */
export function registerActor<A extends { id: string }>(
  actorRef: A,
  id: string
): A {
  registry.set(id || actorRef.id, actorRef);
  return actorRef;
}

export function getActor<A>(id: string): A {
  return registry.get(id) as A;
}
