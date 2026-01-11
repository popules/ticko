/**
 * Performance Tracker for Social Alpha Engine
 */

export interface SwipePerformance {
    symbol: string;
    timestamp: number;
    entryPrice: number;
    currentPrice: number;
    roi: number;
}

export function calculateROI(entry: number, current: number): number {
    if (entry === 0) return 0;
    return ((current - entry) / entry) * 100;
}

export function getRankLabel(roi: number): string {
    if (roi > 20) return "Alpha Scout";
    if (roi > 10) return "Market Beater";
    if (roi > 0) return "Bullish";
    if (roi > -5) return "Holding On";
    return "Learning";
}
