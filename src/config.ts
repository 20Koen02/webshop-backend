import 'dotenv/config';

export const dbName: string = process.env.POSTGRES_DB!;
export const dbUser: string = process.env.POSTGRES_USER!;
export const dbPassword: string = process.env.POSTGRES_PASSWORD!;
export const dbPort: number = 5444;
export const secret: string = process.env.JWT_SECRET!;
export const expiresIn: number = Number(process.env.EXPIRES_IN!);
export const recaptchaPub: string = process.env.RECAPTCHA_PUBLIC!;
export const recaptchaPri: string = process.env.RECAPTCHA_PRIVATE!;
export const maxWrongAttemptsByIPPerDay: number = 100;
export const maxConsecutiveFailsByUsernameAndIP: number = 10;
