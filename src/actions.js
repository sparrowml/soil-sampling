export const SET_ALGO = "SET_ALGO";
export const SET_SAMPLE_AREA = "SET_SAMPLE_AREA";
export const SET_N_POINTS = "SET_N_POINTS";
export const SET_FIELD_POLYGONS = "SET_FIELD_POLYGONS";
export const SET_FIELD_POINTS = "SET_FIELD_POINTS";
export const SET_FIELD_MUKEYS = "SET_FIELD_MUKEYS";
export const SET_VIEWPORT = "SET_VIEWPORT";

export const SET_TRIGGER = "SET_TRIGGER";
export const setTrigger = (trigger) => ({
  type: SET_TRIGGER,
  trigger,
});
