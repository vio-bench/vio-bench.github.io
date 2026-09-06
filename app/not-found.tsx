import { ButtonLink } from "@/components/ui";
export default function NotFound() {
  return (
    <div className="not-found">
      <span className="eyebrow">404 / OFF THE PATH</span>
      <h1>Let’s get you back on track.</h1>
      <p>This page is not part of the current VIOVERSE site.</p>
      <ButtonLink href="/">Return to VIOVERSE</ButtonLink>
    </div>
  );
}
