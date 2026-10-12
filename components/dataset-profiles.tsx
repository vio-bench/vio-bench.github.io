import Link from "next/link";
import scope from "@/data/benchmark-datasets.json";
import media from "@/data/benchmark-media.json";
import hardware from "@/data/benchmark-hardware.json";
import results from "@/public/data/current-results.json";

type ProfileImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  sourcePage: string;
  credit: string;
  crop?: number[] | null;
  objectPosition?: string;
  license?: string;
};

function ProfilePicture({ image, kind, caption }: { image: ProfileImage; kind: string; caption: string }) {
  return <figure className="dataset-profile-picture">
    <a className={`dataset-profile-photo${kind === "Environment" ? " is-scene" : ""}`} href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`View ${caption} image`}>
      {image.crop ? <svg viewBox={image.crop.join(" ")} preserveAspectRatio="xMidYMid slice" role="img" aria-label={image.alt}>
        <image href={image.src} width={image.width} height={image.height} />
      </svg> : <img src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" style={{ objectPosition: image.objectPosition }} />}
    </a>
    <figcaption>
      <div><strong>{kind}</strong><span>{caption}</span></div>
      <a href={image.sourcePage} target="_blank" rel="noopener noreferrer" title={`Image: ${image.credit}${image.crop ? "; detail" : ""}${image.license ? ` · ${image.license}` : ""}`} aria-label={`${caption} image source`}>Source ↗</a>
    </figcaption>
  </figure>;
}

/** Paper Table I(b) input scope, grouped with official environment and hardware images. */
export function DatasetProfiles() {
  return <div className="dataset-profiles">
    {scope.map(item => {
      const dataset = results.datasets.find(d => d.id === item.id)!;
      const scene = media.find(d => d.datasetId === item.id)!;
      const rig = hardware.find(d => d.datasetId === item.id)!;
      return <article className="dataset-profile" key={item.id} aria-labelledby={`dataset-${item.id}`}>
        <div className="dataset-profile-info">
          <header className="dataset-profile-heading">
            <h3 id={`dataset-${item.id}`}><Link href={`/results/tables/?dataset=${item.id}`}>{dataset.label}</Link></h3>
            <span className="dataset-profile-domain">{item.domain}</span>
            <span className="dataset-profile-range">{dataset.sequenceCount} sequences · {item.hours} h · {item.stereo ? "Mono / Stereo" : "Mono"}</span>
          </header>
          <dl className="dataset-profile-specs">
            <div><dt>Cameras</dt><dd>{rig.camera}</dd></div>
            <div><dt>IMU</dt><dd>{rig.imu}</dd></div>
            <div><dt>Cam. / IMU</dt><dd>{item.cameraRateHz} / {item.imuRateHz} Hz</dd></div>
            <div><dt>Reference</dt><dd>{item.reference}</dd></div>
          </dl>
          <details className="dataset-profile-details">
            <summary>Details</summary>
            <p>{item.description}</p>
            {(rig.note || item.note) && <p>{[rig.note, item.note].filter(Boolean).join(" ")}</p>}
          </details>
        </div>
        <div className={`dataset-profile-images${rig.sensorImage ? "" : " has-two-images"}`}>
          <ProfilePicture image={{ ...scene, src: scene.image }} kind="Environment" caption={item.scene} />
          <ProfilePicture image={rig.platformImage} kind="Platform" caption={rig.platform} />
          {rig.sensorImage && <ProfilePicture image={rig.sensorImage} kind="Sensors" caption={rig.sensorCaption} />}
        </div>
      </article>;
    })}
  </div>;
}
