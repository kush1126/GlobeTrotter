import axios from "axios";

const BASE_URL = "http://localhost:4000/api";

interface TestResult {
  endpoint: string;
  method: string;
  status: "PASS" | "FAIL";
  httpCode?: number;
  details?: string;
}

const results: TestResult[] = [];

function record(method: string, endpoint: string, status: "PASS" | "FAIL", httpCode?: number, details?: string) {
  results.push({ method, endpoint, status, httpCode, details });
  console.log(`[${status}] ${method.toUpperCase()} ${endpoint} -> ${httpCode ?? ""} ${details ?? ""}`);
}

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE ENDPOINT TESTS ===");

  // 1. Health check
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.status === 200 && res.data.status === "ok") {
      record("GET", "/health", "PASS", res.status, JSON.stringify(res.data));
    } else {
      record("GET", "/health", "FAIL", res.status, "Unexpected response");
    }
  } catch (err: any) {
    record("GET", "/health", "FAIL", err.response?.status, err.message);
  }

  // 2. Auth: Register a new test user
  const testEmail = `tester_${Date.now()}@test.com`;
  let token = "";
  let userId = "";

  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: "Test Runner",
      email: testEmail,
      password: "password123",
    });
    if (res.status === 201 && res.data.token) {
      token = res.data.token;
      userId = res.data.user.id;
      record("POST", "/auth/register", "PASS", res.status, `Created user ${res.data.user.email}`);
    } else {
      record("POST", "/auth/register", "FAIL", res.status, "Token not returned");
    }
  } catch (err: any) {
    record("POST", "/auth/register", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 3. Auth: Login with existing user
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: "password123",
    });
    if (res.status === 200 && res.data.token) {
      token = res.data.token;
      record("POST", "/auth/login", "PASS", res.status, "Logged in successfully");
    } else {
      record("POST", "/auth/login", "FAIL", res.status, "Login failed");
    }
  } catch (err: any) {
    record("POST", "/auth/login", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 4. Auth: Login with demo user
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: "explorer@globaltrotter.com",
      password: "password123",
    });
    if (res.status === 200 && res.data.token) {
      record("POST", "/auth/login (demo user)", "PASS", res.status, `Demo user: ${res.data.user.name}`);
    } else {
      record("POST", "/auth/login (demo user)", "FAIL", res.status, "Demo login failed");
    }
  } catch (err: any) {
    record("POST", "/auth/login (demo user)", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // 5. Auth: GET /auth/me
  try {
    const res = await axios.get(`${BASE_URL}/auth/me`, authHeaders);
    if (res.status === 200 && res.data.email === testEmail) {
      record("GET", "/auth/me", "PASS", res.status, `Current user: ${res.data.name}`);
    } else {
      record("GET", "/auth/me", "FAIL", res.status, "Me check failed");
    }
  } catch (err: any) {
    record("GET", "/auth/me", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 6. Auth: PATCH /auth/me
  try {
    const res = await axios.patch(
      `${BASE_URL}/auth/me`,
      { name: "Test Runner Updated", currency: "EUR", language: "fr" },
      authHeaders
    );
    if (res.status === 200 && res.data.name === "Test Runner Updated") {
      record("PATCH", "/auth/me", "PASS", res.status, `Updated user: ${res.data.name}, ${res.data.currency}`);
    } else {
      record("PATCH", "/auth/me", "FAIL", res.status, "Patch me failed");
    }
  } catch (err: any) {
    record("PATCH", "/auth/me", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 7. Search: GET /search/meta
  try {
    const res = await axios.get(`${BASE_URL}/search/meta`);
    if (res.status === 200 && Array.isArray(res.data.countries) && Array.isArray(res.data.cities)) {
      record("GET", "/search/meta", "PASS", res.status, `Found ${res.data.countries.length} countries, ${res.data.cities.length} cities`);
    } else {
      record("GET", "/search/meta", "FAIL", res.status, "Search meta malformed");
    }
  } catch (err: any) {
    record("GET", "/search/meta", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 8. Search: GET /search/activities
  try {
    const res = await axios.get(`${BASE_URL}/search/activities?city=Paris&category=sightseeing`);
    if (res.status === 200 && Array.isArray(res.data)) {
      record("GET", "/search/activities", "PASS", res.status, `Found ${res.data.length} activities for Paris/sightseeing`);
    } else {
      record("GET", "/search/activities", "FAIL", res.status, "Activities search failed");
    }
  } catch (err: any) {
    record("GET", "/search/activities", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 9. Search: GET /search/destinations
  try {
    const res = await axios.get(`${BASE_URL}/search/destinations?q=ja`);
    if (res.status === 200 && Array.isArray(res.data)) {
      record("GET", "/search/destinations", "PASS", res.status, `Found ${res.data.length} destinations matching 'ja'`);
    } else {
      record("GET", "/search/destinations", "FAIL", res.status, "Destinations search failed");
    }
  } catch (err: any) {
    record("GET", "/search/destinations", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 10. Community: GET /community/trips
  try {
    const res = await axios.get(`${BASE_URL}/community/trips`);
    if (res.status === 200 && Array.isArray(res.data)) {
      record("GET", "/community/trips", "PASS", res.status, `Found ${res.data.length} public community trips`);
    } else {
      record("GET", "/community/trips", "FAIL", res.status, "Community trips failed");
    }
  } catch (err: any) {
    record("GET", "/community/trips", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 11. Trips: POST /trips (Create trip)
  let createdTripId = "";
  let shareToken = "";
  try {
    const res = await axios.post(
      `${BASE_URL}/trips`,
      {
        title: "Alpine & Riviera Tour",
        description: "A wonderful scenic roadtrip across Switzerland and France.",
        startDate: "2026-09-01T00:00:00.000Z",
        endDate: "2026-09-10T00:00:00.000Z",
      },
      authHeaders
    );
    if (res.status === 201 && res.data.id) {
      createdTripId = res.data.id;
      shareToken = res.data.shareToken;
      record("POST", "/trips", "PASS", res.status, `Created trip: ${res.data.id} (${res.data.title})`);
    } else {
      record("POST", "/trips", "FAIL", res.status, "Trip create returned no ID");
    }
  } catch (err: any) {
    record("POST", "/trips", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 12. Trips: GET /trips (List trips)
  try {
    const res = await axios.get(`${BASE_URL}/trips`, authHeaders);
    if (res.status === 200 && Array.isArray(res.data) && res.data.some((t) => t.id === createdTripId)) {
      record("GET", "/trips", "PASS", res.status, `User has ${res.data.length} trip(s)`);
    } else {
      record("GET", "/trips", "FAIL", res.status, "Trip not in listing");
    }
  } catch (err: any) {
    record("GET", "/trips", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 13. Trips: GET /trips/:id
  try {
    const res = await axios.get(`${BASE_URL}/trips/${createdTripId}`, authHeaders);
    if (res.status === 200 && res.data.id === createdTripId && res.data.viewerIsOwner === true) {
      record("GET", `/trips/${createdTripId}`, "PASS", res.status, `Fetched trip: ${res.data.title}`);
    } else {
      record("GET", `/trips/${createdTripId}`, "FAIL", res.status, "Trip detail mismatch");
    }
  } catch (err: any) {
    record("GET", `/trips/${createdTripId}`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 14. Trips: PATCH /trips/:id
  try {
    const res = await axios.patch(
      `${BASE_URL}/trips/${createdTripId}`,
      { title: "Alpine & Riviera Tour (Updated)" },
      authHeaders
    );
    if (res.status === 200 && res.data.title === "Alpine & Riviera Tour (Updated)") {
      record("PATCH", `/trips/${createdTripId}`, "PASS", res.status, "Updated title successfully");
    } else {
      record("PATCH", `/trips/${createdTripId}`, "FAIL", res.status, "Update failed");
    }
  } catch (err: any) {
    record("PATCH", `/trips/${createdTripId}`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 15. Stops: POST /trips/:id/stops (Add stop)
  let stopId1 = "";
  try {
    const res = await axios.post(
      `${BASE_URL}/trips/${createdTripId}/stops`,
      {
        city: "Interlaken",
        country: "Switzerland",
        arrivalDate: "2026-09-01T00:00:00.000Z",
        departureDate: "2026-09-05T00:00:00.000Z",
        orderIndex: 0,
        plannedBudget: 450,
        notes: "Glacier hike and mountain railways",
      },
      authHeaders
    );
    if (res.status === 201 && res.data.id) {
      stopId1 = res.data.id;
      record("POST", `/trips/${createdTripId}/stops`, "PASS", res.status, `Added stop: ${res.data.city} (${stopId1})`);
    } else {
      record("POST", `/trips/${createdTripId}/stops`, "FAIL", res.status, "Add stop failed");
    }
  } catch (err: any) {
    record("POST", `/trips/${createdTripId}/stops`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 16. Stops: PATCH /stops/:id
  try {
    const res = await axios.patch(
      `${BASE_URL}/stops/${stopId1}`,
      { city: "Interlaken Resort" },
      authHeaders
    );
    if (res.status === 200 && res.data.city === "Interlaken Resort") {
      record("PATCH", `/stops/${stopId1}`, "PASS", res.status, "Updated stop city");
    } else {
      record("PATCH", `/stops/${stopId1}`, "FAIL", res.status, "Stop patch failed");
    }
  } catch (err: any) {
    record("PATCH", `/stops/${stopId1}`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 17. Activities: POST /stops/:id/activities
  let activityId1 = "";
  try {
    const res = await axios.post(
      `${BASE_URL}/stops/${stopId1}/activities`,
      {
        name: "Jungfraujoch Railway",
        category: "sightseeing",
        date: "2026-09-02T09:00:00.000Z",
        startTime: "09:00",
        endTime: "15:00",
        estimatedCost: 160,
        currency: "USD",
        notes: "Top of Europe alpine train ticket",
      },
      authHeaders
    );
    if (res.status === 201 && res.data.id) {
      activityId1 = res.data.id;
      record("POST", `/stops/${stopId1}/activities`, "PASS", res.status, `Created activity: ${res.data.name} ($${res.data.estimatedCost})`);
    } else {
      record("POST", `/stops/${stopId1}/activities`, "FAIL", res.status, "Create activity failed");
    }
  } catch (err: any) {
    record("POST", `/stops/${stopId1}/activities`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 18. Activities: PATCH /activities/:id
  try {
    const res = await axios.patch(
      `${BASE_URL}/activities/${activityId1}`,
      { estimatedCost: 175 },
      authHeaders
    );
    if (res.status === 200 && Number(res.data.estimatedCost) === 175) {
      record("PATCH", `/activities/${activityId1}`, "PASS", res.status, `Updated activity cost to $${res.data.estimatedCost}`);
    } else {
      record("PATCH", `/activities/${activityId1}`, "FAIL", res.status, "Update activity failed");
    }
  } catch (err: any) {
    record("PATCH", `/activities/${activityId1}`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 19. Trips: GET /trips/:id/budget
  try {
    const res = await axios.get(`${BASE_URL}/trips/${createdTripId}/budget`, authHeaders);
    if (res.status === 200 && typeof res.data.totalActual === "number") {
      record("GET", `/trips/${createdTripId}/budget`, "PASS", res.status, `Total actual: $${res.data.totalActual}`);
    } else {
      record("GET", `/trips/${createdTripId}/budget`, "FAIL", res.status, "Budget endpoint failed");
    }
  } catch (err: any) {
    record("GET", `/trips/${createdTripId}/budget`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 20. Trips: GET /trips/:id/calendar
  try {
    const res = await axios.get(`${BASE_URL}/trips/${createdTripId}/calendar`, authHeaders);
    if (res.status === 200 && typeof res.data === "object") {
      record("GET", `/trips/${createdTripId}/calendar`, "PASS", res.status, `Calendar days: ${Object.keys(res.data).join(", ")}`);
    } else {
      record("GET", `/trips/${createdTripId}/calendar`, "FAIL", res.status, "Trip calendar failed");
    }
  } catch (err: any) {
    record("GET", `/trips/${createdTripId}/calendar`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 21. Calendar: GET /calendar/mine
  try {
    const res = await axios.get(`${BASE_URL}/calendar/mine`, authHeaders);
    if (res.status === 200 && Array.isArray(res.data)) {
      record("GET", "/calendar/mine", "PASS", res.status, `Found ${res.data.length} user trips in calendar`);
    } else {
      record("GET", "/calendar/mine", "FAIL", res.status, "User calendar failed");
    }
  } catch (err: any) {
    record("GET", "/calendar/mine", "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 22. Trips: POST /trips/:id/share (Make public & share with demo user)
  try {
    const res = await axios.post(
      `${BASE_URL}/trips/${createdTripId}/share`,
      {
        makePublic: true,
        inviteEmail: "explorer@globaltrotter.com",
        permission: "edit",
      },
      authHeaders
    );
    if (res.status === 200 && res.data.isPublic === true && res.data.shares?.length > 0) {
      record("POST", `/trips/${createdTripId}/share`, "PASS", res.status, `Trip is public, shared with ${res.data.shares[0].sharedWithUser.email}`);
    } else {
      record("POST", `/trips/${createdTripId}/share`, "FAIL", res.status, "Trip share failed");
    }
  } catch (err: any) {
    record("POST", `/trips/${createdTripId}/share`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 23. Public Trips: GET /public/trips/:shareToken
  try {
    const res = await axios.get(`${BASE_URL}/public/trips/${shareToken}`);
    if (res.status === 200 && res.data.id === createdTripId) {
      record("GET", `/public/trips/${shareToken}`, "PASS", res.status, `Fetched public trip: ${res.data.title}`);
    } else {
      record("GET", `/public/trips/${shareToken}`, "FAIL", res.status, "Public trip fetch failed");
    }
  } catch (err: any) {
    record("GET", `/public/trips/${shareToken}`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 24. Public Trips: POST /public/trips/:shareToken/copy (Clone trip)
  let clonedTripId = "";
  try {
    const res = await axios.post(`${BASE_URL}/public/trips/${shareToken}/copy`, {}, authHeaders);
    if (res.status === 201 && res.data.id) {
      clonedTripId = res.data.id;
      record("POST", `/public/trips/${shareToken}/copy`, "PASS", res.status, `Cloned trip: ${clonedTripId} (${res.data.title})`);
    } else {
      record("POST", `/public/trips/${shareToken}/copy`, "FAIL", res.status, "Copy public trip failed");
    }
  } catch (err: any) {
    record("POST", `/public/trips/${shareToken}/copy`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 25. Activities: DELETE /activities/:id
  try {
    const res = await axios.delete(`${BASE_URL}/activities/${activityId1}`, authHeaders);
    if (res.status === 204) {
      record("DELETE", `/activities/${activityId1}`, "PASS", res.status, "Activity deleted");
    } else {
      record("DELETE", `/activities/${activityId1}`, "FAIL", res.status, "Delete activity failed");
    }
  } catch (err: any) {
    record("DELETE", `/activities/${activityId1}`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 26. Stops: DELETE /stops/:id
  try {
    const res = await axios.delete(`${BASE_URL}/stops/${stopId1}`, authHeaders);
    if (res.status === 204) {
      record("DELETE", `/stops/${stopId1}`, "PASS", res.status, "Stop deleted");
    } else {
      record("DELETE", `/stops/${stopId1}`, "FAIL", res.status, "Delete stop failed");
    }
  } catch (err: any) {
    record("DELETE", `/stops/${stopId1}`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  // 27. Trips: DELETE /trips/:id (Delete original trip and cloned trip)
  try {
    const res = await axios.delete(`${BASE_URL}/trips/${createdTripId}`, authHeaders);
    if (res.status === 204) {
      record("DELETE", `/trips/${createdTripId}`, "PASS", res.status, "Original trip deleted");
    } else {
      record("DELETE", `/trips/${createdTripId}`, "FAIL", res.status, "Delete trip failed");
    }
  } catch (err: any) {
    record("DELETE", `/trips/${createdTripId}`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
  }

  if (clonedTripId) {
    try {
      const res = await axios.delete(`${BASE_URL}/trips/${clonedTripId}`, authHeaders);
      if (res.status === 204) {
        record("DELETE", `/trips/${clonedTripId}`, "PASS", res.status, "Cloned trip deleted");
      }
    } catch (err: any) {
      record("DELETE", `/trips/${clonedTripId}`, "FAIL", err.response?.status, err.response?.data?.error || err.message);
    }
  }

  console.log("\n=== TEST SUMMARY ===");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) {
    console.error("FAILURES DETECTED:");
    results.filter((r) => r.status === "FAIL").forEach((f) => console.error(` - ${f.method} ${f.endpoint}: ${f.details}`));
    process.exit(1);
  } else {
    console.log("ALL ENDPOINTS WORKING FLAWLESSLY!");
  }
}

runTests().catch((e) => {
  console.error("Fatal test runner error:", e);
  process.exit(1);
});
