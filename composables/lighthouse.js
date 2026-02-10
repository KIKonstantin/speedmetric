export const useLighthouse = () => {
    const analyzing = useState('lighthouse:analyzing', () => false);
    const loadingHistory = useState('lighthouse:loadingHistory', () => false);
    const error = useState('lighthouse:error', () => '');
    const latestResult = useState('lighthouse:latestResult', () => null);
    const analyses = useState('lighthouse:analyses', () => []);

    const fetchAnalyses = async () => {
        loadingHistory.value = true;
        error.value = '';
        try {
            const { audits } = await $fetch('/api/analyses');
            analyses.value = audits || [];
            latestResult.value = analyses.value[0] || null;
        } catch (err) {
            error.value = err?.data?.statusMessage || err?.message || 'Failed to load analyses';
        } finally {
            loadingHistory.value = false;
        }
    };

    const analyzeUrl = async (url) => {
        analyzing.value = true;
        error.value = '';
        try {
            const { audit } = await $fetch('/api/analyze', {
                method: 'POST',
                body: { url }
            });

            latestResult.value = audit;
            analyses.value = [audit, ...analyses.value.filter((item) => item._id !== audit._id)];
            return audit;
        } catch (err) {
            error.value = err?.data?.statusMessage || err?.message || 'Analysis failed';
            throw err;
        } finally {
            analyzing.value = false;
        }
    };

    return {
        analyzing,
        loadingHistory,
        error,
        latestResult,
        analyses,
        fetchAnalyses,
        analyzeUrl
    };
};
