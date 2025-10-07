// Security features test script
// Run this to test rate limiting and message validation

const axios = require("axios");

const BASE_URL = "http://localhost:3000";

// Test 1: Normal request (should succeed)
async function testNormalRequest() {
  console.log("\n🧪 Test 1: Normal Request");
  try {
    const response = await axios.post(`${BASE_URL}/chatMessage`, {
      chatMessage: [{ role: "user", content: "Hello, how are you?" }],
    });
    console.log("✅ Normal request succeeded");
  } catch (error) {
    console.log(
      "❌ Normal request failed:",
      error.response?.data?.msg || error.message
    );
  }
}

// Test 2: Rate limiting (should block after max requests)
async function testRateLimiting() {
  console.log("\n🧪 Test 2: Rate Limiting (sending 12 requests rapidly)");
  for (let i = 1; i <= 12; i++) {
    try {
      await axios.post(`${BASE_URL}/chatMessage`, {
        chatMessage: [{ role: "user", content: `Request ${i}` }],
      });
      console.log(`✅ Request ${i} succeeded`);
    } catch (error) {
      console.log(
        `❌ Request ${i} blocked:`,
        error.response?.data?.msg || error.message
      );
    }
    // Small delay to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Test 3: Message too long (should fail)
async function testMessageTooLong() {
  console.log("\n🧪 Test 3: Message Too Long (6000 characters)");
  try {
    const longMessage = "a".repeat(6000);
    await axios.post(`${BASE_URL}/chatMessage`, {
      chatMessage: [{ role: "user", content: longMessage }],
    });
    console.log("❌ Should have been rejected");
  } catch (error) {
    console.log(
      "✅ Correctly rejected:",
      error.response?.data?.msg || error.message
    );
  }
}

// Test 4: Too many messages in history (should fail)
async function testTooManyMessages() {
  console.log("\n🧪 Test 4: Too Many Messages in History (25 messages)");
  try {
    const messages = [];
    for (let i = 0; i < 25; i++) {
      messages.push({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i}`,
      });
    }
    await axios.post(`${BASE_URL}/chatMessage`, {
      chatMessage: messages,
    });
    console.log("❌ Should have been rejected");
  } catch (error) {
    console.log(
      "✅ Correctly rejected:",
      error.response?.data?.msg || error.message
    );
  }
}

// Test 5: Suspicious content (should fail)
async function testSuspiciousContent() {
  console.log("\n🧪 Test 5: Suspicious Content (repeated characters)");
  try {
    const suspiciousMessage = "a".repeat(100);
    await axios.post(`${BASE_URL}/chatMessage`, {
      chatMessage: [{ role: "user", content: suspiciousMessage }],
    });
    console.log("❌ Should have been rejected");
  } catch (error) {
    console.log(
      "✅ Correctly rejected:",
      error.response?.data?.msg || error.message
    );
  }
}

// Test 6: Get usage statistics
async function testGetStats() {
  console.log("\n🧪 Test 6: Get Usage Statistics");
  try {
    const response = await axios.get(`${BASE_URL}/admin/stats`);
    console.log("✅ Statistics retrieved:");
    console.log(JSON.stringify(response.data.data, null, 2));
  } catch (error) {
    console.log(
      "❌ Failed to get stats:",
      error.response?.data?.msg || error.message
    );
  }
}

// Test 7: Get blocked IPs
async function testGetBlockedIPs() {
  console.log("\n🧪 Test 7: Get Blocked IPs");
  try {
    const response = await axios.get(`${BASE_URL}/admin/blocked-ips`);
    console.log("✅ Blocked IPs retrieved:");
    console.log(JSON.stringify(response.data.data, null, 2));
  } catch (error) {
    console.log(
      "❌ Failed to get blocked IPs:",
      error.response?.data?.msg || error.message
    );
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting Security Tests...");
  console.log("Make sure the server is running on port 3000");

  await testNormalRequest();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testMessageTooLong();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testTooManyMessages();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testSuspiciousContent();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testGetStats();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testRateLimiting();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testGetBlockedIPs();

  console.log("\n✅ All tests completed!");
  console.log("Check logs/usage.log and logs/suspicious.log for details");
}

// Run tests
runAllTests().catch(console.error);
