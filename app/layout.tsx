import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import "./globals.css";
import "./academic.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://vio-bench.github.io"),
  title: {
    default: "VIOVERSE | Visual–Inertial Odometry",
    template: "%s · VIOVERSE",
  },
  description:
    "Tutorials, system implementations, trajectory evaluation, and benchmark results for visual–inertial odometry.",
  openGraph: {
    title: "VIOVERSE",
    description: "Visual–inertial odometry: methods, tutorials, and benchmark evaluation.",
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
              <strong className="wordmark">VIOVERSE</strong>
              <p>Visual–inertial odometry: tutorials, evaluation, and results.</p>
            </div>
            <div className="footer-links">
              <Link href="/learn/">Tutorials</Link>
              <Link href="/results/">Results and leaderboards</Link>
              <Link href="/evaluation/">Evaluation with EPICA</Link>
              <a href="https://github.com/vio-bench/vio-bench.github.io">
                Website source ↗
              </a>
              <a href="https://github.com/vio-bench/vio-bench.github.io/issues">
                Technical corrections ↗
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
