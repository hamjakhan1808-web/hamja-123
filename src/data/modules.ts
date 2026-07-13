// All clinical modules that can be toggled per patient.
export const MODULE_KEYS = [
  'patientInfo',
  'medicine',
  'vitals',
  'bloodSugar',
  'intakeOutput',
  'nursingNotes',
  'ivFluid',
  'oxygen',
  'nebulization',
  'tracheostomy',
  'rylesTube',
  'suction',
  'catheter',
  'woundDressing',
  'gcs',
  'painAssessment',
  'bradenScale',
  'fallRisk',
  'customChart',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export type ModuleConfig = Record<ModuleKey, boolean>;

export const MODULE_META: Record<ModuleKey, { label: string; tile: string }> = {
  patientInfo: { label: 'Patient Information', tile: 'tile1' },
  medicine: { label: 'Medicine Schedule', tile: 'tile2' },
  vitals: { label: 'Vital Signs', tile: 'tile3' },
  bloodSugar: { label: 'Blood Sugar', tile: 'tile6' },
  intakeOutput: { label: 'Intake / Output', tile: 'tile5' },
  nursingNotes: { label: 'Nursing Notes', tile: 'tile4' },
  ivFluid: { label: 'IV Fluid', tile: 'tile7' },
  oxygen: { label: 'Oxygen Therapy', tile: 'tile8' },
  nebulization: { label: 'Nebulization', tile: 'tile9' },
  tracheostomy: { label: 'Tracheostomy Care', tile: 'tile10' },
  rylesTube: { label: 'Ryles Tube', tile: 'tile11' },
  suction: { label: 'Suction Record', tile: 'tile12' },
  catheter: { label: 'Catheter Care', tile: 'tile13' },
  woundDressing: { label: 'Wound Dressing', tile: 'tile14' },
  gcs: { label: 'GCS', tile: 'tile15' },
  painAssessment: { label: 'Pain Assessment', tile: 'tile16' },
  bradenScale: { label: 'Braden Scale', tile: 'tile17' },
  fallRisk: { label: 'Fall Risk', tile: 'tile18' },
  customChart: { label: 'Custom Chart', tile: 'tile19' },
};

export function defaultModules(): ModuleConfig {
  return MODULE_KEYS.reduce((acc, k) => {
    acc[k] = true;
    return acc;
  }, {} as ModuleConfig);
}

export function enabledModuleKeys(m: ModuleConfig): ModuleKey[] {
  return MODULE_KEYS.filter((k) => m[k]);
}
