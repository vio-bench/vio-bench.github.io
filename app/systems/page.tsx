import { PageIntro, Callout } from "@/components/ui";
import { SystemCatalog } from "@/components/system-catalog";
import catalog from "@/data/systems.json";
export const metadata = { title: "VIO system implementations" };
export default function Systems() {
  return (
    <>
      <PageIntro
        eyebrow="SYSTEMS / IMPLEMENTATIONS"
        title="VIO system implementations"
        description="Profiles of 11 public implementations, including estimator formulations, documented sensor inputs, source code, and technical references."
      />
      <div className="container page-content">
        <SystemCatalog />
        <Callout title="Configuration scope">
          <p>
            {catalog.catalogNote} A mono search can also include visual-only or
            relocalization modes; the profile states which is which. Sources
            checked {catalog.sourceChecked}.
          </p>
        </Callout>
      </div>
    </>
  );
}
