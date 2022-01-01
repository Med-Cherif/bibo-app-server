import { CorsOptions } from "cors"

const clientsAccepted = ['http://localhost:3000', 'https://localhost:3000']
export const corsOptions = {
    origin: function(origin, callback) {
        if (clientsAccepted.includes(origin || '')) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
} as CorsOptions