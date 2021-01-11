import 'dotenv/config';

export const dbName: string = process.env.POSTGRES_DB || '';
export const dbUser: string = process.env.POSTGRES_USER || '';
export const dbPassword: string = process.env.POSTGRES_PASSWORD || '';
export const dbPort: number = 5444;
export const secret: string = process.env.JWT_SECRET || 'grxNrEcHseQqC6ZnYWGD88MKx6X9DsMdxBh6fSbJyYihH4xbvm';
export const expiresIn: number = Number(process.env.EXPIRES_IN) || 21600;
