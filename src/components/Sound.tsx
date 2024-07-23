import React from "react";

import win from "../assets/audio/win.wav";
import fail from "../assets/audio/fail.wav";
import coin from "../assets/audio/coin.wav";
import slotmachine from "../assets/audio/slotmachine.wav";
import jingle from "../assets/audio/jingle.wav";
// import start from "../assets/audio/start.wav";

interface SoundProps {
  audio: "win" | "fail" | "coin" | "slotmachine" | "jingle";
}

const audios: Record<string, string> = { win, fail, coin, slotmachine, jingle };

const Sound: React.FC<SoundProps> = ({ audio }) => {
  if (!audio) return null; // Don't render the audio element if audio is an empty string

  return (
    <audio
      autoPlay
      preload="auto"
      onCanPlayThrough={() => {
        // Optionally, you can log or handle when audio is ready to play
      }}
    >
      <source src={audios[audio]} />
    </audio>
  );
};

export default Sound;
