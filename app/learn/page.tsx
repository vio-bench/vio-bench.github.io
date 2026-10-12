import { PageIntro } from "@/components/ui";
import { TutorialContents } from "@/components/tutorial-contents";

export const metadata = { title: "VIO tutorials" };

export default function Learn() {
  return (
    <div className="tutorial-index">
      <PageIntro
        eyebrow="TUTORIALS"
        title="Visual–inertial odometry tutorials"
        description="Notation, sensor models, calibration, estimation, and evaluation."
      />
      <div className="container page-content">
        <p className="tutorial-status">Chapter text is in preparation.</p>
        <TutorialContents />
      </div>
    </div>
  );
}
