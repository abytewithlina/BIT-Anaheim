import React, { useState } from 'react';
import ForgeReconciler, {
  Text,
  Heading,
  Stack,
  Button,
  ButtonGroup,
  SectionMessage,
  Box
} from '@forge/react';

// Main app component
const App = () => {
  // 'risk' holds the current value (Low, Medium, or High)
  // 'setRisk' is the function we call to update that value
  const [risk, setRisk] = useState(null);

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
          onClick={() => setRisk('Low')}
          // Highlights button if it is the selected value
          appearance={risk === 'Low' ? 'primary' : 'default'}
        >
          Low
        </Button>

        <Button
          // Updates state to "Medium" when clicked
          onClick={() => setRisk('Medium')}
          // Highlights button if it is the selected value
          appearance={risk === 'Medium' ? 'warning' : 'default'}
        >
          Medium
        </Button>

        <Button
          // Updates state to "High" when clicked
          onClick={() => setRisk('High')}
          // Highlights button if it is the selected value
          appearance={risk === 'High' ? 'danger' : 'default'}
        >
          High
        </Button>
      </ButtonGroup>

      {/* Show a message based on the selected risk */}
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