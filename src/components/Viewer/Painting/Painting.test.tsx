import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import ImageViewer from "../ImageViewer/ImageViewer";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import Painting from "./Painting";
import Placeholder from "src/components/Viewer/Painting/Placeholder";
import Player from "src/components/Viewer/Player/Player";
import React from "react";
import { Vault } from "@iiif/vault";
import { canvasWithPDFs } from "src/fixtures/viewer/custom-display/manifest-complex";
import customDisplayManifest from "public/manifest/custom-displays/pdf-no-placeholder.json";
import { manifestImage } from "src/fixtures/viewer/manifest-image";
import { manifestVideo } from "src/fixtures/viewer/manifest-video";

const painting: Array<LabeledIIIFExternalWebResource> = [
  {
    format: "image/tiff",
    height: 5792,
    id: "https://iiif.dc.library.northwestern.edu/iiif/2/e549a0f6-e4f4-4629-b6e2-f5c434189705/full/600,/0/default.jpg",
    service: [
      {
        id: "https://iiif.dc.library.northwestern.edu/iiif/2/e549a0f6-e4f4-4629-b6e2-f5c434189705",
        "@type": "ImageService2",
        profile: "http://iiif.io/api/image/2/level2.json",
      },
    ],
    type: "Image",
    width: 8688,
  },
];

const pdfPainting: Array<LabeledIIIFExternalWebResource> = [
  {
    type: "Image",
    format: "application/pdf",
    height: 1686,
    id: "http://localhost:3000/media/pdf/file-sample_150kB.pdf",
    width: 1192,
  },
];

const defaultProps = {
  activeCanvas:
    "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/1",
  isMedia: false,
  painting,
  resources: [],
  annotationResources: [],
};

// Mock child components
vi.mock("src/components/Viewer/Player/Player");
vi.mocked(Player).mockReturnValue(<div data-testid="mock-player">Player</div>);

vi.mock("src/components/Viewer/ImageViewer/ImageViewer");
vi.mocked(ImageViewer).mockReturnValue(
  <div data-testid="mock-image-viewer">ImageViewer</div>,
);

vi.mock("src/components/Viewer/Painting/Placeholder");
vi.mocked(Placeholder).mockReturnValue(
  <div data-testid="painting-placeholder">Placeholder</div>,
);

describe("Painting component", () => {
  const vault = new Vault();

  it("renders the Placeholder and toggle button when a placeholder canvas is present and its not a media file", async () => {
    await vault.loadManifest("", canvasWithPDFs);

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
        }}
      >
        <Painting {...defaultProps} />
      </ViewerProvider>,
    );

    expect(screen.getByTestId("placeholder-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("painting-placeholder")).toBeInTheDocument();
  });

  it("Bypasses the Placeholder toggle and image items as expected", async () => {
    await vault.loadManifest("", canvasWithPDFs);

    const props = {
      ...defaultProps,
      activeCanvas:
        "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2",
    };

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );
    expect(screen.queryByTestId("placeholder-toggle")).toBeNull();
  });

  it("displays the default Video viewer for Media files", async () => {
    await vault.loadManifest("", manifestVideo);

    const props = {
      ...defaultProps,
      activeCanvas:
        "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/access/0",
      isMedia: true,
    };

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );

    screen.debug();
    expect(screen.queryByTestId("placeholder-toggle")).toBeNull();
    expect(screen.getByTestId("mock-player")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-image-viewer")).not.toBeInTheDocument();
  });

  it("displays the default Image viewer for non-media files", async () => {
    await vault.loadManifest("", manifestImage);

    const props = {
      ...defaultProps,
      activeCanvas:
        "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2",
    };

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );

    expect(screen.queryByTestId("placeholder-toggle")).toBeNull();
    expect(screen.queryByTestId("mock-player")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-image-viewer")).toBeInTheDocument();
  });

  it.skip("renders the Choice select dropdown", () => {
    render(<Painting {...defaultProps} />);
    expect(screen.queryByTestId("choice-select")).toBeNull();
  });
});

describe("Painting Custom Display component", () => {
  const vault = new Vault();

  // Helper function which will map out the props passed to the custom component
  const MyComponent = (props) => {
    return (
      <div data-testid="custom-display">
        {Object.keys(props).map((key) => {
          return (
            <p key={key} data-testid={key}>
              {typeof props[key] === "object"
                ? JSON.stringify(props[key])
                : props[key]}
            </p>
          );
        })}
      </div>
    );
  };

  it("displays a custom component when targeting by a Canvas id", async () => {
    await vault.loadManifest("", customDisplayManifest);
    const canvasId = [
      "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0",
      "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/1",
    ];

    const props = {
      ...defaultProps,
      painting: pdfPainting,
      activeCanvas: canvasId[0],
    };

    const customDisplay = {
      display: {
        component: MyComponent,
      },
      target: {
        canvasId,
      },
    };

    const { rerender } = render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
          customDisplays: [customDisplay],
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );

    expect(await screen.findByTestId("custom-display")).toBeInTheDocument();

    // Passes the canvasId and annotationBody to the custom component
    const annotationBodyText = screen.getByTestId("annotationBody").textContent;
    expect(screen.getByTestId("id")).toHaveTextContent(canvasId[0]);
    expect(JSON.parse(annotationBodyText || "")).toMatchObject(
      props.painting[0],
    );

    expect(screen.queryByTestId("mock-image-viewer")).toBeNull();

    // Rerender with a different canvas id
    customDisplay.target.canvasId = ["i-am-not-a-canvas-id"];

    rerender(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
          customDisplays: [customDisplay],
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );
    expect(screen.queryByTestId("custom-display")).toBeNull();
    expect(screen.getByTestId("mock-image-viewer")).toBeInTheDocument();
  });

  it("displays a custom component when targeting by painting format", async () => {
    await vault.loadManifest("", customDisplayManifest);
    const canvasId =
      "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0";

    const props = {
      ...defaultProps,
      painting: pdfPainting,
      activeCanvas: canvasId,
    };

    const customDisplay = {
      display: {
        component: () => {
          return <div data-testid="custom-display">Custom Display</div>;
        },
      },
      target: {
        paintingFormat: ["application/pdf"],
      },
    };

    const { rerender } = render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
          customDisplays: [customDisplay],
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );

    expect(screen.getByTestId("custom-display")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-image-viewer")).toBeNull();

    // Rerender with a different painting format
    customDisplay.target.paintingFormat = ["image/tiff"];

    rerender(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
          customDisplays: [customDisplay],
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );
    expect(screen.queryByTestId("custom-display")).toBeNull();
    expect(screen.getByTestId("mock-image-viewer")).toBeInTheDocument();
  });

  it("displays the custom component when both targets are specified, and one matches", async () => {
    await vault.loadManifest("", customDisplayManifest);
    const canvasId = [
      "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0",
      "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/1",
    ];

    const props = {
      ...defaultProps,
      painting: pdfPainting,
      activeCanvas: canvasId[0],
    };

    const customDisplay = {
      display: {
        component: () => {
          return <div data-testid="custom-display">Custom Display</div>;
        },
      },
      target: {
        canvasId,
        paintingFormat: ["application/pdf", "foobar/pdf"],
      },
    };

    const { rerender } = render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
          customDisplays: [customDisplay],
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );

    expect(screen.getByTestId("custom-display")).toBeInTheDocument();

    // Rerender with a canvas ids not matching the activeCanvas
    customDisplay.target.canvasId = ["foo", "bar"];

    rerender(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
          customDisplays: [customDisplay],
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );
    expect(screen.getByTestId("custom-display")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-image-viewer")).toBeNull();

    // Rerender with values passed in that don't match
    customDisplay.target.paintingFormat = ["image/tiff"];

    rerender(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
          customDisplays: [customDisplay],
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );

    expect(screen.queryByTestId("custom-display")).toBeNull();
    expect(screen.getByTestId("mock-image-viewer")).toBeInTheDocument();
  });

  it("passes client-defined custom component props to the rendered custom component", async () => {
    await vault.loadManifest("", customDisplayManifest);
    const canvasId = [
      "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0",
      "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/1",
    ];

    const props = {
      ...defaultProps,
      painting: pdfPainting,
      activeCanvas: canvasId[0],
    };

    const customDisplay = {
      display: {
        component: MyComponent,
        componentProps: {
          foo: "bar",
        },
      },
      target: {
        canvasId,
      },
    };

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
          customDisplays: [customDisplay],
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );

    expect(await screen.findByTestId("custom-display")).toBeInTheDocument();
    expect(screen.getByTestId("id")).toHaveTextContent(canvasId[0]);
    expect(screen.getByTestId("foo")).toHaveTextContent("bar");
  });
});
