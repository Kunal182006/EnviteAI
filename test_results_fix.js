// Test the Results page fix logic
console.log("Testing Results page fix logic");

// Simulate the different types of data that could come from the API
const testCases = [
  { name: "Valid array", data: [{ id: 1, card_type: "wedding", is_selected: true }] },
  { name: "Empty array", data: [] },
  { name: "Null value", data: null },
  { name: "Undefined value", data: undefined },
  { name: "Error object", data: { detail: "Wedding not found" } },
  { name: "String value", data: "error" },
  { name: "Number value", data: 404 }
];

testCases.forEach(testCase => {
  console.log(`\n--- Testing: ${testCase.name} ---`);
  const designsData = testCase.data;
  
  try {
    // This is the fix logic from Results.jsx line 70
    const designsArray = Array.isArray(designsData) ? designsData : [];
    console.log(`✅ Fix applied successfully. Result:`, designsArray);
    
    // Test the forEach loop that was causing the error
    const selected = {};
    designsArray.forEach(d => {
      if (d.is_selected) {
        selected[d.card_type] = d.id;
      }
    });
    console.log(`✅ forEach completed successfully. Selected:`, selected);
    
  } catch (error) {
    console.log(`❌ Error occurred:`, error.message);
  }
});

console.log("\n=== Test Completed ===");