export interface Metrics {
  debt_to_equity: number;
  current_ratio: number;
  altman_z_score: number;
  interest_coverage: number;
}

export interface SolvencyDataPoint {
  quarter: string;
  debt: number;
  cash: number;
}

export interface VelocityDataPoint {
  time: string;
  risk: number;
  anchor?: string;
}

export interface ChartData {
  solvency: SolvencyDataPoint[];
  velocity: VelocityDataPoint[];
}

export interface ForensicReport {
  company_name: string;
  overall_risk: number;
  summary?: string;
  metrics?: Metrics;
  chartData?: ChartData;
  key_findings?: string[];
  verdict?: string;
}

export interface ModuleState {
  id: string;
  label: string;
  text: string;
  score?: number;
  status: 'pending' | 'streaming' | 'complete' | 'error';
}

export interface StoredReport {
  report_id: string;
  company_name: string;
  overall_risk: number;
  timestamp: string;
  verdict: string;
}
