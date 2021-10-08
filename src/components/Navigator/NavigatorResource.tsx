import React, { useEffect } from "react";
import { fromVtt } from "subtitles-parser-vtt";
import NavigatorCue from "components/Navigator/NavigatorCue";

interface NavigatorResource {
  currentTime: number;
  id: string;
}

interface Cue {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

const NavigatorResource: React.FC<NavigatorResource> = ({
  currentTime,
  id,
}) => {
  const [cues, setCues] = React.useState<Array<Cue>>([]);
  useEffect(() => {
    fetch(id, {
      headers: {
        "Content-Type": "text/plain",
        Accept: "application/json",
      },
    })
      .then((response) => response.text())
      .then((data) => {
        setCues(fromVtt(data) as unknown as Array<Cue>);
      })
      .catch((error) => console.error(id, error.toString()));
  }, [id]);

  return (
    <>
      {cues.map(({ id, text, startTime }) => (
        <NavigatorCue
          label={text}
          startTime={startTime}
          t={currentTime}
          key={id}
        />
      ))}
    </>
  );
};

export default NavigatorResource;
