"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class StockErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("StockPage Crash caught by ErrorBoundary:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-rose-500/5 rounded-[2.5rem] border border-rose-500/20 m-6">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Oops! Something went wrong.</h2>
                        <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
                            A technical error occurred while loading the page. This may be due to temporary issues with the data source.
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-rose-500/20"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try again
                        </button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
