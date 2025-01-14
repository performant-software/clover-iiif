import {
  type CustomDisplay,
  ViewerConfigOptions,
} from "src/context/viewer-context";
import dynamic from "next/dynamic";
import { isDark } from "docs/lib/theme";
import { useRouter } from "next/router";

// todo: set this as a constant somewhere?
const defaultIiifContent =
  "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif";

const Viewer = dynamic(() => import("src/components/Viewer"), {
  ssr: false,
});

const CloverViewer = ({
  iiifContent = defaultIiifContent,
  options,
  customDisplays,
}: {
  iiifContent: string;
  options?: ViewerConfigOptions;
  customDisplays?: Array<CustomDisplay>;
}) => {
  const router = useRouter();
  const iiifResource = router.query["iiif-content"]
    ? (router.query["iiif-content"] as string)
    : iiifContent;

  const background = isDark() ? "rgb(17, 17, 17)" : "#fff";

  return (
    <Viewer
      iiifContent={iiifResource}
      options={{ ...options, background }}
      key={iiifContent}
      {...(customDisplays && { customDisplays })}
    />
  );
};

export default CloverViewer;
