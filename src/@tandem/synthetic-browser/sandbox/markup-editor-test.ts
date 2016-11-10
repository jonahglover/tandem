import { expect } from "chai";
import { SyntheticBrowser, SyntheticHTMLElement } from "@tandem/synthetic-browser";
import { FileSystemProvider, FileEditorProvider } from "@tandem/sandbox";
import { generateRandomSyntheticHTMLElementSource } from "@tandem/synthetic-browser/test";
import { Application, waitForPropertyChange, LogLevel } from "@tandem/common";
import { createTestMasterApplication, createRandomFileName } from "@tandem/editor/test";

describe(__filename + "#", () => {
  let app: Application;
  before(async () => {
    app = createTestMasterApplication({
      // logLevel: LogLevel.WARN | LogLevel.ERROR,
      logLevel: LogLevel.NONE,
      sandboxOptions: {
        mockFiles: {}
      }
    });
    await app.initialize();
  });


  const loadHTML = async (source: string) => {
    const { injector } = app;
    const entryFilePath = createRandomFileName("html");
    const fs = FileSystemProvider.getInstance(injector);
    await fs.writeFile(entryFilePath, `<div>${source}</div>`);

    const browser = new SyntheticBrowser(injector);
    await browser.open({
      url: entryFilePath
    });

    return {
      entryFilePath: entryFilePath,
      body: browser.document.body,
      reloadBody: async () => {
        await waitForPropertyChange(browser.sandbox, "exports");
        return browser.document.body
      }
    };
  };

  const fuzzyCases = Array.from({ length: 30 }).map(() => {
    return [generateRandomSyntheticHTMLElementSource(4, 3), generateRandomSyntheticHTMLElementSource(4, 3)];
  });

  [
    [`<div id="a" />`, `<div id="b"></div>`],
    [`<div id="a" />`, `<div></div>`],
    [`<div />`, `<div id="b"></div>`],
    [`<div id="a" class="b" />`, `<div class="c" id="a"></div>`],
    [`<div>a</div>`, `<div>b</div>`],
    [`<div>a</div>`, `<div><!--b--></div>`],
    [`<div>a<!--b--><c /></div>`, `<div><!--b--><c />a</div>`],

    // busted fuzzy tests
    [
      `<g a="gca" a="geab"></g>`,
      `<g g="b" f="d"></g>`
    ],

    [
      `<g b="ed" g="ad"></g>`,
      `<g c="fad" g="fdbe" b="bdf"></g>`,
    ],

    // fuzzy
    ...fuzzyCases
  ].forEach(([oldSource, newSource]) => {
    it(`Can apply file edits from ${oldSource} to ${newSource}`, async () => {
      const oldResult = await loadHTML(oldSource);
      const newResult = await loadHTML(newSource);
      expect(oldResult.body.firstChild.source).not.to.be.undefined;
      const edit    = oldResult.body.firstChild.createEdit().fromDiff(newResult.body.firstChild);
      expect(edit.actions.length).not.to.equal(0);
      await FileEditorProvider.getInstance(app.injector).applyEditActions(...edit.actions);
      expect((await oldResult.reloadBody()).innerHTML.replace(/\n\s*/g, "")).to.equal(newResult.body.innerHTML);
    });
  });
});