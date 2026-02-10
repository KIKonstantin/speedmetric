<template>
  <div class="page">
    <main class="container">
      <h1>Speedmetric</h1>
      <p class="subtitle">Run Google PageSpeed analysis and keep a history in MongoDB.</p>

      <form class="analyze-form" @submit.prevent="submitAnalysis">
        <input
          v-model.trim="targetUrl"
          type="url"
          placeholder="https://example.com"
          required
        >
        <button type="submit" :disabled="analyzing">
          {{ analyzing ? 'Analyzing...' : 'Analyze URL' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <section v-if="latestResult" class="card">
        <h2>Latest Result</h2>
        <p class="url">{{ latestResult.url }}</p>
        <div class="scores">
          <div>
            <span>Performance</span>
            <strong :class="scoreClass(latestResult.performance)">{{ latestResult.performance }}</strong>
          </div>
          <div>
            <span>Accessibility</span>
            <strong :class="scoreClass(latestResult.accessibility)">{{ latestResult.accessibility }}</strong>
          </div>
          <div>
            <span>LCP</span>
            <strong>{{ latestResult.metrics?.lcp || 'n/a' }}</strong>
          </div>
          <div>
            <span>TBT</span>
            <strong>{{ latestResult.metrics?.tbt || 'n/a' }}</strong>
          </div>
        </div>

        <h3>Top Suggestions</h3>
        <ul v-if="latestResult.suggestions?.length">
          <li v-for="(item, idx) in latestResult.suggestions" :key="`${item.title}-${idx}`">
            <div class="suggestion-title">{{ item.title }}</div>
            <div>{{ item.description }}</div>
            <small>Potential savings: {{ item.savingsMs || 0 }} ms</small>
          </li>
        </ul>
        <p v-else>No optimization suggestions found.</p>
      </section>

      <section class="card">
        <h2>All Analyses</h2>
        <p v-if="loadingHistory">Loading analysis history...</p>
        <p v-else-if="!analyses.length">No analyses yet.</p>
        <table v-else>
          <thead>
            <tr>
              <th>URL</th>
              <th>Performance</th>
              <th>Accessibility</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in analyses" :key="item._id">
              <td class="url-cell">{{ item.url }}</td>
              <td :class="scoreClass(item.performance)">{{ item.performance }}</td>
              <td :class="scoreClass(item.accessibility)">{{ item.accessibility }}</td>
              <td>{{ formatDate(item.timestamp) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useLighthouse } from '../composables/lighthouse.js';

const targetUrl = ref('');
const {
  analyzing,
  loadingHistory,
  error,
  latestResult,
  analyses,
  fetchAnalyses,
  analyzeUrl
} = useLighthouse();

const submitAnalysis = async () => {
  if (!targetUrl.value) {
    return;
  }
  try {
    await analyzeUrl(targetUrl.value);
  } catch {
    // Error state is handled in the composable.
  }
};

const scoreClass = (score) => {
  if (score >= 90) return 'score-good';
  if (score >= 50) return 'score-mid';
  return 'score-bad';
};

const formatDate = (value) => new Date(value).toLocaleString();

onMounted(async () => {
  await fetchAnalyses();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f8fb 0%, #eef2f8 100%);
  color: #1b2733;
  padding: 32px 16px;
}

.container {
  max-width: 980px;
  margin: 0 auto;
  font-family: "Segoe UI", Roboto, Arial, sans-serif;
}

h1 {
  margin: 0;
  font-size: 2rem;
}

.subtitle {
  margin-top: 8px;
  color: #4e5f74;
}

.analyze-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin: 24px 0;
}

input {
  border: 1px solid #c8d4e3;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
}

button {
  border: none;
  border-radius: 8px;
  background: #0b6dc8;
  color: #fff;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(27, 39, 51, 0.08);
}

.url {
  margin: 6px 0 16px;
  color: #415264;
  word-break: break-all;
}

.scores {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.scores span {
  display: block;
  color: #64758a;
  font-size: 0.9rem;
}

.scores strong {
  font-size: 1.25rem;
}

.suggestion-title {
  font-weight: 600;
  margin-bottom: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  border-bottom: 1px solid #e7edf4;
  padding: 10px 8px;
}

.url-cell {
  max-width: 400px;
  word-break: break-all;
}

.score-good {
  color: #0f8a4b;
  font-weight: 700;
}

.score-mid {
  color: #c37b00;
  font-weight: 700;
}

.score-bad {
  color: #cc2f2f;
  font-weight: 700;
}

.error {
  color: #cc2f2f;
  margin-bottom: 16px;
}

@media (max-width: 800px) {
  .analyze-form {
    grid-template-columns: 1fr;
  }

  .scores {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}
</style>
