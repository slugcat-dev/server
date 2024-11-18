export const env = process.env.NODE_ENV || 'development'
export const port = process.env.SERVER_PORT || '4000'
export const uploadDir = process.env.SERVER_UPLOAD_DIR as string

if (env === 'development') console.warn('Running in development environment')
if (!uploadDir) throw Error('SERVER_UPLOAD_DIR is not defined')
