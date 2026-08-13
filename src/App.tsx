import { lazy, Suspense } from "react";
import { SiteRest } from "./SiteRest";

const DescentHero = lazy(() => import("./DescentHero"));

export default function App() {
  return (
    <>
      <header className="float-nav">
        <a href="#top">RH</a>
        <nav>
          <a href="#projects">Work</a>
          <a href="#spearfishing">Spearfishing</a>
          <a href="cv.html">CV</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
      <Suspense fallback={<div className="descent-fallback" aria-hidden="true" />}>
        <DescentHero />
      </Suspense>
      <SiteRest />
    </>
  );
}
