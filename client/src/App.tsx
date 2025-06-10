import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MusicalExplorer } from "@/components/MusicalExplorer";
import NotFound from "@/pages/not-found";
import PhdProposalPage from './pages/PhdProposalPage';
import MusicalExplorerPage from "./pages/MusicalExplorerPage";
import HomePage from "./pages/HomePage"; // Added import

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} /> {/* Changed component to HomePage */}
      <Route path="/phd-proposal" component={PhdProposalPage} />
      <Route path="/explorer" component={MusicalExplorerPage} />
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
