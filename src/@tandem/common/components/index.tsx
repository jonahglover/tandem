import * as React from "react";
import { IActor } from "@tandem/common/actors";
import { inject } from "@tandem/common/decorators";
import {
  Injector,
  IInjectable,
  PrivateBusProvider,
  InjectorProvider,
} from "@tandem/common/ioc";

export interface IApplicationComponentContext {
  bus: IActor;
  dependencies: Injector;
}

export const appComponentContextTypes = {
  bus: React.PropTypes.object,
  dependencies: React.PropTypes.object
};

export class BaseApplicationComponent<T, U> extends React.Component<T, U> implements IInjectable {

  static contextTypes = appComponentContextTypes;

  @inject(PrivateBusProvider.ID)
  protected readonly bus: IActor;

  @inject(InjectorProvider.ID)
  protected readonly dependencies: Injector

  constructor(props: T, context: IApplicationComponentContext, callbacks: any) {
    super(props, context, callbacks);

    if (context.dependencies) {
      context.dependencies.inject(this);
    } else {
      console.error(`Failed to inject properties into `, this.constructor.name);
    }
  }

  $didInject() {

  }
}

export class RootApplicationComponent extends React.Component<IApplicationComponentContext, {}> implements IInjectable {

  static childContextTypes = appComponentContextTypes;

  getChildContext() {
    return {
      bus: this.props.bus,
      dependencies: this.props.dependencies
    };
  }

  render() {
    return <span>{ this.props.children } </span>;
  }
}