import { ProgresoInfo } from "./ProgresoInfo.interface";
import { ResumenPaciente } from "./resumenpaciente.interface";

export interface ResumenPacienteExtendido  extends ResumenPaciente {
    progreso?:ProgresoInfo
}