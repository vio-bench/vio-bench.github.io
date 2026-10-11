import Link from "next/link";
import { PageIntro } from "@/components/ui";

export default function Home() {
  return (
    <PageIntro
      title="VIO benchmark results"
      description="Results across five datasets, with computational profiling on three platforms."
    >
      <div className="button-row">
        <Link className="button" href="/results/">Result tables →</Link>
      </div>
    </PageIntro>
  );
}
