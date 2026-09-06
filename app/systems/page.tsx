import { PageIntro, Callout } from "@/components/ui";
import { SystemCatalog } from "@/components/system-catalog";
import catalog from "@/data/systems.json";
export const metadata = { title: "Explore VIO systems" };
export default function Systems() {
  return (
    <>
      <PageIntro
        eyebrow="SYSTEMS / THE OPEN ECOSYSTEM"
        title="Understand the ideas. Find the code."
        description="Explore 11 public implementations through their estimator design, documented inputs, and useful learning entry points."
      />
      <div className="container page-content">
        <SystemCatalog />
        <Callout title="Read each configuration in context">
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
