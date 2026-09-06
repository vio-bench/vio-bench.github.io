import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://vio-bench.github.io"),
  title: {
    default: "VIOVERSE — Learn, run, and understand VIO",
    template: "%s · VIOVERSE",
  },
  description:
    "An open learning home for visual–inertial odometry. Build foundations, explore systems, run an estimator, and understand the evidence.",
  openGraph: {
    title: "VIOVERSE",
    description: "Learn, run, and understand visual–inertial odometry.",
    images: ["/brand/vioverse-logo.jpg"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="header">
          <div className="container header-inner">
            <Link href="/" className="brand" aria-label="VIOVERSE home">
              <img
                src="/brand/vioverse-logo.jpg"
                alt="VIOVERSE"
                width="218"
                height="123"
              />
            </Link>
            <Navigation />
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="footer">
          <div className="container footer-grid">
            <div>
              <strong className="wordmark">
                VIOVERSE<span> / </span>
              </strong>
              <p>Tutorials and resources for visual–inertial odometry.</p>
              <p className="small">
                Learn the foundations. Inspect the assumptions. Run the code.
              </p>
            </div>
            <div className="footer-links">
              <Link href="/learn/">Learning path</Link>
              <Link href="/results/">Results and leaderboards</Link>
              <Link href="/benchmark/protocol/">Evaluation definitions</Link>
              <a href="https://github.com/vio-bench/vio-bench.github.io">
                Website source ↗
              </a>
              <a href="https://github.com/vio-bench/vio-bench.github.io/issues">
                Suggest an improvement ↗
              </a>
            </div>
          </div>
          <div className="container footer-bottom">
            <span>VIOVERSE · An open visual–inertial odometry resource</span>
            <span>Built for learners, engineers, and researchers.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
