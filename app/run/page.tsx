import Link from "next/link";
import { PageIntro } from "@/components/ui";
export const metadata = { title: "Implementation guides" };
export default function Run() {
  return <>
    <PageIntro title="Implementation guides" description="Guide content is in preparation." />
    <div className="container page-content"><Link href="/systems/">System documentation →</Link></div>
  </>;
}
