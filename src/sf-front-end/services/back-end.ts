import { loggable } from "sf-core/decorators";
import IOService from "sf-common/services/io";
import * as SocketIOClient from "socket.io-client";
import { IApplication } from "sf-core/application";
import { ApplicationServiceDependency } from "sf-core/dependencies";

@loggable()
export default class BackEndService extends IOService<IApplication> {

  private _client: SocketIOClient.Socket;

  /**
   * initializes the back-end actor
   */

  async load() {
    await super.load();

    if (!this.app.config.backend || !this.app.config.backend.port) {
      return;
    }

    this.logger.info("starting socket.io client on port %d", this.app.config.backend.port);
    this._client = SocketIOClient(`//${window.location.hostname}:${this.app.config.backend.port}`);
    await this.addConnection(this._client);
  }

}

export const dependency = new ApplicationServiceDependency("back-end", BackEndService);
