import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';
import api, { route } from '@forge/api';

const resolver = new Resolver();

/**
 * Constants
 * These represent all possible risk labels in Jira.
 * We use them to remove old labels before applying a new one.
 */
const RISK_LABELS = ["risk-low", "risk-medium", "risk-high"];

/**
 * SAVE RISK
 * This function:
 * 1. Receives risk selection from the UI
 * 2. Gets issue context (issueKey + issueId)
 * 3. Saves value in Forge storage
 * 4. Updates Jira issue labels via REST API
 */
resolver.define('saveRisk', async (req) => {

  // Extract user-selected risk from UI
  const { riskValue } = req.payload;

  // Pull Jira issue context from Forge runtime
  const issue = req.context?.extension?.issue;
  const issueKey = issue?.key;
  const issueId = issue?.id;

  // Debug logs (useful during development / troubleshooting)
  console.log("Issue Key:", issueKey);
  console.log("Issue ID:", issueId);
  console.log("Selected Risk:", riskValue);

  // Safety check: ensure we are inside a Jira issue context
  if (!issueKey || !issueId) {
    console.error("Missing issue context");
    return { success: false, error: "Missing issue context" };
  }

  /**
   * STEP 1: Persist risk value in Forge Storage
   * Key is scoped per issue so each issue stores its own risk state.
   */
  await kvs.set(`risk-level-${issueId}`, riskValue);

  /**
   * STEP 2: Convert UI value into Jira label format
   * Example: "High" → "risk-high"
   */
  const newLabel = `risk-${String(riskValue).toLowerCase()}`;

  /**
   * STEP 3: Prepare Jira update payload
   * - Remove all existing risk labels
   * - Add the newly selected label
   */
  const update = {
    labels: [
      ...RISK_LABELS.map(label => ({ remove: label })),
      { add: newLabel }
    ]
  };

  try {

    /**
     * STEP 4: Call Jira REST API (as the app)
     * This updates the issue labels directly in Jira.
     */
    const response = await api.asApp().requestJira(
      route`/rest/api/3/issue/${issueKey}`,
      {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ update })
      }
    );

    const responseText = await response.text();

    // Debugging output from Jira API
    console.log("Jira Response Status:", response.status);
    console.log("Jira Response Body:", responseText);

    /**
     * Jira returns 204 for successful updates (no content)
     */
    if (response.status === 204) {
      return { success: true };
    }

    // Handle unexpected responses
    return {
      success: false,
      status: response.status,
      error: responseText
    };

  } catch (err) {

    // Catch network/API/runtime failures
    console.error("Request failed:", err);

    return {
      success: false,
      error: err.message || "Unknown error"
    };
  }
});

/**
 * GET RISK
 * This function:
 * 1. Reads issue context
 * 2. Retrieves stored risk from Forge Storage
 * 3. Returns value to frontend
 */
resolver.define('getRisk', async (req) => {

  const issueId = req.context?.extension?.issue?.id;

  // If we are not inside a Jira issue, return empty state
  if (!issueId) {
    return "";
  }

  /**
   * Fetch stored risk value for this issue
   */
  const savedValue = await kvs.get(`risk-level-${issueId}`);

  // CRITICAL: We return the string directly, or an empty string if null.
  // This prevents the React "Object" error.
  // (Forge storage may return undefined/null if nothing has been saved yet)
  return savedValue || "";
});

/**
 * Export all resolver definitions
 * Forge uses this as the entry point for backend functions
 */
export const handler = resolver.getDefinitions();