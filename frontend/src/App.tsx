
import { Toaster } from "./components/ui/sonner";
import AuthBootstrap from "./features/auth/components/AuthBootstrap";
import Routes from "./routes";

function App() {
  return (
    <AuthBootstrap>
      <Routes />
      <Toaster richColors position="top-center" />
    </AuthBootstrap>
  );
}

export default App;
