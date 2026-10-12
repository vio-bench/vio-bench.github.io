"use client";

import { useState } from "react";
import figures from "@/data/homepage-result-figures.json";

export function HomeResultsOverview() {
  const [selected, setSelected] = useState(figures[0].id);
  const figure = figures.find(item => item.id === selected)!;

  return (
    <div className="home-results-overview">
      <div className="home-result-tabs" role="group" aria-label="Result previews">
        {figures.map(item => (
          <button type="button" key={item.id} aria-pressed={selected === item.id}
            onClick={() => setSelected(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <figure className="home-result-preview">
        <div className="home-result-plot" tabIndex={0} role="region" aria-label={figure.label}>
          <img src={figure.image} alt={figure.alt} width={figure.width} height={figure.height}
            loading="lazy" decoding="async" />
        </div>
        <figcaption>{figure.caption} Full values and evaluation rules are in Results.</figcaption>
      </figure>
    </div>
  );
}
