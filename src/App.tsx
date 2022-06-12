import axios from "axios";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import moment from "moment";
import WaveSurfer from "wavesurfer.js";
// @ts-ignore
import CursorPlugin from "./plugins/wavesurfer.cursor.js";
import InfiniteScroll from "react-infinite-scroller";

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
    const waveform = WaveSurfer.create({
      container: `#waveform${index}`,
      progressColor: "rgb(148 163 184)",
      cursorColor: "transparent",
      waveColor: "rgb(203 213 225)",
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

    waveform.load(music.download_url);

    waveform.on("ready", () => {
      setWaveform(waveform);
      setLength(waveform.getDuration());
      waveform.drawBuffer();
    });

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
      <td className="w-16 pr-4">
        <div className="flex items-center gap-2">
          <Icon icon="akar-icons:clock" className="flex-shrink-0" />
          {moment.utc(length * 1000).format("mm:ss")}
        </div>
      </td>
      <td>
        <a
          href={music.download_url}
          className="border-2 px-6 py-2 border-slate-400 uppercase tracking-[0.2em] text-xs font-medium"
        >
          Download
        </a>
      </td>
    </tr>
  );
}

function Pagination({
  page,
  setPage,
  musics,
}: {
  page: number;
  setPage: (page: number) => void;
  musics: IMusic[];
}) {
  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <button
        onClick={() => {
          if (page > 0) {
            setPage(page - 1);
          }
        }}
        className="flex items-center gap-1.5 mr-12"
      >
        <Icon icon="uil:angle-left" className="flex-shrink-0 w-6 h-6" />
        <span className="text-slate-400">Previous</span>
      </button>
      <div className="flex items-center gap-4">
        {page - 2 > 1 && (
          <>
            <button
              onClick={() => setPage(0)}
              className="w-10 h-10 flex items-center justify-center"
            >
              1
            </button>
            <span>...</span>
          </>
        )}
        {(page - 1) * 12 > 0 && (
          <button
            onClick={() => setPage(page - 2)}
            className="w-10 h-10 flex items-center justify-center"
          >
            {page - 1}
          </button>
        )}
        {page * 12 > 0 && (
          <button
            onClick={() => setPage(page - 1)}
            className="w-10 h-10 flex items-center justify-center"
          >
            {page}
          </button>
        )}
        <button className="w-10 h-10 border-2 border-slate-400 font-semibold flex items-center justify-center">
          {page + 1}
        </button>
        {(page + 1) * 12 <= musics.length && (
          <button
            onClick={() => setPage(page + 1)}
            className="w-10 h-10 flex items-center justify-center"
          >
            {page + 2}
          </button>
        )}
        {(page + 2) * 12 <= musics.length && (
          <button
            onClick={() => setPage(page + 2)}
            className="w-10 h-10 flex items-center justify-center"
          >
            {page + 3}
          </button>
        )}
        {page + 3 < Math.ceil(musics.length / 12) && (
          <>
            <span>...</span>
            <button
              onClick={() => setPage(Math.ceil(musics.length / 12) - 1)}
              className="w-10 h-10 flex items-center justify-center"
            >
              {Math.ceil(musics.length / 12)}
            </button>
          </>
        )}
      </div>
      <button
        onClick={() => {
          if (page * 12 < musics.length) {
            setPage(page + 1);
          }
        }}
        className="flex items-center gap-1.5 ml-12"
      >
        <span className="text-slate-400">Next</span>
        <Icon icon="uil:angle-right" className="flex-shrink-0 w-6 h-6" />
      </button>
    </div>
  );
}

function App() {
  const [musics, setMusics] = useState<IMusic[]>([]);
  const [page, setPage] = useState<number>(0);
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    axios("https://api.github.com/repos/melvinchia3636/Music/contents/", {
      method: "GET",
      headers: {
        Authorization: "token " + import.meta.env.VITE_API_KEY,
      },
    }).then(({ data }: { data: IMusic[] }) => setMusics(data));
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-400 font-['MiSans'] flex p-32 flex-col items-center">
      <p className="text-sm uppercase tracking-[0.2em] mb-2 font-['Jetbrains_Mono']">
        &lt;CODEBLOG/&gt;
      </p>
      <h1 className="text-3xl uppercase tracking-[0.2em]">Music Archive</h1>
      <div className="flex items-center gap-4 py-2 px-4 border-2 border-slate-400 w-full mt-12">
        <Icon icon="akar-icons:search" className="flex-shrink-0 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-2 bg-transparent text-slate-400 placeholder-slate-400 focus:outline-none"
          placeholder="Search for songs and artists"
        />
      </div>
      <table className="w-full items-center my-12">
        <tbody className="divide-y divide-slate-300">
          {!query ? musics.slice(page * 12, page * 12 + 12).map((music, index) => (
            <Music music={music} key={music.sha} index={page * 12 + index} />
          )) : musics.filter((music) => music.name.toLowerCase().includes(query.toLowerCase())).map((music, index) => (
            <Music music={music} key={music.sha} index={index} />
          ))}
        </tbody>
      </table>
      {!query && <Pagination page={page} setPage={setPage} musics={musics} />}
      <Icon icon="akar-icons:play" className="hidden" />
      <Icon icon="akar-icons:pause" className="hidden" />
      <a
        href="https://www.thecodeblog.net"
        target="_blank"
        rel="noreferrer"
        className="mt-16 uppercase tracking-[0.2em] mb-2 font-['Jetbrains_Mono'] hover:text-amber-400"
      >
        &lt;CODEBLOG/&gt;
      </a>
      <p className="mt-2 text-xs">
        Made with 🤍 by{" "}
        <a
          className="underline"
          href="https://github.com/melvinchia3636"
          rel="noreferrer"
        >
          Melvin Chia
        </a>
        . Project under MIT license.
      </p>
    </div>
  );
}

export default App;
