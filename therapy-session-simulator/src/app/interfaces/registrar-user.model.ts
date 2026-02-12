
export type AuthProvider = 'google' | 'microsoft';
export interface RegisterUserPayload {
    uid: string;
    email: string | null;
    name: string | null;
    photoUrl: string | null;
    provider: AuthProvider;
}
