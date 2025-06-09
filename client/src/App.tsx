import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MusicalExplorer } from "@/components/MusicalExplorer";
import NotFound from "@/pages/not-found";
import PhdProposalPage from './pages/PhdProposalPage';

function Router() {
  return (
    <Switch>
      <Route path="/" component={MusicalExplorer} />
      <Route path="/phd-proposal" component={PhdProposalPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
