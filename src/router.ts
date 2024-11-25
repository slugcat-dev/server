import { Router } from 'express'
import express from 'express'
import getIndex from './routes/index'
import validateURLParam from './middleware/validateURLParam'
import getImageLqip from './routes/image-lqip'
import getLinkData from './routes/link-data'
import getLinkType from './routes/link-type'
import postUpload from './routes/upload'
import config from './config'

export const router = Router()

router.get('/', getIndex)
router.get('/image-lqip', validateURLParam, getImageLqip)
router.get('/link-data', validateURLParam, getLinkData)
router.get('/link-type', validateURLParam, getLinkType)
router.post('/upload', postUpload)
router.use('/uploads', express.static(config.uploadDir))
