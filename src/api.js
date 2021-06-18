export async function ssurgoService(values, headers) {
  const url = 'https://ag-analytics.azure-api.net/ssurgo-v2';
  return window.fetch(url, {
    method: 'POST',
    headers: headers,
    body: new URLSearchParams(values),
  })
    .then(response => response.json())
    .catch(console.error);
}
