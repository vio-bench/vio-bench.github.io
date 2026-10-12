import Link from "next/link";
import media from "@/data/benchmark-media.json";
import hardware from "@/data/benchmark-hardware.json";
import results from "@/public/data/current-results.json";

/** Official dataset examples; display crops preserve the original image files. */
export function DatasetGallery({ showCounts = false, preview = false }: { showCounts?: boolean; preview?: boolean }) {
  return (
    <div className="dataset-gallery">
      {media.map(item => {
        const dataset = results.datasets.find(d => d.id === item.datasetId)!;
        const previewDevice = preview && item.datasetId === "lamaria"
          ? hardware.find(device => device.datasetId === item.datasetId)?.platformImage
          : undefined;
        const credit = previewDevice
          ? `Image: ${previewDevice.credit}; source: ${previewDevice.sourcePage}`
          : `Image: ${item.credit}${item.crop ? "; detail" : ""}${item.license ? ` · ${item.license}` : ""}; source: ${item.sourcePage}`;
        const visual = previewDevice ? (
          <img className="dataset-preview-device" src={previewDevice.src} alt={previewDevice.alt} width={previewDevice.width} height={previewDevice.height} loading="lazy" decoding="async" />
        ) : item.crop ? (
          <svg viewBox={item.crop.join(" ")} preserveAspectRatio="xMidYMid slice" role="img" aria-label={item.alt}>
            <image href={item.image} width={item.width} height={item.height} />
          </svg>
        ) : (
          <img src={item.image} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" style={{ objectPosition: item.objectPosition }} />
        );
        if (preview) return (
          <figure className="dataset-scene dataset-preview" key={item.datasetId} title={credit}>
            <div className="dataset-photo">{visual}</div>
            <figcaption><span className="dataset-name">{dataset.label}</span></figcaption>
          </figure>
        );
        return (
          <figure className="dataset-scene" key={item.datasetId}>
            <Link className="dataset-photo" href={`/results/tables/?dataset=${item.datasetId}`} aria-label={`${dataset.label} results`}>
              {visual}
            </Link>
            <figcaption>
              <Link className="dataset-name" href={`/results/tables/?dataset=${item.datasetId}`}>{dataset.label}</Link>
              <span className="dataset-domain">{item.domain}</span>
              <div className="dataset-scene-meta">
                {showCounts && <span>{dataset.sequenceCount} sequences</span>}
                <a href={item.sourcePage} target="_blank" rel="noopener noreferrer" title={`Image: ${item.credit}${item.crop ? "; detail" : ""}${item.license ? ` · ${item.license}` : ""}`} aria-label={`${dataset.label} official image source`}>Source ↗</a>
              </div>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
