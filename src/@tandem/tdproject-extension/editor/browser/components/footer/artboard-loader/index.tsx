import React =  require("react");
import { Status } from "@tandem/common/status";
import { Workspace } from "@tandem/editor/browser/stores";
import { SyntheticTDArtboardElement } from "@tandem/tdproject-extension/synthetic/elements";
import { StatusComponent } from "@tandem/editor/browser/components";

export class ArtboardLoaderComponent extends React.Component<{ workspace: Workspace }, any> {
  render() {
    const { workspace } = this.props;
    if (!workspace) return null;
    workspace.documentQuerier.queriedElements
    const found = (workspace.documentQuerier.queriedElements.filter((element) => element.tagName === "artboard") as SyntheticTDArtboardElement[]).find((artboard) => {
      return artboard.status && (artboard.status.type === Status.LOADING || artboard.status.type === Status.ERROR);
    });

    return <StatusComponent status={found && found.status} />

  }
}