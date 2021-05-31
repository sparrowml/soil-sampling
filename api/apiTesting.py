import requests
import json
import os
from collections import defaultdict
import pandas as pd
from IPython.display import Image

# API key
SSURGO_apiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

def ssurgo_service(values, files, headers):
    try:
        url = 'https://ag-analytics.azure-api.net/ssurgo-v2'
        
        if files == None:
            response = requests.post(url, data=values,headers = headers).json()
        else:
            response = requests.post(url, files = files, data = values,headers = headers).json()
            
        print(response)
        
        return response
    
    except Exception as e:
        print(e)
        raise e

#Parameters to call SSURGO API
values = {'AOI': '{"geometryType": "esriGeometryPolygon", "features": [{"geometry": {"rings": [[[-85.179, 42.74], [-85.17858886748223, 42.74188232450973], [-85.17858886748223, 42.742675781062474], [-85.1782836915391, 42.742675781062474], [-85.1782226563505, 42.74230956993074], [-85.17529296909521, 42.74230956993074], [-85.17529296909521, 42.74353027370324], [-85.17529296909521, 42.74371337926908], [-85.17492675796348, 42.74389648393566], [-85.17437744126585, 42.744079589501496], [-85.17340087914721, 42.744079589501496], [-85.17327880876996, 42.74749755826576], [-85.17401123013411, 42.74749755826576], [-85.17401123013411, 42.74847412128372], [-85.17529296909521, 42.74847412128372], [-85.17590332008211, 42.74829101571788], [-85.17749023408697, 42.74792480458609], [-85.17761230446422, 42.7470703128447], [-85.1782836915391, 42.746704101712965], [-85.18072509728535, 42.746704101712965], [-85.179, 42.74]]], "spatialReference": {"wkid": 4326}}}]}', 
'Soil_Parameter': 'nccpi2all',
'Projection': 'EPSG:4326', 
'Resolution': 0.00001,
'Product':'GeoJSON'}
file = None

# Basic Header Pattern.
# headers=None
# Header for using a subscription key.
headers={'Content-Type':'application/x-www-form-urlencoded','Ocp-Apim-Subscription-Key': SSURGO_apiKey}

SSURGO_response_GeoJSON = ssurgo_service(values, file, headers)