import mergeHTML from "./merge-html";
import { IActor } from "sf-core/actors";
import * as pretty from "pretty";
import { BubbleBus } from "sf-core/busses";
import { Observable } from "sf-core/observable";
import { DocumentFile } from "sf-front-end/models/base";
import { HTML_MIME_TYPE } from "sf-html-extension/constants";
import { inject, bindable } from "sf-core/decorators";
import { HTMLDocumentEntity } from "sf-html-extension/models/entities/html";
import { parse as parseHTML } from "sf-html-extension/parsers/html";
import { IEntity, IEntityDocument } from "sf-core/entities";
import { IActiveRecord, ActiveRecord } from "sf-core/active-records";
import { PropertyChangeAction, UpdateAction } from "sf-core/actions";
import {
  IInjectable,
  MAIN_BUS_NS,
  Dependencies,
  DEPENDENCIES_NS,
  ClassFactoryDependency,
  ActiveRecordFactoryDependency,
} from "sf-core/dependencies";

export class HTMLFile extends DocumentFile implements IInjectable {

  @bindable()
  public path: string;

  @bindable()
  public content: string;

  readonly idProperty: string = "path";
  readonly type: string = HTML_MIME_TYPE;

  @inject(DEPENDENCIES_NS)
  private _dependencies: Dependencies;

  private _entityObserver: IActor;
  private _document: HTMLDocumentEntity;

  serialize() {
    return {
      path: this.path,
      content: this.content
    };
  }

  deserialize(data: { path: string, content: string }) {
    this.path    = data.path;

    const oldContent = this.content;
    this.content = data.content;

    if (this.content !== oldContent) {
      this._document.load(this.content);
    }
  }

  didInject() {
    this._document       = new HTMLDocumentEntity(this, this._dependencies);
    this._entityObserver = new BubbleBus(this);

    this._document.observe(new BubbleBus(this));
  }

  /**
   * The entity object created from content
   */

  get document() {
    return this._document;
  }

  /**
   * Loads the entity - gets called whenever the data changes
   * on this file object
   */

  // private async _loadDocument() {
  //   if (this._entity) this._entity.unobserve(this._entityObserver);
  //   this._entity = await this._engine.load(parseHTML(this.content));

  //   // re-notify observers of this model when the entity changes
  //   this._entity.observe(this._entityObserver);

  //   // notify observers that the file has changed
  //   this.notify(new PropertyChangeAction("entity", this._entity, undefined));
  // }

  /**
   */

  public async save() {

    // copy whitespace over to new content
    // this.content = mergeHTML(this.content, this._entity.source.toString());

    await this._document.sync();

    // TODO - beautify HTML here.
    this.content = pretty(this._document.root.source.toString());

    return super.save();
  }
}

export const htmlFileModelDependency = new ActiveRecordFactoryDependency("text/html", HTMLFile);
