import React, { useState, useEffect } from 'react';
import ForgeReconciler, {
  Text,
  Heading,
  Stack,
  Button,
  ButtonGroup,
  SectionMessage,
  Box
} from '@forge/react';
import { invoke } from '@forge/bridge';

// Main app component
const App = () => {
  // 'risk' holds the current value (Low, Medium, or High)
  // 'setRisk' is the function we call to update that value    
  const [risk, setRisk] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Tracks whether backend data is still being fetched

  useEffect(() => {
    // Runs once when the component mounts (empty dependency array)

    invoke('getRisk')
      .then((data) => {
        // Converts backend response into a display-safe string if it's an object
        const cleanData = typeof data === 'object' ? JSON.stringify(data) : data;

        setRisk(cleanData); // Initializes UI state from backend value
        setIsLoading(false); // Stops loading state once data is received
      })
      .catch(() => setIsLoading(false)); // Ensures UI doesn't stay stuck if request fails
  }, []);

  const handleUpdate = async (selectedRisk) => {
    // Immediately updates UI before backend call completes (optimistic update)
    setRisk(selectedRisk);

    // Persists selected risk value to Forge backend resolver
    await invoke('saveRisk', { riskValue: selectedRisk });
  };

  // Prevents UI from rendering before data is ready
  if (isLoading) return <Text>Loading...</Text>;

  return (
    // Stack lays out elements vertically with consistent spacing
    <Stack space="space.200">

      {/* Header section */}
      <Box>
        <Heading as="h2">Risk Assessment</Heading>
        <Text>Select the impact level of this issue on the current launch:</Text>
      </Box>

      {/* ButtonGroup aligns the buttons horizontally */}
      <ButtonGroup>
        <Button
          // Updates state to "Low" when clicked        
          onClick={() => handleUpdate('Low')}
          // Highlights button if it is the selected value
          appearance={risk === 'Low' ? 'primary' : 'default'}
        >
          Low
        </Button>

        <Button
          // Updates state to "Medium" when clicked
          onClick={() => handleUpdate('Medium')}
          // Highlights button if it is the selected value
          appearance={risk === 'Medium' ? 'warning' : 'default'}
        >
          Medium
        </Button>

        <Button
          // Updates state to "High" when clicked
          onClick={() => handleUpdate('High')}
          // Highlights button if it is the selected value
          appearance={risk === 'High' ? 'danger' : 'default'}
        >
          High
        </Button>
      </ButtonGroup>

      {/* Conditional rendering: shows different messages based on selected risk */}
      {risk === 'Low' && (
        <SectionMessage title="Low Risk" appearance="success">
          <Text>Standard monitoring required. No immediate action needed.</Text>
        </SectionMessage>
      )}

      {risk === 'Medium' && (
        <SectionMessage title="Mitigation Required" appearance="warning">
          <Text>Please document the contingency plan in the issue description.</Text>
        </SectionMessage>
      )}

      {risk === 'High' && (
        <SectionMessage title="High Risk Detected" appearance="error">
          <Text>The Technical Project Manager has been notified for a review.</Text>
        </SectionMessage>
      )}

      {/* Footer showing current selection or default message */}
      {risk ? (
        <Text>Current Assessment: **{risk}**</Text>
      ) : (
        <Text color="color.text.subtlest">No risk assessment selected yet.</Text>
      )}

    </Stack>
  );
};

// Mounts the App component into the Forge UI runtime
ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);