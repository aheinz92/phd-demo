import { Switch, Route, Router as WouterRouter } from "wouter"; // Renamed Router to WouterRouter to avoid conflict
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MusicalExplorer } from "@/components/MusicalExplorer";
import NotFound from "@/pages/not-found";
import PhdProposalPage from './pages/PhdProposalPage';
import MusicalExplorerPage from "./pages/MusicalExplorerPage";
import HomePage from "./pages/HomePage"; // Added import

function AppRouter() { // Renamed function to avoid conflict with WouterRouter
  // Ensure BASE_URL for wouter does not have a trailing slash if it's not just "/"
  const base = import.meta.env.BASE_URL;
  const wouterBase = base !== '/' ? base.replace(/\/$/, '') : base;
  return (
    <WouterRouter base={wouterBase}>
      <Switch>
        <Route path="/" component={HomePage} /> {/* Changed component to HomePage */}
        <Route path="/phd-proposal" component={PhdProposalPage} />
        <Route path="/explorer" component={MusicalExplorerPage} />
        <Route component={NotFound} /> {/* This will now correctly catch unmatched routes within the base */}
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter /> {/* Use the renamed router component */}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
