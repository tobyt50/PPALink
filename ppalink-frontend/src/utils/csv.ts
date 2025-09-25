import type { UserGrowthDataPoint, FunnelDataPoint, ReportFilters, CandidateInsightsData, AgencyInsightsData, JobMarketInsightsData } from '../types/analytics';
import type { AuditLog } from '../types/user';

export function exportUserGrowthToCSV(data: UserGrowthDataPoint[], _filters: any) {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  // Define CSV headers
  const headers = ['Date', 'New Candidates', 'New Agencies'];
  // Convert data objects to arrays
  const rows = data.map(row => [
    row.date,
    row.CANDIDATE,
    row.AGENCY,
  ]);

  // Combine headers and rows
  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers, ...rows].map(e => e.join(",")).join("\n");

  // Create a link and trigger the download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `user_growth_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Converts Application Funnel data to a CSV and triggers a download.
 * @param data The funnel data points.
 * @param filters The filters used to generate the report.
 */
export function exportFunnelToCSV(data: FunnelDataPoint[], _filters: ReportFilters | null) {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }
  
  // Define CSV headers for the funnel report
  const headers = ['Stage', 'Applicant Count', 'Conversion Rate from Previous Stage (%)'];
  
  // Convert data objects to arrays, formatting for clarity
  const rows = data.map(row => [
    row.stage,
    row.count,
    row.conversion
  ]);

  let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `application_funnel_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCandidateInsightsToCSV(data: CandidateInsightsData, _filters: ReportFilters | null) {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Section for Geographic Distribution
  csvContent += "Geographic Distribution (Top States)\nState,Candidate Count\n";
  data.geographicDistribution.forEach(row => {
    csvContent += `${row.name},${row.count}\n`;
  });

  // Add more sections for other data points as needed...
  csvContent += "\nSkill Distribution (Top Skills)\nSkill,Candidate Count\n";
  data.skillDistribution.forEach(row => {
    csvContent += `${row.name},${row.count}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `candidate_insights_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 👇 ADD THIS NEW FUNCTION 👇
export function exportAgencyInsightsToCSV(data: AgencyInsightsData, _filters: ReportFilters | null) {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "Overall Stats\n";
    csvContent += `Total Agencies in Filter,${data.totalAgencies}\n`;
    csvContent += `Average Jobs Posted,${data.engagement.avgJobsPosted.toFixed(1)}\n`;
    csvContent += `Average Shortlists,${data.engagement.avgShortlisted.toFixed(1)}\n\n`;

    csvContent += "Plan Distribution\nPlan,Agency Count\n";
    data.planDistribution.forEach(row => {
        csvContent += `${row.name},${row.count}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agency_insights_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Converts Job Market Insights data to a CSV and triggers a download.
 * @param data The job market report data.
 * @param filters The filters used to generate the report.
 */
export function exportJobMarketInsightsToCSV(data: JobMarketInsightsData, _filters: ReportFilters | null) {
  if (!data) {
    alert("No data to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Section 1: Salary Analytics
  const salaryHeaders = ['Metric', 'Value (NGN)'];
  const salaryRows = [
    ['Average Minimum Salary', data.salaryAnalytics.avgMin?.toFixed(0) || 'N/A'],
    ['Average Maximum Salary', data.salaryAnalytics.avgMax?.toFixed(0) || 'N/A'],
    ['Overall Highest Salary', data.salaryAnalytics.overallMax || 'N/A'],
    ['Overall Lowest Salary', data.salaryAnalytics.overallMin || 'N/A'],
  ];
  csvContent += "Salary Analytics\n" + [salaryHeaders, ...salaryRows].map(e => e.join(",")).join("\n") + "\n\n";

  // Section 2: Distribution by Employment Type
  const typeHeaders = ['Employment Type', 'Job Count'];
  const typeRows = data.byEmploymentType.map(row => [row.name, row.count]);
  csvContent += "Distribution by Employment Type\n" + [typeHeaders, ...typeRows].map(e => e.join(",")).join("\n") + "\n\n";
  
  // Section 3: Remote vs. On-site Distribution
  const remoteHeaders = ['Work Model', 'Job Count'];
  const remoteRows = data.remoteDistribution.map(row => [row.name, row.count]);
  csvContent += "Remote vs. On-site Distribution\n" + [remoteHeaders, ...remoteRows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `job_market_insights_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAuditLogsToCSV(data: AuditLog[]) {
  if (!data || data.length === 0) {
    alert("No log data to export.");
    return;
  }

  const headers = ['Timestamp', 'Admin Actor', 'Action', 'Target ID', 'Details'];
  const rows = data.map(log => [
    new Date(log.createdAt).toISOString(),
    log.actor.email,
    log.action,
    log.targetId || 'N/A',
    log.metadata ? JSON.stringify(log.metadata) : ''
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers, ...rows].map(e => `"${e.join('","')}"`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `ppalink_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}