import { Switch, Route, Router as WouterRouter } from "wouter";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Playground from "@/pages/Playground";
import Architecture from "@/pages/Architecture";
import DslReference from "@/pages/DslReference";
import Roadmap from "@/pages/Roadmap";
import About from "@/pages/About";
import AgentSkills from "@/pages/AgentSkills";
import SkillDetail from "@/pages/SkillDetail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/playground" component={Playground} />
        <Route path="/architecture" component={Architecture} />
        <Route path="/dsl" component={DslReference} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/about" component={About} />
        <Route path="/skills/:skillId" component={SkillDetail} />
        <Route path="/skills" component={AgentSkills} />
        <Route component={NotFound} />
      </Switch>
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
