import React from "react";
import { X, Palette, Radio, Eye, RotateCcw } from "lucide-react";

const COLORS = [
  { name: "Morado", value: "#a855f7" },
  { name: "Azul", value: "#38bdf8" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Verde", value: "#22c55e" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Naranja", value: "#f97316" },
];

export default function SettingsModal({
  open,
  onClose,
  settings,
  onChange,
  onReset,
}) {
  if (!open) return null;

  return (
    <div
      className="settings-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header className="settings-modal__header">
          <div>
            <span className="eyebrow">RM CONTROL CENTER</span>
            <h2 id="settings-title">Configuración</h2>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Cerrar configuración"
          >
            <X size={20} />
          </button>
        </header>

        <div className="settings-section">
          <h3>
            <Palette size={17} /> Iluminación RGB
          </h3>

          <label className="setting-switch">
            <span>
              <strong>Efectos RGB</strong>
              <small>Iluminación dinámica de la interfaz</small>
            </span>
            <input
              type="checkbox"
              checked={settings.rgbEnabled}
              onChange={(event) =>
                onChange("rgbEnabled", event.target.checked)
              }
            />
          </label>

          <p className="setting-label">Color principal</p>

          <div className="color-options">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`color-swatch ${
                  settings.rgbColor === color.value
                    ? "color-swatch--selected"
                    : ""
                }`}
                style={{ "--swatch": color.value }}
                onClick={() => onChange("rgbColor", color.value)}
                aria-label={color.name}
                aria-pressed={settings.rgbColor === color.value}
                title={color.name}
              />
            ))}
          </div>

          <label className="setting-switch">
            <span>
              <strong>Animación ambiental</strong>
              <small>Movimiento sutil de las luces</small>
            </span>
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(event) =>
                onChange("animationsEnabled", event.target.checked)
              }
            />
          </label>
        </div>

        <div className="settings-section">
          <h3>
            <Radio size={17} /> Reproducción
          </h3>

          <label className="setting-switch">
            <span>
              <strong>Modo streaming</strong>
              <small>Oculta cifras del ecualizador y duración total</small>
            </span>
            <input
              type="checkbox"
              checked={settings.streamingMode}
              onChange={(event) =>
                onChange("streamingMode", event.target.checked)
              }
            />
          </label>

          <label className="setting-switch">
            <span>
              <strong>Recordar configuración</strong>
              <small>Guarda las preferencias en este navegador</small>
            </span>
            <input
              type="checkbox"
              checked={settings.rememberSettings}
              onChange={(event) =>
                onChange("rememberSettings", event.target.checked)
              }
            />
          </label>
        </div>

        <div className="settings-section">
          <h3>
            <Eye size={17} /> Interfaz
          </h3>

          <label className="setting-switch">
            <span>
              <strong>Mostrar comunidad</strong>
              <small>Enlaces sociales y de la comunidad</small>
            </span>
            <input
              type="checkbox"
              checked={settings.showCommunity}
              onChange={(event) =>
                onChange("showCommunity", event.target.checked)
              }
            />
          </label>
        </div>

        <footer className="settings-modal__footer">
          <button className="secondary-button" onClick={onReset}>
            <RotateCcw size={15} /> Restaurar
          </button>

          <button className="primary-button" onClick={onClose}>
            Listo
          </button>
        </footer>
      </section>
    </div>
  );
}