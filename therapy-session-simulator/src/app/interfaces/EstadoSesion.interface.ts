export interface EstadoSesion {
    tiene_sesion_activa: boolean;
    sesion_id?: string;
    numero_sesion?: number;
    tiempo_transcurrido_minutos?: number;
    tiempo_restante_minutos?: number;
    checklist_actual?: any;
    checklist_completado?: boolean;
    mensaje?: string;
}