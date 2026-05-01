import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

const resolver = new Resolver();

// Registers a backend function that the frontend can call via invoke('saveRisk')
resolver.define('saveRisk', async (req) => {
  // Extracts the value sent from the frontend (selected risk level)
  const { riskValue } = req.payload;

  // Pulls the current Jira issue ID from Forge execution context
  // This ensures data is stored per issue, not globally
  const issueId = req.context.extension.issue.id;

  // Stores the risk value in Forge Storage using a unique key per issue
  await kvs.set(`risk-level-${issueId}`, riskValue);

  // Simple response back to frontend (not heavily used here but useful for debugging)
  return { success: true };
});

// Registers a backend function that fetches stored risk data
resolver.define('getRisk', async (req) => {
  // Again, uses issue context so each issue has its own stored value
  const issueId = req.context.extension.issue.id;

  // Retrieves previously saved value from Forge storage
  const savedValue = await kvs.get(`risk-level-${issueId}`);

  // CRITICAL: We return the string directly, or an empty string if null.
  // This prevents the React "Object" error.
  // (Forge storage may return undefined/null if nothing has been saved yet)
  return savedValue || "";
});

// Exposes all defined resolver functions to the Forge runtime
export const handler = resolver.getDefinitions();