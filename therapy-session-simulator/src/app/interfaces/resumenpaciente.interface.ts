import { ProgresoInfo } from "./ProgresoInfo.interface";

export interface ResumenPaciente {
nombre: string;
edad: number;
image: string;
MAIN_CONCERNS: string[];
TREATMENT_GOALS: string[];
progreso?:ProgresoInfo
}