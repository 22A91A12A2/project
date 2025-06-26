import React, { useState } from 'react';

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const generateShortCode = (existingCodes) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingCodes.has(code));
  return code;
};

const App = () => {
  const [urls, setUrls] = useState([
    { original: '', validity: '', shortcode: '', error: '' },
  ]);
  const [shortenedUrls, setShortenedUrls] = useState([]);

  const handleInputChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    newUrls[index].error = '';
    setUrls(newUrls);
  };

  const validateInputs = () => {
    let valid = true;
    const newUrls = urls.map((url) => {
      let error = '';
      if (!url.original || !isValidUrl(url.original)) {
        error = 'Invalid URL';
        valid = false;
      }
      if (url.validity && (!/^\d+$/.test(url.validity) || parseInt(url.validity) <= 0)) {
        error = 'Validity must be a positive integer';
        valid = false;
      }
      return { ...url, error };
    });
    setUrls(newUrls);
    return valid;
  };

  const handleAddUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, { original: '', validity: '', shortcode: '', error: '' }]);
    }
  };

  const handleShorten = () => {
    if (!validateInputs()) return;

    const existingCodes = new Set(shortenedUrls.map((u) => u.shortcode));
    const newShortened = urls.map((url) => {
      let code = url.shortcode.trim();
      if (!code) {
        code = generateShortCode(existingCodes);
      } else if (existingCodes.has(code)) {
        code = generateShortCode(existingCodes);
      }
      existingCodes.add(code);

      const validityMinutes = url.validity ? parseInt(url.validity) : 30;
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + validityMinutes * 60000);

      return {
        original: url.original,
        shortcode: code,
        createdAt,
        expiresAt,
        clicks: 0,
        clickDetails: [],
      };
    });

    setShortenedUrls([...shortenedUrls, ...newShortened]);
    setUrls([{ original: '', validity: '', shortcode: '', error: '' }]);
  };

  const handleClickShortUrl = (index) => {
    const newShortened = [...shortenedUrls];
    const now = new Date();
    if (now > newShortened[index].expiresAt) {
      alert('This short URL has expired.');
      return;
    }
    newShortened[index].clicks += 1;
    newShortened[index].clickDetails.push({
      timestamp: now.toLocaleString(),
      source: 'Direct Click',
      location: 'Unknown',
    });
    setShortenedUrls(newShortened);
    window.open(newShortened[index].original, '_blank');
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>React URL Shortener</h1>
      <h2>Shorten up to 5 URLs</h2>
      {urls.map((url, idx) => (
        <div key={idx} style={{ marginBottom: 15, border: '1px solid #ccc', padding: 10 }}>
          <div>
            <label>
              Original URL:
              <input
                type="text"
                value={url.original}
                onChange={(e) => handleInputChange(idx, 'original', e.target.value)}
                style={{ width: '100%' }}
                placeholder="https://example.com"
              />
            </label>
          </div>
          <div>
            <label>
              Validity (minutes, optional, default 30):
              <input
                type="text"
                value={url.validity}
                onChange={(e) => handleInputChange(idx, 'validity', e.target.value)}
                style={{ width: '100%' }}
                placeholder="30"
              />
            </label>
          </div>
          <div>
            <label>
              Preferred Shortcode (optional):
              <input
                type="text"
                value={url.shortcode}
                onChange={(e) => handleInputChange(idx, 'shortcode', e.target.value)}
                style={{ width: '100%' }}
                placeholder="custom123"
              />
            </label>
          </div>
          {url.error && <div style={{ color: 'red' }}>{url.error}</div>}
        </div>
      ))}
      {urls.length < 5 && (
        <button onClick={handleAddUrl} style={{ marginBottom: 20 }}>
          Add Another URL
        </button>
      )}
      <br />
      <button onClick={handleShorten}>Shorten URLs</button>

      <h2>Shortened URLs</h2>
      {shortenedUrls.length === 0 && <p>No URLs shortened yet.</p>}
      {shortenedUrls.map((url, idx) => (
        <div key={idx} style={{ border: '1px solid #888', padding: 10, marginBottom: 10 }}>
          <div>
            <strong>Original URL:</strong> {url.original}
          </div>
          <div>
            <strong>Short URL:</strong>{' '}
            <a
              href="#!"
              onClick={() => handleClickShortUrl(idx)}
              style={{ color: 'blue', cursor: 'pointer' }}
            >
              https://short.url/{url.shortcode}
            </a>
          </div>
          <div>
            <strong>Created At:</strong> {url.createdAt.toLocaleString()}
          </div>
          <div>
            <strong>Expires At:</strong> {url.expiresAt.toLocaleString()}
          </div>
          <div>
            <strong>Total Clicks:</strong> {url.clicks}
          </div>
          {url.clicks > 0 && (
            <div>
              <strong>Click Details:</strong>
              <ul>
                {url.clickDetails.map((click, i) => (
                  <li key={i}>
                    {click.timestamp} - {click.source} - {click.location}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default App;
