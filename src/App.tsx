import axios from "axios";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import moment from "moment";
import WaveSurfer from "wavesurfer.js";
// @ts-ignore
import CursorPlugin from "./plugins/wavesurfer.cursor.js";

export interface Links {
  self: string;
  git: string;
  html: string;
}

export enum Type {
  File = "file",
}

export interface IMusic {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: Type;
  _links: Links;
}

function Music({ music, index }: { music: IMusic; index: number }) {
  const [length, setLength] = useState<number>(0);
  const [waveform, setWaveform] = useState<WaveSurfer>();
  const [playing, setPlaying] = useState<boolean>(false);

  useEffect(() => {
    const track = document.getElementById("track" + index) as HTMLAudioElement;
    const waveform = WaveSurfer.create({
      container: `#waveform${index}`,
      progressColor: "rgb(148 163 184)",
      cursorColor: "transparent",
      waveColor: "rgb(50 50 53)",
      fillParent: true,
      barWidth: 3,
      height: 40,
      plugins: [
        CursorPlugin.create({
          color: "rgb(148 163 184)",
          opacity: 1,
        }),
      ],
    });

    if (track) {
      waveform.load(track);

      waveform.on("ready", () => {
        setWaveform(waveform);
        waveform.drawBuffer();
      });
    }

    return () => {
      waveform.destroy();
    };
  }, []);

  return (
    <tr className="gap-12">
      <td className="flex items-center flex-shrink-0 py-8">
        <span className="w-16">{(index + 1).toString().padStart(3, "0")}</span>
        <button
          className="mr-4"
          onClick={() => {
            if (waveform) {
              setPlaying(!playing);
              waveform.playPause();
            }
          }}
        >
          <Icon icon={playing ? "akar-icons:pause" : "akar-icons:play"} />
        </button>
        <a href={music.html_url} className="whitespace-nowrap">
          {music.name.split(".").shift()}
        </a>
      </td>
      <td className="w-full px-24">
        <div id={`waveform${index}`} className="w-full" />
      </td>
      <audio
        id={`track${index}`}
        src={music.download_url}
        onLoadedMetadata={(e) => {
          setLength((e.target as HTMLAudioElement).duration);
          console.log((e.target as HTMLAudioElement).duration);
        }}
      />
      <td className="w-16 pr-4">
        <div className="flex items-center gap-2">
          <Icon icon="akar-icons:clock" className="flex-shrink-0" />
          {moment.utc(length * 1000).format("mm:ss")}
        </div>
      </td>
      <td>
        <button className="border-2 px-6 py-2 border-slate-400 uppercase tracking-[0.2em] text-xs font-medium">
          Download
        </button>
      </td>
    </tr>
  );
}

function App() {
  const [musics, setMusics] = useState<IMusic[]>([]);

  useEffect(() => {
    axios("https://api.github.com/repos/melvinchia3636/Music/contents/", {
      method: "GET",
      headers: {
        Authorization: "token " + import.meta.env.VITE_API_KEY,
      },
    }).then(({ data }: { data: IMusic[] }) => setMusics(data));
  }, []);

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-slate-400 font-['MiSans'] flex p-32 flex-col items-center">
      <p className="text-sm uppercase tracking-[0.2em] mb-2 font-['Jetbrains_Mono']">&lt;CODEBLOG/&gt;</p>
      <h1 className="text-3xl uppercase tracking-[0.2em]">Music Archive</h1>
      <table className="w-full items-center my-12">
        <tbody className="divide-y divide-zinc-800">
          {musics.slice(0, 12).map((music, index) => (
            <Music music={music} key={index} index={index} />
          ))}
        </tbody>
      </table>
      <Icon icon="akar-icons:play" className="hidden" />
      <Icon icon="akar-icons:pause" className="hidden" />
      <a href="https://www.thecodeblog.net" target="_blank" rel="noreferrer" className="mt-16 uppercase tracking-[0.2em] mb-2 font-['Jetbrains_Mono'] hover:text-amber-400">&lt;CODEBLOG/&gt;</a>
      <p className="mt-2 text-xs">Made with 🤍 by <a className="underline" href="https://github.com/melvinchia3636" rel="noreferrer">Melvin Chia</a>. Project under MIT license.</p>
    </div>
  );
}

export default App;
