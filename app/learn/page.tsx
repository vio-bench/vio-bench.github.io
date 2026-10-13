import { PageIntro } from "@/components/ui";
import { TutorialContents } from "@/components/tutorial-contents";

export const metadata = { title: "VIO tutorials" };

export default function Learn() {
  return (
    <div className="tutorial-index">
      <PageIntro
        eyebrow="TUTORIALS"
        title="Visual–inertial odometry tutorials"
        description="Notation, sensor models, calibration, and initialization."
      />
      <div className="container page-content">
        <p className="tutorial-status">Chapters 1–4 are available. Chapters 5–8: To be added.</p>
        <TutorialContents />
      </div>
    </div>
  );
}
