import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Layout } from "@/components/Layout";

// Home is eager-loaded — it is the initial route and must render without a
// network round-trip for the first paint.
import Home from "@/pages/Home";

// Every other route is lazy-loaded so Vite emits a separate chunk for each
// page.  The critical benefit: mermaid (a ~660 kB raw dependency) is imported
// only by MermaidHostDemo, so lazy-loading that route removes mermaid from the
// initial bundle entirely.  All other routes benefit from smaller initial JS.
const Playground              = lazy(() => import("@/pages/Playground"));
const Architecture            = lazy(() => import("@/pages/Architecture"));
const DslReference            = lazy(() => import("@/pages/DslReference"));
const Roadmap                 = lazy(() => import("@/pages/Roadmap"));
const About                   = lazy(() => import("@/pages/About"));
const AgentSkills             = lazy(() => import("@/pages/AgentSkills"));
const SkillDetail             = lazy(() => import("@/pages/SkillDetail"));
const SkillsWalkthrough       = lazy(() => import("@/pages/SkillsWalkthrough"));
const PurchaseApprovalExample    = lazy(() => import("@/pages/PurchaseApprovalExample"));
const EmployeeOffboardingExample = lazy(() => import("@/pages/EmployeeOffboardingExample"));
const PluginInstallation      = lazy(() => import("@/pages/PluginInstallation"));
const MermaidHostDemo         = lazy(() => import("@/pages/MermaidHostDemo"));
const SyntaxComparison        = lazy(() => import("@/pages/SyntaxComparison"));
const ReleasePage             = lazy(() => import("@/pages/ReleasePage"));
const NotFound                = lazy(() => import("@/pages/not-found"));

/** Minimal fallback shown while a lazy route chunk is downloading. */
function PageLoading() {
  return (
    <div
      className="flex flex-1 items-center justify-center min-h-[200px]"
      aria-label="Loading page"
    >
      <div
        className="h-5 w-5 rounded-full border-2 border-muted border-t-foreground animate-spin"
        aria-hidden="true"
      />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoading />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/playground" component={Playground} />
          <Route path="/architecture" component={Architecture} />
          <Route path="/dsl" component={DslReference} />
          <Route path="/roadmap" component={Roadmap} />
          <Route path="/about" component={About} />
          <Route path="/plugin" component={PluginInstallation} />
          <Route path="/mermaid-host-demo" component={MermaidHostDemo} />
          <Route path="/comparison" component={SyntaxComparison} />
          <Route path="/release" component={ReleasePage} />
          <Route path="/walkthrough/purchase-approval" component={PurchaseApprovalExample} />
          <Route path="/walkthrough/employee-offboarding" component={EmployeeOffboardingExample} />
          <Route path="/walkthrough" component={SkillsWalkthrough} />
          <Route path="/skills/:skillId" component={SkillDetail} />
          <Route path="/skills" component={AgentSkills} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
