import hardware from "@/data/benchmark-hardware.json";
import results from "@/public/data/current-results.json";

type HardwareImage = { src: string; width: number; height: number; alt: string; sourcePage: string; credit: string };

function HardwarePicture({ image, caption }: { image: HardwareImage; caption: string }) {
  return <figure className="hardware-picture">
    <a className="hardware-photo" href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`View ${caption} image`}>
      <img src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" />
    </a>
    <figcaption><span>{caption}</span><a href={image.sourcePage} target="_blank" rel="noopener noreferrer" title={`Image: ${image.credit}`} aria-label={`${caption} image source`}>Source ↗</a></figcaption>
  </figure>;
}

export function DatasetHardwareGallery() {
  return <div className="dataset-hardware-gallery">
    {hardware.map(item => <article className="dataset-hardware-card" key={item.datasetId} aria-labelledby={`hardware-${item.datasetId}`}>
      <h4 id={`hardware-${item.datasetId}`}>{results.datasets.find(d => d.id === item.datasetId)!.label}</h4>
      <HardwarePicture image={item.platformImage} caption={item.platform} />
      {item.sensorImage && <HardwarePicture image={item.sensorImage} caption={item.sensorCaption} />}
      <dl className="hardware-specs">
        <div><dt>Cameras</dt><dd>{item.camera}</dd></div>
        <div><dt>IMU</dt><dd>{item.imu}</dd></div>
      </dl>
      {item.note && <p className="hardware-note">{item.note}</p>}
    </article>)}
  </div>;
}
