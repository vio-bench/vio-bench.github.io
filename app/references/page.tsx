import Link from "next/link";
import { PageIntro } from "@/components/ui";
export const metadata = { title: "Tutorial references" };
export default function References() {
  return <>
    <PageIntro title="Tutorial references" description="References are in preparation." />
    <div className="container page-content"><Link href="/learn/">← Tutorial contents</Link></div>
  </>;
}
