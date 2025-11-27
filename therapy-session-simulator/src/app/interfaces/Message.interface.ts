export interface Message{
    id: string;
    sender:'paciente' | 'terapeuta';
    text: string;
    timestamp: Date;
}