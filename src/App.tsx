import { lazy, Suspense } from "react";
import { SiteRest } from "./SiteRest";

const DescentHero = lazy(() => import("./DescentHero"));

export default function App() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Runtian Huang home">
          RH
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#credentials">Credentials</a>
          <a href="cv.html">Online CV</a>
          <a href="#spearfishing">Spearfishing</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-actions" />
      </header>
      <Suspense fallback={<div className="descent-fallback" aria-hidden="true" />}>
        <DescentHero />
      </Suspense>
      <SiteRest />
    </>
  );
}
