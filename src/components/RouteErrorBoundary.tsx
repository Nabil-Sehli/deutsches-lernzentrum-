import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

function RouteErrorFallback({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center p-6">
      <Card className="clay-card border-0 shadow-xl max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-red-100 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2c3e2d] mb-1">
              Page Error
            </h2>
            <p className="text-sm text-[#78909c]">
              This page encountered an error and couldn't load.
            </p>
          </div>
          <Button
            onClick={onReset}
            className="rounded-full bg-[#00695c] hover:bg-[#004d40]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[RouteErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <RouteErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}
