import * as React from 'react';
import {MapContext} from 'react-map-gl';

import * as MapPin from './Components/MapMarker.png';

function CustomMarker(props) {
  const context = React.useContext(MapContext);
  
  const {longitude, latitude} = props;

  const [x, y] = context.viewport.project([longitude, latitude]);

  const markerStyle = {
    position: 'absolute',
    background: '#fff',
    left: x,
    top: y
  };

  return (
    <div style={markerStyle} >
      ({longitude}, {latitude})
    </div>
  );
}

export default CustomMarker;