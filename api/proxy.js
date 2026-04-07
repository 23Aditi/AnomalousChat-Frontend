export default async function handler(req, res) {
    const path = req.query.path || '';
    const targetURL = `http://13.217.211.79:5000/${path}`;

    try {
        const fetchOptions = {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const backendRes = await fetch(targetURL, fetchOptions);
        const data = await backendRes.json();

        res.status(backendRes.status).json(data);
    } catch (err) {
        res.status(502).json({ error: 'Backend unreachable', detail: err.message });
    }
}