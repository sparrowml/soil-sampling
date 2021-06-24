// export async function ssurgoService(values, headers) {
//   const url = 'https://ag-analytics.azure-api.net/ssurgo-v2';
//   return window.fetch(url, {
//     method: 'POST',
//     headers: headers,
//     body: new URLSearchParams(values),
//   })
//     .then(response => response.json())
//     .catch(console.error);
// }

export async function polarisService(minlat, maxlat, minlon, maxlon, vari, layer) {
  const url = `http://152.3.67.2:8000/polaris/${minlon}$${minlat}$${maxlon}$${maxlat}$${layer}$${vari}`;
  console.log(url)
  return window.fetch(url)
    .then(response => {
      console.log(response);
      return response.json();
    })
    .catch(console.error);
}

// import urllib3
// import numpy as np
// import json
// http = urllib3.PoolManager()

// def get_data(minlat,maxlat,minlon,maxlon,var,layer):
//  #Extract box
//  string = '%.6f$%.6f$%.6f$%6f$%s$%s' % (minlon, minlat, maxlon, maxlat, layer, var)
//  r = http.request('GET', 'http://152.3.67.2:8000/polaris/%s' % string)
//  data = json.loads(r.data)
//  for var in data:
//   data[var] = np.array(data[var])
//  return data
