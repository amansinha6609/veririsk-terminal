import { useState, useCallback } from 'react';
import { ForensicReport, ModuleState, Metrics, ChartData } from '../types';

export const useAudit = () => {
  const [modules, setModules] = useState<Map<string, ModuleState>>(new Map());
  const [overallRisk, setOverallRisk] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [keyFindings, setKeyFindings] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateAudit = useCallback(async (companyName: string): Promise<ForensicReport | null> => {
    setIsStreaming(true);
    setError(null);
    setModules(new Map());
    setOverallRisk(null);
    setMetrics(null);
    setChartData(null);
    setKeyFindings([]);
    setVerdict(null);

    let finalReport: ForensicReport | null = null;
    let currentModules = new Map<string, ModuleState>();

    try {
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName }),
      });

      if (!response.body) throw new Error('No readable stream available.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.replace(/^data:\s*/, '').trim();
          if (!cleanLine) continue;

          if (cleanLine === '[DONE]') {
            setIsStreaming(false);
            break;
          }

          try {
            const data = JSON.parse(cleanLine);

            switch (data.type) {
              case 'module_start':
                currentModules.set(data.module, {
                  id: data.module,
                  label: data.label,
                  text: '',
                  status: 'streaming',
                });
                setModules(new Map(currentModules));
                break;

              case 'chunk':
                if (currentModules.has(data.module)) {
                  const mod = currentModules.get(data.module)!;
                  mod.text += data.text;
                  currentModules.set(data.module, { ...mod });
                  setModules(new Map(currentModules));
                }
                break;

              case 'module_complete':
                if (currentModules.has(data.module)) {
                  const mod = currentModules.get(data.module)!;
                  mod.status = 'complete';
                  mod.score = data.score;
                  currentModules.set(data.module, { ...mod });
                  setModules(new Map(currentModules));
                }
                break;

              case 'report_complete':
                setOverallRisk(data.overall_risk);
                setMetrics(data.metrics);
                setChartData(data.chartData);
                setKeyFindings(data.key_findings || []);
                setVerdict(data.verdict);

                finalReport = {
                  company_name: companyName,
                  overall_risk: data.overall_risk,
                  metrics: data.metrics,
                  chartData: data.chartData,
                  key_findings: data.key_findings,
                  verdict: data.verdict
                };
                break;

              case 'error':
                throw new Error(data.text);
            }
          } catch (e) {
            console.error('Failed to parse SSE line:', cleanLine, e);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during the audit.');
      setIsStreaming(false);
    }

    return finalReport;
  }, []);

  return {
    modules,
    overallRisk,
    metrics,
    chartData,
    keyFindings,
    verdict,
    isStreaming,
    error,
    initiateAudit,
  };
};
