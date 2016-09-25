import * as sift from "sift";
import { debounce } from "lodash";
import { DOMRenderer } from "./renderer";
import { ModuleImporter } from "./importer";
import { EnvironmentKind } from "./environment";
import { renderSyntheticJSX } from "./synthetic";
import { SyntheticDocument } from "./synthetic";
import { WrapBus, AcceptBus } from "mesh";
import { ModuleImporterAction } from "./actions";
import { BrokerBus, IActor, Action } from "tandem-common";
import { Dependencies, MainBusDependency } from "tandem-common/dependencies";
import { SymbolTable, SyntheticValueObject } from "./synthetic";
import { IFileSystem, FileSystem, CachedFileSystem } from "./file-system";

export class Browser {

  private _bus: BrokerBus;
  private _fileChangeObserver: IActor;
  private _fileSystem: IFileSystem;
  private _importer: ModuleImporter;
  private _window: SymbolTable;
  private _currentFileName: string;

  readonly renderer: DOMRenderer;

  constructor(private _dependencies: Dependencies) {
    this._bus = new BrokerBus();
    this._fileSystem     = new CachedFileSystem(new FileSystem(_dependencies));
    this._window = new SymbolTable();

    // TODO - renderer should be separate from Browser
    // instance to support other devices
    this.renderer = new DOMRenderer(this);
  }

  get window(): SymbolTable {
    return this._window;
  }

  async open(fileName: string) {

    if (this._importer) {
      this._importer.dispose();
    }

    this._currentFileName = fileName;

    const window = new SymbolTable();
    window.set("window", window);
    window.set("document", new SyntheticDocument());
    window.set("console", new SyntheticValueObject(console));
    window.set("renderJSX", renderSyntheticJSX);

    // todo only have one instance here
    this._importer = new ModuleImporter(this._fileSystem, this._dependencies, window);
    this._importer.observe(new WrapBus(this.onImportedFileChange.bind(this)));

    // since evaluation happens as the user is modifying the docuent, errors will
    // definitely occur -- don't like that break other things
    try {
      await this._importer.require(EnvironmentKind.DOM, fileName);
    } catch (e) {

      // TODO - do something with this
      console.error(e);
      return;
    }

    // patch the window memory to maintain existing references
    this._window.patch(window);
  }

  protected onImportedFileChange(action: Action) {
    this.reopen();
  }

  // throttle in case the user is typing really really fast
  private reopen = debounce((() => this.open(this._currentFileName)), 10);
}