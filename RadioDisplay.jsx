import React, { useEffect, useState } from "react";
import {
  Radio,
  Bluetooth,
  Disc3,
  Music2,
  Signal,
  Zap,
} from "lucide-react";

const formatTime = (seconds = 0) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remaining
  ).padStart(2, "0")}`;
};

export default function RadioDisplay({
  title = "RADIO MUSICÓLOGOS",
  subtitle = "VIRTUAL RECEIVER",
  isPlaying = false,
  isStreaming = false,
  currentTime = 0,
  duration = 0,
  volume = 80,
  rgbEnabled = true,
  rgbColor = "#a855f7",
  streamingMode = false,
  bassLevel = 0,
  onPlayPause,
  onPrevious,
  onNext,
}) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setClock(
        new Date().toLocaleTimeString("es-DO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateClock();

    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const progress =
    duration > 0
      ? Math.min(100, (currentTime / duration) * 100)
      : 0;

  const bars = Array.from({ length: 36 }, (_, index) => {
    const wave = Math.abs(
      Math.sin(index * 0.57 + currentTime * 2.5)
    );

    const height = isPlaying
      ? 8 + wave * (12 + bassLevel * 35)
      : 5 + (index % 3) * 2;

    return {
      id: index,
      height: Math.min(48, height),
    };
  });

  return (
    <section
      className={`radio-display ${
        rgbEnabled ? "rgb-enabled" : ""
      } ${isPlaying ? "is-playing" : ""}`}
      style={{
        "--radio-rgb": rgbColor,
      }}
    >
      <div className="radio-display__top">
        <div className="radio-brand">
          <div className="radio-brand__icon">
            <Radio size={22} />
          </div>

          <div>
            <span className="radio-brand__name">
              RADIO MUSICÓLOGOS
            </span>
            <span className="radio-brand__caption">
              DIGITAL SOUND SYSTEM
            </span>
          </div>
        </div>

        <div className="radio-status">
          <span
            className={`status-dot ${
              isPlaying ? "status-dot--active" : ""
            }`}
          />
          <span>
            {isPlaying ? "PLAY" : "STANDBY"}
          </span>
        </div>
      </div>

      <div className="radio-display__screen">
        <div className="screen-header">
          <span>
            {isStreaming ? (
              <>
                <Signal size={12} />
                ONLINE STREAM
              </>
            ) : (
              <>
                <Disc3 size={12} />
                LOCAL AUDIO
              </>
            )}
          </span>

          <span className="screen-clock">{clock}</span>
        </div>

        <div className="screen-main">
          <div className="screen-track">
            <span className="screen-track__label">
              NOW {isPlaying ? "PLAYING" : "READY"}
            </span>

            <h2 title={title}>
              {title || "RADIO MUSICÓLOGOS"}
            </h2>

            <p>{subtitle}</p>
          </div>

          <div className="screen-disc">
            <div className="screen-disc__outer">
              <div className="screen-disc__inner">
                <Music2 size={25} />
              </div>
            </div>
          </div>
        </div>

        <div className="screen-visualizer" aria-hidden="true">
          {bars.map((bar) => (
            <span
              key={bar.id}
              className="visualizer-bar"
              style={{
                height: `${bar.height}px`,
                animationDelay: `${bar.id * 0.025}s`,
              }}
            />
          ))}
        </div>

        <div className="screen-progress">
          <span>{formatTime(currentTime)}</span>

          <div className="progress-track">
            <div
              className="progress-track__fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span>
            {streamingMode
              ? "--:--"
              : formatTime(duration)}
          </span>
        </div>

        <div className="screen-footer">
          <span>
            <Bluetooth size={13} />
            DIGITAL AUDIO
          </span>

          <span>
            <Zap size={13} />
            {streamingMode ? "STREAM MODE" : "7-BAND EQ"}
          </span>

          <span>
            VOL {streamingMode ? "--" : volume}
          </span>
        </div>
      </div>

      <div className="radio-controls">
        <button
          type="button"
          className="radio-control"
          onClick={onPrevious}
          aria-label="Pista anterior"
          title="Pista anterior"
        >
          <span className="control-symbol">|◀</span>
          <small>BACK</small>
        </button>

        <button
          type="button"
          className="radio-control radio-control--play"
          onClick={onPlayPause}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
          title={isPlaying ? "Pausar" : "Reproducir"}
        >
          <span className="control-symbol">
            {isPlaying ? "Ⅱ" : "▶"}
          </span>
          <small>{isPlaying ? "PAUSE" : "PLAY"}</small>
        </button>

        <button
          type="button"
          className="radio-control"
          onClick={onNext}
          aria-label="Pista siguiente"
          title="Pista siguiente"
        >
          <span className="control-symbol">▶|</span>
          <small>NEXT</small>
        </button>
      </div>

      <div className="radio-display__bottom">
        <span>RM AUDIO ENGINE</span>
        <span>{rgbEnabled ? "RGB ACTIVE" : "RGB OFF"}</span>
      </div>
    </section>
  );
}