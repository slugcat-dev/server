import { Router } from 'express'
import express from 'express'
import getIndex from './routes/index'
import validateURLParam from './middleware/validateURLParam'
import getImageLqip from './routes/image-lqip'
import getLinkData from './routes/link-data'
import getLinkType from './routes/link-type'
import auth from './middleware/auth'
import getProtected from './routes/protected'
import getProxy from './routes/proxy'
import postUpload from './routes/upload'
import config from './config'

export const router = Router()

router.get('/', getIndex)
router.get('/image-lqip', validateURLParam, getImageLqip)
router.get('/link-data', validateURLParam, getLinkData)
router.get('/link-type', validateURLParam, getLinkType)
router.get('/protected', auth, getProtected)
router.get('/proxy', validateURLParam, getProxy)
router.post('/upload', postUpload)
router.use('/uploads', express.static(config.uploadDir))
