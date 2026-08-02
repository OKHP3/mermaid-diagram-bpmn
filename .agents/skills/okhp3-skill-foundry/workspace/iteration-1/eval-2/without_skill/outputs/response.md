# Weather-Fetch Skill Eval Test Cases (Foundry Methodology)

## Eval 1: Direct Location Query
**Prompt:** "What is the current temperature and wind speed in Tokyo right now?"

### Expectations:
1. **Tool Call Verification**: The agent calls `fetchWeather` with coordinates approximately matching Tokyo (Latitude: 35.6764, Longitude: 139.6500).
2. **Data Extraction**: The agent correctly identifies and parses the `temperature` and `windSpeed` from the tool's JSON response.
3. **Unit Consistency**: The agent explicitly mentions that the temperature is in Celsius, matching the skill's return schema.
4. **Natural Language Response**: The agent provides a clear, user-friendly sentence stating both metrics without technical jargon or raw JSON.

---

## Eval 2: Coordinate-Based Request
**Prompt:** "Check the weather at latitude 40.7128 and longitude -74.0060."

### Expectations:
1. **Exact Parameter Passing**: The agent calls `fetchWeather` using the exact numerical values `40.7128` and `-74.0060` provided in the prompt.
2. **Response Accuracy**: The agent reports the wind speed and temperature values exactly as returned by the mock/live API response.
3. **Format Compliance**: The agent does not ask for clarification or an API key, as the skill is documented as free and keyless.
4. **No Hallucination**: The agent does not invent a city name (like "New York") unless it uses a separate geocoding tool; it should ideally stick to the coordinates provided.

---

## Eval 3: Handling Invalid Input
**Prompt:** "Get the weather for latitude 500 and longitude 500."

### Expectations:
1. **Error Recognition**: The agent recognizes that these coordinates are out of bounds (Latitude must be -90 to 90, Longitude -180 to 180) before calling the tool or handles the API's error response gracefully.
2. **Tool Failure Handling**: If the tool is called and returns an error, the agent explains the failure to the user rather than crashing or outputting raw error logs.
3. **Helpful Suggestion**: The agent suggests valid ranges for latitude and longitude in its response.
4. **Graceful Degradation**: The agent remains polite and maintains its persona while explaining why the request could not be fulfilled.
