"use client";

import { useEffect, useState } from "react";
import previews from "@/data/dataset-input-previews.json";

export function DatasetInputPreviews() {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => setPlaying(!preference.matches);
    applyPreference();
    preference.addEventListener("change", applyPreference);
    return () => preference.removeEventListener("change", applyPreference);
  }, []);

  return (
    <div className="home-input-previews">
      <div className="home-preview-heading">
        <p>Dataset input previews</p>
        <button type="button" onClick={() => setPlaying(value => !value)} aria-pressed={!playing}>
          {playing ? "Pause previews" : "Play previews"}
        </button>
      </div>
      <div className="home-preview-grid">
        {previews.map(preview => (
          <figure key={preview.datasetId} title={`${preview.credit}; ${preview.sourcePage}`}>
            <div className="home-preview-frame">
              <picture>
                <source srcSet={playing ? preview.webp : preview.poster} type={playing ? "image/webp" : "image/jpeg"} />
                <img src={playing ? preview.gif : preview.poster} alt={preview.alt}
                  width={preview.width} height={preview.height} loading="lazy" decoding="async" />
              </picture>
            </div>
            <figcaption>
              <strong>{preview.label}</strong>
              <span>{preview.domain}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
