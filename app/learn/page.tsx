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
        <p className="tutorial-status">Chapter 1 introduces VIO state and coordinate frames. Further sections are in preparation.</p>
        <TutorialContents />
      </div>
    </div>
  );
}
