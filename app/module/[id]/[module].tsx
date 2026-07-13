import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MedicineModule } from '@/src/modules/MedicineModule';
import { VitalsModule } from '@/src/modules/VitalsModule';
import { BloodSugarModule } from '@/src/modules/BloodSugarModule';
import { IntakeOutputModule } from '@/src/modules/IntakeOutputModule';
import { NursingNotesModule } from '@/src/modules/NursingNotesModule';
import { CustomChartModule } from '@/src/modules/CustomChartModule';
import { PatientInfoModule } from '@/src/modules/PatientInfoModule';
import { SpecialtyModule } from '@/src/modules/SpecialtyModule';
import type { ModuleKey } from '@/src/data/modules';

const SPECIALTY = ['ivFluid', 'oxygen', 'nebulization', 'tracheostomy', 'rylesTube', 'suction', 'catheter', 'woundDressing', 'gcs', 'painAssessment', 'bradenScale', 'fallRisk'];

export default function ModuleScreen() {
  const { id, module } = useLocalSearchParams<{ id: string; module: string }>();
  if (!id || !module) return null;

  switch (module as ModuleKey) {
    case 'patientInfo': return <PatientInfoModule patientId={id} />;
    case 'medicine': return <MedicineModule patientId={id} />;
    case 'vitals': return <VitalsModule patientId={id} />;
    case 'bloodSugar': return <BloodSugarModule patientId={id} />;
    case 'intakeOutput': return <IntakeOutputModule patientId={id} />;
    case 'nursingNotes': return <NursingNotesModule patientId={id} />;
    case 'customChart': return <CustomChartModule patientId={id} />;
    default:
      if (SPECIALTY.includes(module)) return <SpecialtyModule patientId={id} module={module as ModuleKey} />;
      return null;
  }
}
