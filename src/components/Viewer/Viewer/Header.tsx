import {
  Header,
  HeaderOptions,
  IIIFBadgeButton,
  IIIFBadgeContent,
  ManifestLabel,
} from "./Header.styled";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import Collection from "src/components/Viewer/Collection/Collection";
import CopyText from "src/components/Viewer/CopyText";
import IIIFBadge from "src/components/Viewer/Viewer/IIIFBadge";
import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { Popover } from "src/components/internal";
import React from "react";
import Toggle from "./Toggle";
import { media } from "src/styles/stitches.config";
import { useMediaQuery } from "src/hooks/useMediaQuery";

interface Props {
  manifestId: string;
  manifestLabel: InternationalString;
}

const ViewerHeader: React.FC<Props> = ({ manifestId, manifestLabel }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { collection, configOptions } = viewerState;

  const { showTitle, showIIIFBadge, informationPanel } = configOptions;

  /**
   * Determine if header options should be rendered.
   */
  const hasOptions = showIIIFBadge || informationPanel?.renderToggle;
  const isSmallViewport = useMediaQuery(media.sm);

  return (
    <Header className="clover-viewer-header">
      {collection?.items ? (
        <Collection />
      ) : (
        <ManifestLabel className={!showTitle ? "visually-hidden" : ""}>
          {showTitle && <Label label={manifestLabel} className="label" />}
        </ManifestLabel>
      )}
      {hasOptions && (
        <HeaderOptions>
          {showIIIFBadge && (
            <Popover>
              <IIIFBadgeButton>
                <IIIFBadge />
              </IIIFBadgeButton>
              <IIIFBadgeContent>
                {collection?.items && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(collection.id, "_blank");
                    }}
                  >
                    View Collection
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(manifestId, "_blank");
                  }}
                >
                  View Manifest
                </button>{" "}
                {collection?.items && (
                  <CopyText
                    textPrompt="Copy Collection URL"
                    textToCopy={collection.id}
                  />
                )}
                <CopyText
                  textPrompt="Copy Manifest URL"
                  textToCopy={manifestId}
                />
              </IIIFBadgeContent>
            </Popover>
          )}
          {informationPanel?.renderToggle && !isSmallViewport && <Toggle />}
        </HeaderOptions>
      )}
    </Header>
  );
};

export default ViewerHeader;
