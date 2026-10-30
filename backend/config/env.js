import { config } from "dotenv";

config({path:`.env.${process.env.NODE_ENV||'development'}.local`})

export const{PORT,NODE_ENV,DB_URI,JWT_EXPIRES_IN,JWT_SECRET,JWT_REF_SECRET,CLIENT_ID,JWT_REFRESH_EXPIRES_IN,META_TOKEN}=process.env