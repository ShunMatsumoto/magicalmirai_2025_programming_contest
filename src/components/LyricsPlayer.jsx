import { useEffect, useState, useRef } from "react";
import { Player } from "textalive-app-api";

/**
 * TextAlive + React ― 最小構成
 * - Chrome の Autoplay 制限を回避するため、ユーザ操作で再生開始
 * - 歌詞は `player.video.findWord(pos)` で 1 語ずつ取得
 */
export default function LyricsPlayer() {
  const [word, setWord] = useState("Tap ▶︎ to play");
  const [ready, setReady] = useState(false);   // 曲ロード完了判定
  const playerRef = useRef(null);              // Player インスタンス共有

  // 初期化
  useEffect(() => {
    const player = new Player({
      app: { token: import.meta.env.VITE_TEXTALIVE_TOKEN },
      mediaElement: document.querySelector("#media"),
      mediaBannerPosition: "top",
    });
    playerRef.current = player;

    /** SDK イベント登録 */
    player.addListener({
      onAppReady: (app) => {
        // トークンが無効でも試聴は可能 / 失敗時はコンソールにエラー
        if (app.dataUrl) {
            return;
        }

        player.createFromSongUrl("https://piapro.jp/t/CyPO/20250128183915");
      },
      onVideoReady: () => {
        setReady(true);            // UI 側の再生ボタンを有効化
      },
      onTimeUpdate: (pos) => {
        const w = player.video.findWord(pos);
        if (w && w.text) {
            setWord(w.text);
        }
      },
    });

    return () => player.dispose(); // アンマウント時に後始末
  }, []);

  /** 再生 / 一時停止トグル */
  const toggle = () => {
    const player = playerRef.current;
    if (!player || !ready) {
        return;
    }
    
    player.isPlaying ? player.requestPause() : player.requestPlay(); // user gesture 必須
  };

  return (
    <section className="flex flex-col items-center justify-center h-screen gap-8">
      <h1 className="text-3xl font-bold text-center">MagicalMirai 2025 Lyrics Demo</h1>

      <button
        onClick={toggle}
        disabled={!ready}
        className="px-6 py-3 rounded-xl border text-lg font-semibold hover:scale-105 transition"
      >
        {ready ? (playerRef.current?.isPlaying ? "Pause ⏸" : "Play ▶︎") : "Loading…"}
      </button>

      <p className="text-4xl tracking-wider font-semibold select-none">{word}</p>
      {/* TextAlive がここに MP3 を流し込む */}
      <audio id="media" crossOrigin="anonymous" />
    </section>
  );
}
