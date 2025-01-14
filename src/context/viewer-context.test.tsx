import {
  ViewerProvider,
  defaultState,
  useViewerDispatch,
  useViewerState,
} from "./viewer-context";
import { render, screen } from "@testing-library/react";

import React from "react";

describe("Viewer Context", () => {
  test("should render default state for the Provider", () => {
    function ChildComponent() {
      const state = useViewerState();
      return <div>{JSON.stringify(state)}</div>;
    }

    render(
      <ViewerProvider>
        <ChildComponent />
      </ViewerProvider>,
    );
    expect(screen.getByText(JSON.stringify(defaultState))).toBeInTheDocument();
  });

  test("Updates the state via dispatch", async () => {
    function ChildComponent() {
      const state = useViewerState();
      const dispatch: any = useViewerDispatch();

      React.useEffect(() => {
        dispatch({
          type: "updateActiveCanvas",
          canvasId: "https://example.com/iiif/canvas/1",
        });

        dispatch({
          type: "updateInformationOpen",
          informationOpen: true,
        });

        dispatch({
          type: "updateIsLoaded",
          isLoaded: false,
        });

        dispatch({
          type: "updateActiveManifest",
          manifestId: "https://example.com/iiif/manifest/1",
        });

        dispatch({
          type: "updateCollection",
          collection: {
            id: "https://example.com/iiif/collection/1",
            label: {
              en: ["Test Collection"],
            },
            items: [],
          },
        });

        dispatch({
          type: "updateConfigOptions",
          configOptions: {
            canvasIndex: 0,
            canvasNavigationId: "canvas-nav",
          },
        });
      }, []);

      return <div data-testid="el">{JSON.stringify(state)}</div>;
    }

    render(
      <ViewerProvider>
        <ChildComponent />
      </ViewerProvider>,
    );

    const el = screen.getByTestId("el").textContent;
    const elObj = el ? JSON.parse(el) : {};

    expect(elObj.activeCanvas).toEqual("https://example.com/iiif/canvas/1");
    expect(elObj.activeManifest).toEqual("https://example.com/iiif/manifest/1");
    expect(elObj.collection.id).toEqual(
      "https://example.com/iiif/collection/1",
    );
    expect(elObj.configOptions.canvasIndex).toEqual(0);
    expect(elObj.configOptions.canvasNavigationId).toEqual("canvas-nav");
    expect(elObj.informationOpen).toEqual(true);
    expect(elObj.isLoaded).toEqual(false);
  });

  test("throws an error on invalid action type", () => {
    function ChildComponent() {
      const dispatch: any = useViewerDispatch();

      React.useEffect(() => {
        dispatch({
          type: "invalid",
        });
      }, []);

      return <div data-testid="el"></div>;
    }

    expect(() => {
      render(
        <ViewerProvider>
          <ChildComponent />
        </ViewerProvider>,
      );
    }).toThrowError("Unhandled action type: invalid");
  });
});
