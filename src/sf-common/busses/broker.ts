import { Action } from "sf-common/actions";
import { IActor } from "sf-common/actors";
import { IBrokerBus } from "./base";
import { ParallelBus } from "mesh";

export class BrokerBus implements IBrokerBus {

  readonly actors: Array<IActor>;
  private _bus: IActor;

  constructor(busClass: { new(actors: Array<IActor>): IActor } = ParallelBus, ...actors: Array<IActor>) {
    this._bus = new busClass(this.actors = []);
    this.register(...actors);
  }

  register(...actors: Array<IActor>) {
    this.actors.push(...actors);
  }

  unregister(...actors: Array<IActor>) {
    for (const actor of actors) {
      const i = this.actors.indexOf(actor);
      if (i !== -1) {
        this.actors.splice(i, 1);
      }
    }
  }

  execute(action: Action) {
    return this._bus.execute(action);
  }
}