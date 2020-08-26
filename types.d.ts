export interface WfObsSt {
  status: { status_code: number; status_message: string };
  device_id: number;
  type: "obs_st";
  source: string;
  summary: {
    pressure_trend: string;
    strike_count_1h: number;
    strike_count_3h: number;
    precip_total_1h: number;
    strike_last_dist: number;
    strike_last_epoch: number;
    precip_accum_local_yesterday: number;
    precip_accum_local_yesterday_final: number;
    precip_analysis_type_yesterday: number;
    feels_like: number;
    heat_index: number;
    wind_chill: number;
  };
  obs: [
    number[],
  ];
}

export interface WfRapidWind {
  device_id: number;
  serial_number: string;
  type: "rapid_wind";
  hub_sn: string;
  ob: number[];
}

export type WfMessageObj = WfObsSt | WfRapidWind;

export type WfData = {
  summary: object;
  rapid_wind: number[][];
  obs_st: number[][];
};
