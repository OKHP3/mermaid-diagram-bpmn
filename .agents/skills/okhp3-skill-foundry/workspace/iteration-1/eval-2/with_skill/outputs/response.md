# Eval Design: weather-fetch

Following the OverKill Hill P³ (OKHP3) Foundry methodology, here are 3 evaluation test cases for the `weather-fetch` skill. Each case includes a realistic developer-voiced prompt and exactly 4 evidence-anchored expectations designed to discriminate between general LLM knowledge and skill-specific implementation.

---

## Eval 1: basic-fetch-implementation
**Focus:** Correct API endpoint construction and parameter mapping.

### Prompt
"I'm building a dashboard and need to show the current weather for San Francisco (lat: 37.7749, lon: -122.4194). I see the `weather-fetch` skill in the docs. How do I construct the specific Open-Meteo URL to get the current temperature and wind speed for these coordinates? Show me the exact URL."

### Expectations
1. **Evidence-Anchored:** Response provides the exact base URL: `https://api.open-meteo.com/v1/forecast`.
2. **Evidence-Anchored:** Response includes the specific query parameter for data fields: `current=temperature_2m,wind_speed_10m`.
3. **Evidence-Anchored:** Response correctly maps the input coordinates to parameters: `latitude=37.7749&longitude=-122.4194`.
4. **Evidence-Anchored:** Response mentions the `fetchWeather` function as the recommended implementation wrapper.

---

## Eval 2: function-signature-and-return-shape
**Focus:** Proper usage of the `fetchWeather` function and handling its return type.

### Prompt
"I want to use the `fetchWeather` function in my TypeScript project. If I call it with `fetchWeather(51.5074, -0.1278)`, what does the returned object look like? I need to know the exact field names and the unit type so I can define my interface."

### Expectations
1. **Evidence-Anchored:** Response shows the return shape contains the `temperature` field (number).
2. **Evidence-Anchored:** Response shows the return shape contains the `windSpeed` field (number).
3. **Evidence-Anchored:** Response specifies the exact hardcoded unit string: `unit: 'celsius'`.
4. **Evidence-Anchored:** Response demonstrates calling `fetchWeather` with exactly two arguments (lat, lon).

---

## Eval 3: integration-and-unit-handling
**Focus:** Integration logic and understanding of skill-defined constraints (celsius only).

### Prompt
"My app usually uses Fahrenheit, but I'm using your `weather-fetch` skill which connects to Open-Meteo. If I call `fetchWeather(40.7128, -74.0060)`, will I need to perform a conversion in my code, or does the skill return Fahrenheit? Show me the return object so I can check the units."

### Expectations
1. **Evidence-Anchored:** Response explicitly states that the skill returns data in Celsius by referencing `unit: 'celsius'`.
2. **Evidence-Anchored:** Response references the specific Open-Meteo endpoint used: `GET https://api.open-meteo.com/v1/forecast`.
3. **Evidence-Anchored:** Response includes the exact return field name `temperature_2m` as part of the internal API mapping description.
4. **Evidence-Anchored:** Response provides a code snippet or description showing the return object structure: `{ temperature: number, windSpeed: number, unit: 'celsius' }`.
